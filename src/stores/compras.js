import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { addMonths, format, startOfMonth } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'

export const useComprasStore = defineStore('compras', () => {
  const compras = ref([])
  const pagos = ref([])

  const cargarCompras = async () => {
    const auth = useAuthStore()
    if (!auth.user) return
    const [comprasResult, pagosResult] = await Promise.all([
      supabase.from('compras').select('*, tarjetas(nombre)').eq('user_id', auth.user.id).order('created_at', { ascending: false }),
      supabase.from('pagos').select('*, compras(que_compre, tarjeta_id, tarjetas(nombre))').eq('user_id', auth.user.id).order('mes'),
    ])
    if (comprasResult.error) throw comprasResult.error
    if (pagosResult.error) throw pagosResult.error
    compras.value = comprasResult.data ?? []
    pagos.value = pagosResult.data ?? []
  }

  const crearCompra = async (payload) => {
    const auth = useAuthStore()
    const months = Number(payload.meses)
    const monthly = Math.round((Number(payload.total) / months + Number.EPSILON) * 100) / 100
    const start = startOfMonth(new Date(`${payload.mes_inicio}-01T00:00:00`))
    const end = addMonths(start, months - 1)

    const { data: compra, error } = await supabase.from('compras').insert({
      user_id: auth.user.id,
      tarjeta_id: payload.tarjeta_id || null,
      que_compre: payload.que_compre,
      tienda: payload.tienda || null,
      fecha_compra: payload.fecha_compra,
      total: Number(payload.total),
      meses: months,
      mensualidad: monthly,
      mes_inicio: format(start, 'yyyy-MM-dd'),
      mes_fin: format(end, 'yyyy-MM-dd'),
      estatus: 'activa',
      nota: payload.nota || null,
    }).select('*, tarjetas(nombre)').single()
    if (error) throw error

    const generated = Array.from({ length: months }, (_, index) => ({
      user_id: auth.user.id,
      compra_id: compra.id,
      mes: format(addMonths(start, index), 'yyyy-MM-dd'),
      monto: index === months - 1
        ? Math.round((Number(payload.total) - monthly * (months - 1) + Number.EPSILON) * 100) / 100
        : monthly,
      pagado: false,
      fecha_pago: null,
    }))
    const { error: pagosError } = await supabase.from('pagos').insert(generated)
    if (pagosError) throw pagosError
    compras.value.unshift(compra)
  }

  const marcarPago = async (pago, pagado) => {
    const auth = useAuthStore()
    const { data, error } = await supabase
      .from('pagos')
      .update({ pagado, fecha_pago: pagado ? format(new Date(), 'yyyy-MM-dd') : null })
      .eq('id', pago.id)
      .eq('user_id', auth.user.id)
      .select()
      .single()
    if (error) throw error
    const index = pagos.value.findIndex((item) => item.id === pago.id)
    if (index >= 0) pagos.value[index] = { ...pagos.value[index], ...data }

    const { data: remaining } = await supabase
      .from('pagos')
      .select('id')
      .eq('compra_id', pago.compra_id)
      .eq('pagado', false)
    const estatus = remaining?.length ? 'activa' : 'liquidada'
    await supabase.from('compras').update({ estatus }).eq('id', pago.compra_id).eq('user_id', auth.user.id)
    const compraIndex = compras.value.findIndex((item) => item.id === pago.compra_id)
    if (compraIndex >= 0) compras.value[compraIndex].estatus = estatus
  }

  const marcarSiguiente = async (compraId) => {
    const pago = pagos.value
      .filter((item) => item.compra_id === compraId && !item.pagado)
      .sort((a, b) => a.mes.localeCompare(b.mes))[0]
    if (pago) await marcarPago(pago, true)
  }

  const eliminarCompra = async (id) => {
    const auth = useAuthStore()
    const { error } = await supabase.from('compras').delete().eq('id', id).eq('user_id', auth.user.id)
    if (error) throw error
    compras.value = compras.value.filter((item) => item.id !== id)
    pagos.value = pagos.value.filter((item) => item.compra_id !== id)
  }

  const currentMonth = format(new Date(), 'yyyy-MM')
  const totalesPorMes = (month = currentMonth) => {
    const selected = pagos.value.filter((item) => item.mes.slice(0, 7) === month)
    return {
      pagado: selected.filter((item) => item.pagado).reduce((sum, item) => sum + Number(item.monto), 0),
      pendiente: selected.filter((item) => !item.pagado).reduce((sum, item) => sum + Number(item.monto), 0),
    }
  }

  const totalDeuda = computed(() => pagos.value.filter((item) => !item.pagado).reduce((sum, item) => sum + Number(item.monto), 0))
  const totalPagado = computed(() => pagos.value.filter((item) => item.pagado).reduce((sum, item) => sum + Number(item.monto), 0))
  const totalComprado = computed(() => compras.value.reduce((sum, item) => sum + Number(item.total), 0))

  return { compras, pagos, cargarCompras, crearCompra, marcarPago, marcarSiguiente, eliminarCompra, totalesPorMes, totalDeuda, totalPagado, totalComprado }
})
