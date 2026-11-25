<script setup>
import { computed, onMounted } from 'vue'
import { format, addMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import AppHeader from '../components/AppHeader.vue'
import ResumenCard from '../components/ResumenCard.vue'
import CompraCard from '../components/CompraCard.vue'
import { useComprasStore } from '../stores/compras'
import { useAuthStore } from '../stores/auth'

const compras = useComprasStore()
const auth = useAuthStore()
const month = format(new Date(), 'yyyy-MM')
const nextMonth = format(addMonths(new Date(), 1), 'yyyy-MM')
const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
const monthTotals = computed(() => compras.totalesPorMes(month))
const monthPayments = computed(() => compras.pagos.filter((item) => item.mes.slice(0, 7) === month))
const nextPayments = computed(() => compras.pagos.filter((item) => item.mes.slice(0, 7) === nextMonth).slice(0, 5))
const active = computed(() => compras.compras.filter((item) => item.estatus === 'activa').slice(0, 5))

onMounted(() => compras.cargarCompras())
async function mark(pago) { await compras.marcarPago(pago, !pago.pagado) }
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <AppHeader />
    <main class="mx-auto max-w-6xl px-4 py-7">
      <div class="mb-6 flex items-end justify-between">
        <div><p class="text-sm text-violet-700">{{ format(new Date(), 'MMMM yyyy', { locale: es }) }}</p><h1 class="mt-1 text-2xl font-bold">Hola, {{ auth.username }}</h1></div>
        <RouterLink to="/compras/nueva" class="rounded-xl bg-violet-600 px-4 py-3 font-bold text-white">+ Agregar compra</RouterLink>
      </div>
      <section class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ResumenCard title="Debes este mes" :value="money(monthTotals.pendiente)" color="red" />
        <ResumenCard title="Ya pagaste este mes" :value="money(monthTotals.pagado)" color="green" />
        <ResumenCard title="Te falta por pagar" :value="money(compras.totalDeuda)" color="red" />
        <ResumenCard title="Total gastado" :value="money(compras.totalComprado)" />
      </section>
      <section class="mt-7">
        <h2 class="mb-3 text-lg font-bold">Pagos de este mes</h2>
        <div class="divide-y rounded-2xl border border-slate-100 bg-white px-4 shadow-sm">
          <p v-if="!monthPayments.length" class="py-6 text-center text-sm text-slate-500">No hay pagos este mes.</p>
          <label v-for="pago in monthPayments" :key="pago.id" class="flex items-center gap-3 py-4">
            <input type="checkbox" :checked="pago.pagado" @change="mark(pago)" class="h-5 w-5 accent-emerald-500" />
            <div class="flex-1"><p class="font-semibold">{{ pago.compras?.que_compre || 'Compra' }}</p><p class="text-sm text-slate-500">{{ pago.compras?.tarjetas?.nombre || 'Sin tarjeta' }}</p></div>
            <span :class="pago.pagado ? 'text-emerald-600' : 'text-red-500'" class="font-bold">{{ money(pago.monto) }}</span>
          </label>
        </div>
      </section>
      <section class="mt-7">
        <h2 class="mb-3 text-lg font-bold">Próximos pagos</h2>
        <div class="grid gap-3 md:grid-cols-2">{{ nextPayments.length ? '' : '' }}<div v-for="pago in nextPayments" :key="pago.id" class="flex justify-between rounded-xl bg-white p-4 shadow-sm"><span>{{ pago.compras?.que_compre }}</span><b>{{ money(pago.monto) }}</b></div></div>
      </section>
      <section class="mt-7">
        <h2 class="mb-3 text-lg font-bold">Mis compras activas</h2>
        <div class="grid gap-4 md:grid-cols-2"><CompraCard v-for="compra in active" :key="compra.id" :compra="compra" :pagos="compras.pagos" @mark="compras.marcarSiguiente" @delete="compras.eliminarCompra" /></div>
      </section>
    </main>
  </div>
</template>
