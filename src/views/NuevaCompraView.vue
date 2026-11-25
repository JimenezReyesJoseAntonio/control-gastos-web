<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { addMonths, format } from 'date-fns'
import { es } from 'date-fns/locale'
import AppHeader from '../components/AppHeader.vue'
import { useTarjetasStore } from '../stores/tarjetas'
import { useComprasStore } from '../stores/compras'

const router = useRouter()
const tarjetas = useTarjetasStore()
const compras = useComprasStore()
const form = reactive({ que_compre: '', tienda: '', fecha_compra: format(new Date(), 'yyyy-MM-dd'), total: '', tarjeta_id: '', tipo_pago: 'unico', meses: 1, mes_inicio: format(addMonths(new Date(), 1), 'yyyy-MM'), nota: '' })
const error = ref('')
const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
const mesesCalculados = computed(() => form.tipo_pago === 'unico' ? 1 : Number(form.meses))
const mensualidad = computed(() => Number(form.total) > 0 && mesesCalculados.value >= 1 ? Number(form.total) / mesesCalculados.value : 0)
const rango = computed(() => {
  if (!form.mes_inicio || mesesCalculados.value < 1) return ''
  const start = new Date(`${form.mes_inicio}-01T00:00:00`)
  const end = addMonths(start, mesesCalculados.value - 1)
  return `${format(start, 'MMM yyyy', { locale: es })} a ${format(end, 'MMM yyyy', { locale: es })}`
})
function seleccionarTipoPago(tipo) {
  form.tipo_pago = tipo
  form.meses = tipo === 'unico' ? 1 : ''
}
onMounted(() => tarjetas.cargarTarjetas())
async function save() {
  error.value = ''
  if (!form.que_compre || Number(form.total) <= 0) { error.value = 'Completa el nombre y un total válido.'; return }
  if (form.tipo_pago === 'mensual' && (!Number.isInteger(mesesCalculados.value) || mesesCalculados.value < 2)) {
    error.value = 'Indica cuántos meses son, al menos 2.'
    return
  }
  try { await compras.crearCompra(form); router.push('/compras') } catch (e) { error.value = e.message }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <AppHeader />
    <main class="mx-auto max-w-4xl px-4 py-7">
      <h1 class="mb-5 text-2xl font-bold">Nueva compra</h1>
      <form @submit.prevent="save" class="grid gap-5 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2">
        <div class="md:col-span-2"><label class="mb-2 block text-sm font-semibold">Qué compraste *</label><input v-model="form.que_compre" class="w-full rounded-xl border border-slate-200 px-4 py-3" /></div>
        <div><label class="mb-2 block text-sm font-semibold">Tienda</label><input v-model="form.tienda" class="w-full rounded-xl border border-slate-200 px-4 py-3" /></div>
        <div><label class="mb-2 block text-sm font-semibold">Fecha de compra</label><input v-model="form.fecha_compra" type="date" class="w-full rounded-xl border border-slate-200 px-4 py-3" /></div>
        <div><label class="mb-2 block text-sm font-semibold">Total *</label><input v-model="form.total" type="number" min="0.01" step="0.01" class="w-full rounded-xl border border-slate-200 px-4 py-3" /></div>
        <div><label class="mb-2 block text-sm font-semibold">Tarjeta</label><select v-model="form.tarjeta_id" class="w-full rounded-xl border border-slate-200 px-4 py-3"><option value="">Sin tarjeta</option><option v-for="tarjeta in tarjetas.tarjetas" :key="tarjeta.id" :value="tarjeta.id">{{ tarjeta.nombre }}</option></select></div>
        <div><label class="mb-2 block text-sm font-semibold">Tipo de pago</label><div class="flex gap-4 rounded-xl border border-slate-200 px-4 py-3"><label><input type="radio" value="unico" :checked="form.tipo_pago === 'unico'" @change="seleccionarTipoPago('unico')" /> 1 pago</label><label><input type="radio" value="mensual" :checked="form.tipo_pago === 'mensual'" @change="seleccionarTipoPago('mensual')" /> A meses</label></div></div>
        <div v-if="form.tipo_pago === 'mensual'"><label class="mb-2 block text-sm font-semibold">Meses</label><input v-model="form.meses" type="number" min="2" step="1" placeholder="Ej. 6" class="w-full rounded-xl border border-slate-200 px-4 py-3" /></div>
        <div><label class="mb-2 block text-sm font-semibold">Mes que empieza</label><input v-model="form.mes_inicio" type="month" class="w-full rounded-xl border border-slate-200 px-4 py-3" /></div>
        <div class="md:col-span-2"><label class="mb-2 block text-sm font-semibold">Nota</label><textarea v-model="form.nota" class="w-full rounded-xl border border-slate-200 px-4 py-3"></textarea></div>
        <div class="md:col-span-2 rounded-xl bg-violet-50 p-4 text-violet-800">Vas a pagar <b>{{ money(mensualidad) }}</b> al mes, de <b>{{ rango }}</b>.</div>
        <p v-if="error" class="md:col-span-2 text-sm text-red-600">{{ error }}</p>
        <div class="md:col-span-2 flex gap-3"><button class="flex-1 rounded-xl bg-violet-600 py-3 font-bold text-white">Guardar compra</button><RouterLink to="/compras" class="rounded-xl border border-slate-200 px-5 py-3">Cancelar</RouterLink></div>
      </form>
    </main>
  </div>
</template>
