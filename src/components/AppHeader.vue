<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
async function logout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
      <RouterLink to="/dashboard" class="text-lg font-bold text-violet-700">Mis Compras</RouterLink>
      <nav class="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
        <RouterLink to="/dashboard">Inicio</RouterLink>
        <RouterLink to="/compras">Compras</RouterLink>
        <RouterLink to="/resumen">Resumen</RouterLink>
        <RouterLink to="/tarjetas">Tarjetas</RouterLink>
      </nav>
      <div class="flex items-center gap-3">
        <span class="hidden text-sm text-slate-600 sm:block">Hola, {{ auth.username }}</span>
        <button @click="logout" class="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">Cerrar sesión</button>
      </div>
    </div>
  </header>
</template>
