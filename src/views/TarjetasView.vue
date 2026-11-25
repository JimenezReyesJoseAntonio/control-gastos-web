<script setup>
import { onMounted, reactive, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { useTarjetasStore } from '../stores/tarjetas'

const store = useTarjetasStore()
const editing = ref(null)
const form = reactive({ nombre: '', tipo: 'Crédito', fecha_corte: '', fecha_limite_pago: '' })
onMounted(() => store.cargarTarjetas())
async function save() {
  if (!form.nombre) return
  const payload = { ...form, fecha_corte: form.fecha_corte ? Number(form.fecha_corte) : null, fecha_limite_pago: form.fecha_limite_pago ? Number(form.fecha_limite_pago) : null }
  if (editing.value) await store.editarTarjeta(editing.value, payload)
  else await store.crearTarjeta(payload)
  reset()
}
function edit(item) { editing.value = item.id; Object.assign(form, item) }
function reset() { editing.value = null; Object.assign(form, { nombre: '', tipo: 'Crédito', fecha_corte: '', fecha_limite_pago: '' }) }
async function remove(id) { if (confirm('¿Eliminar esta tarjeta?')) await store.eliminarTarjeta(id) }
</script>

<template>
  <div class="min-h-screen bg-slate-50"><AppHeader /><main class="mx-auto max-w-5xl px-4 py-7">
    <h1 class="mb-5 text-2xl font-bold">Tarjetas</h1>
    <div class="grid gap-5 md:grid-cols-[1fr_320px]">
      <div class="grid content-start gap-3"><div v-for="tarjeta in store.tarjetas" :key="tarjeta.id" class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center"><div class="min-w-0 flex-1"><p class="font-bold break-words">{{ tarjeta.nombre }}</p><p class="text-sm text-slate-500">{{ tarjeta.tipo }} · Corte {{ tarjeta.fecha_corte || '-' }} · Límite {{ tarjeta.fecha_limite_pago || '-' }}</p></div><div class="flex shrink-0 gap-1"><button @click="edit(tarjeta)" class="rounded-lg px-3 py-2 text-sm text-violet-700">Editar</button><button @click="remove(tarjeta.id)" class="rounded-lg px-3 py-2 text-sm text-red-500">Eliminar</button></div></div><p v-if="!store.tarjetas.length" class="rounded-2xl bg-white py-10 text-center text-slate-500">Aún no tienes tarjetas.</p></div>
      <form @submit.prevent="save" class="h-fit rounded-2xl bg-white p-5 shadow-sm"><h2 class="mb-4 font-bold">{{ editing ? 'Editar tarjeta' : 'Agregar tarjeta' }}</h2><label class="mb-2 block text-sm">Nombre</label><input v-model="form.nombre" class="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2" /><label class="mb-2 block text-sm">Tipo</label><select v-model="form.tipo" class="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2"><option>Crédito</option><option>Débito</option><option>Efectivo</option></select><label class="mb-2 block text-sm">Fecha de corte</label><input v-model="form.fecha_corte" type="number" min="1" max="31" class="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2" /><label class="mb-2 block text-sm">Fecha límite de pago</label><input v-model="form.fecha_limite_pago" type="number" min="1" max="31" class="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2" /><button class="w-full rounded-xl bg-violet-600 py-3 font-bold text-white">{{ editing ? 'Guardar cambios' : 'Agregar' }}</button><button v-if="editing" type="button" @click="reset" class="mt-2 w-full py-2 text-sm text-slate-500">Cancelar</button></form>
    </div>
  </main></div>
</template>
