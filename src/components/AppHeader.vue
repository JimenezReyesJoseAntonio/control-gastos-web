<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)
async function logout() {
  await auth.logout()
  router.push('/login')
}
watch(() => router.currentRoute.value.fullPath, () => {
  menuOpen.value = false
})
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
      <RouterLink to="/dashboard" class="text-lg font-bold text-violet-700">Mis Compras</RouterLink>
      <nav class="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
        <RouterLink to="/dashboard">Inicio</RouterLink>
        <RouterLink to="/compras">Compras</RouterLink>
        <RouterLink to="/resumen">Resumen</RouterLink>
        <RouterLink to="/tarjetas">Tarjetas</RouterLink>
      </nav>
      <div class="flex items-center gap-2">
        <span class="hidden text-sm text-slate-600 sm:block">Hola, {{ auth.username }}</span>
        <button @click="logout" class="hidden min-h-10 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 sm:block">Cerrar sesión</button>
        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden"
          :aria-expanded="menuOpen"
          aria-label="Abrir menú"
          @click="menuOpen = !menuOpen"
        >
          <span v-if="!menuOpen" class="text-xl" aria-hidden="true">☰</span>
          <span v-else class="text-xl" aria-hidden="true">×</span>
        </button>
      </div>
    </div>
    <nav v-if="menuOpen" class="border-t border-slate-100 bg-white px-3 py-2 md:hidden">
      <div class="mx-auto grid max-w-6xl grid-cols-2 gap-2">
        <RouterLink to="/dashboard" class="min-h-11 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-violet-50">Inicio</RouterLink>
        <RouterLink to="/compras" class="min-h-11 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-violet-50">Compras</RouterLink>
        <RouterLink to="/resumen" class="min-h-11 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-violet-50">Resumen</RouterLink>
        <RouterLink to="/tarjetas" class="min-h-11 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-violet-50">Tarjetas</RouterLink>
        <button @click="logout" class="col-span-2 min-h-11 rounded-xl bg-slate-100 px-3 py-3 text-left text-sm font-semibold text-red-600">Cerrar sesión</button>
      </div>
    </nav>
  </header>
</template>
