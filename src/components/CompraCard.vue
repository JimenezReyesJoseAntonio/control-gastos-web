<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const props = defineProps({ compra: Object, pagos: Array })
defineEmits(['mark', 'delete'])

const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
const compraPagos = computed(() => props.pagos.filter((item) => item.compra_id === props.compra.id))
const paid = computed(() => compraPagos.value.filter((item) => item.pagado).length)
const progress = computed(() => props.compra.meses ? Math.round(paid.value / props.compra.meses * 100) : 0)
const end = computed(() => props.compra.mes_fin ? format(new Date(`${props.compra.mes_fin}T00:00:00`), 'MMM yyyy', { locale: es }) : '')
</script>

<template>
  <article class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <h3 class="font-bold text-slate-900">{{ compra.que_compre }}</h3>
        <p class="text-sm text-slate-500">{{ compra.tienda || 'Sin tienda' }} · {{ compra.tarjetas?.nombre || 'Sin tarjeta' }}</p>
      </div>
      <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="compra.estatus === 'liquidada' ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'">
        {{ compra.estatus === 'liquidada' ? 'Liquidada' : 'Activa' }}
      </span>
    </div>
    <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
      <div><p class="text-slate-500">Total</p><p class="font-bold">{{ money(compra.total) }}</p></div>
      <div><p class="text-slate-500">Mensualidad</p><p class="font-bold">{{ money(compra.mensualidad) }}</p></div>
    </div>
    <div class="mt-4">
      <div class="mb-1 flex justify-between text-xs text-slate-500"><span>Avance {{ paid }}/{{ compra.meses }}</span><span>Termina {{ end }}</span></div>
      <div class="h-2 rounded-full bg-slate-100"><div class="h-2 rounded-full bg-emerald-500 transition-all" :style="{ width: progress + '%' }"></div></div>
    </div>
    <div class="mt-5 flex flex-wrap gap-2">
      <RouterLink :to="`/compras/${compra.id}`" class="rounded-lg border border-slate-200 px-3 py-2 text-sm">Ver detalle</RouterLink>
      <button v-if="compra.estatus !== 'liquidada'" @click="$emit('mark', compra.id)" class="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white">Marcar siguiente</button>
      <button @click="$emit('delete', compra.id)" class="ml-auto rounded-lg px-3 py-2 text-sm text-red-500">Eliminar</button>
    </div>
  </article>
</template>
