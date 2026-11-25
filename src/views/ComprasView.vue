<script setup>
import { computed, onMounted, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import CompraCard from '../components/CompraCard.vue'
import { useComprasStore } from '../stores/compras'

const compras = useComprasStore()
const filter = ref('todas')
const search = ref('')
onMounted(() => compras.cargarCompras())
const filtered = computed(() => compras.compras.filter((item) => {
  const status = filter.value === 'todas' || item.estatus === (filter.value === 'activas' ? 'activa' : 'liquidada')
  return status && item.que_compre.toLowerCase().includes(search.value.toLowerCase())
}))
async function remove(id) {
  if (confirm('¿Eliminar esta compra y todos sus pagos?')) await compras.eliminarCompra(id)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <AppHeader />
    <main class="mx-auto max-w-6xl px-4 py-7">
      <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h1 class="text-2xl font-bold">Mis compras</h1><RouterLink to="/compras/nueva" class="min-h-11 rounded-xl bg-violet-600 px-4 py-3 text-center font-bold text-white">+ Nueva compra</RouterLink></div>
      <div class="mb-5 flex flex-col gap-3 sm:flex-row">
        <input v-model="search" placeholder="Buscar compra..." class="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3" />
        <select v-model="filter" class="rounded-xl border border-slate-200 bg-white px-4 py-3"><option value="todas">Todas</option><option value="activas">Activas</option><option value="liquidadas">Liquidadas</option></select>
      </div>
      <div class="grid gap-4 md:grid-cols-2"><CompraCard v-for="compra in filtered" :key="compra.id" :compra="compra" :pagos="compras.pagos" @mark="compras.marcarSiguiente" @delete="remove" /></div>
      <p v-if="!filtered.length" class="py-12 text-center text-slate-500">No hay compras para mostrar.</p>
    </main>
  </div>
</template>
