<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import AppHeader from '../components/AppHeader.vue'
import { useComprasStore } from '../stores/compras'

const route = useRoute()
const router = useRouter()
const compras = useComprasStore()
const compra = computed(() => compras.compras.find((item) => item.id === Number(route.params.id)))
const pagos = computed(() => compras.pagos.filter((item) => item.compra_id === Number(route.params.id)).sort((a, b) => a.mes.localeCompare(b.mes)))
const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
onMounted(() => compras.cargarCompras())
async function markAll(pagado) {
  for (const pago of pagos.value) await compras.marcarPago(pago, pagado)
}
async function remove() {
  if (confirm('¿Eliminar esta compra y todos sus pagos?')) { await compras.eliminarCompra(Number(route.params.id)); router.push('/compras') }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50"><AppHeader /><main class="mx-auto max-w-4xl px-4 py-7">
    <template v-if="compra">
      <div class="mb-5 rounded-2xl bg-white p-5 shadow-sm"><h1 class="text-2xl font-bold">{{ compra.que_compre }}</h1><p class="text-slate-500">{{ compra.tienda || 'Sin tienda' }} · {{ compra.tarjetas?.nombre || 'Sin tarjeta' }}</p><div class="mt-4 flex gap-6"><div><span class="text-sm text-slate-500">Total</span><p class="font-bold">{{ money(compra.total) }}</p></div><div><span class="text-sm text-slate-500">Mensualidad</span><p class="font-bold">{{ money(compra.mensualidad) }}</p></div></div></div>
      <div class="mb-4 flex flex-wrap gap-2"><button @click="markAll(true)" class="min-h-11 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Marcar todos</button><button @click="markAll(false)" class="min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm">Desmarcar</button><button @click="remove" class="min-h-11 rounded-lg px-4 py-2 text-sm text-red-500 sm:ml-auto">Eliminar compra</button></div>
      <div class="divide-y rounded-2xl bg-white px-4 shadow-sm"><label v-for="pago in pagos" :key="pago.id" class="flex items-center gap-3 py-4"><input type="checkbox" :checked="pago.pagado" @change="compras.marcarPago(pago, !pago.pagado)" class="h-5 w-5 accent-emerald-500" /><div class="flex-1"><p class="font-semibold">{{ format(new Date(`${pago.mes}T00:00:00`), 'MMMM yyyy', { locale: es }) }}</p><p class="text-sm" :class="pago.pagado ? 'text-emerald-600' : 'text-red-500'">{{ pago.pagado ? 'Pagado' : 'Pendiente' }}</p></div><b>{{ money(pago.monto) }}</b></label></div>
    </template>
  </main></div>
</template>
