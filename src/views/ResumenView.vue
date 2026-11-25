<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import AppHeader from '../components/AppHeader.vue'
import ResumenCard from '../components/ResumenCard.vue'
import { useComprasStore } from '../stores/compras'

const compras = useComprasStore()
const tab = ref('mes')
const month = ref(format(new Date(), 'yyyy-MM'))
const year = ref(format(new Date(), 'yyyy'))
const chartEl = ref(null)
let chart
const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
const monthPayments = computed(() => compras.pagos.filter((item) => item.mes.slice(0, 7) === month.value))
const monthTotals = computed(() => compras.totalesPorMes(month.value))
const annual = computed(() => {
  const months = Array.from({ length: 12 }, (_, index) => {
    const key = `${year.value}-${String(index + 1).padStart(2, '0')}`
    const data = compras.pagos.filter((item) => item.mes.slice(0, 7) === key)
    return {
      label: format(new Date(Number(year.value), index, 1), 'MMM', { locale: es }),
      pagado: data.filter((item) => item.pagado).reduce((sum, item) => sum + Number(item.monto), 0),
      pendiente: data.filter((item) => !item.pagado).reduce((sum, item) => sum + Number(item.monto), 0),
    }
  })
  return months
})
const annualPaid = computed(() => annual.value.reduce((sum, item) => sum + item.pagado, 0))
const annualPending = computed(() => annual.value.reduce((sum, item) => sum + item.pendiente, 0))
async function renderChart() {
  await nextTick()
  if (!chartEl.value) return
  chart ??= echarts.init(chartEl.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 20, right: 10, bottom: 35, containLabel: true },
    xAxis: { type: 'category', data: annual.value.map((item) => item.label) },
    yAxis: { type: 'value' },
    series: [
      { name: 'Pagado', type: 'bar', data: annual.value.map((item) => item.pagado), itemStyle: { color: '#10b981' } },
      { name: 'Pendiente', type: 'bar', data: annual.value.map((item) => item.pendiente), itemStyle: { color: '#ef4444' } },
    ],
  })
}
watch([tab, year], () => { if (tab.value === 'ano') renderChart() })
function resizeChart() { chart?.resize() }
onMounted(async () => {
  await compras.cargarCompras()
  renderChart()
  window.addEventListener('resize', resizeChart)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chart?.dispose()
})
function exportCsv() {
  const rows = [['Mes', 'Compra', 'Monto', 'Estado'], ...monthPayments.value.map((p) => [p.mes, p.compras?.que_compre || 'Compra', p.monto, p.pagado ? 'Pagado' : 'Pendiente'])]
  const blob = new Blob([rows.map((row) => row.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `resumen-${month.value}.csv`; link.click()
}
</script>

<template>
  <div class="min-h-screen bg-slate-50"><AppHeader /><main class="mx-auto max-w-6xl px-4 py-7">
    <h1 class="mb-5 text-2xl font-bold">Resumen</h1>
    <div class="mb-5 inline-flex rounded-xl bg-white p-1 shadow-sm"><button @click="tab='mes'" class="rounded-lg px-4 py-2" :class="tab==='mes'?'bg-violet-600 text-white':''">Por mes</button><button @click="tab='ano'" class="rounded-lg px-4 py-2" :class="tab==='ano'?'bg-violet-600 text-white':''">Por año</button></div>
    <section v-if="tab==='mes'">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:justify-between"><input v-model="month" type="month" class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 sm:w-auto" /><button @click="exportCsv" class="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">Exportar CSV</button></div>
      <div class="grid gap-3 sm:grid-cols-3"><ResumenCard title="Total pagado" :value="money(monthTotals.pagado)" color="green" /><ResumenCard title="Total pendiente" :value="money(monthTotals.pendiente)" color="red" /><ResumenCard title="Total a pagar" :value="money(monthTotals.pagado + monthTotals.pendiente)" /></div>
      <div class="mt-5 divide-y rounded-2xl bg-white px-4 shadow-sm"><p v-if="!monthPayments.length" class="py-8 text-center text-slate-500">No hay pagos para este mes.</p><div v-for="pago in monthPayments" :key="pago.id" class="flex items-center py-4"><div class="flex-1"><p class="font-semibold">{{ pago.compras?.que_compre || 'Compra' }}</p><p class="text-sm text-slate-500">{{ pago.compras?.tarjetas?.nombre || 'Sin tarjeta' }}</p></div><b>{{ money(pago.monto) }}</b><span class="ml-4 rounded-full px-2 py-1 text-xs" :class="pago.pagado?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-600'">{{ pago.pagado?'Pagado':'Pendiente' }}</span></div></div>
    </section>
    <section v-else>
      <input v-model="year" type="number" min="2020" max="2100" class="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3" />
      <div class="mb-5 grid gap-3 sm:grid-cols-2"><ResumenCard title="Total anual pagado" :value="money(annualPaid)" color="green" /><ResumenCard title="Total anual pendiente" :value="money(annualPending)" color="red" /></div>
      <div ref="chartEl" class="h-96 rounded-2xl bg-white p-3 shadow-sm"></div>
    </section>
  </main></div>
</template>
