<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')
async function submit() {
  error.value = ''
  try { await auth.login(username.value, password.value); router.push('/dashboard') }
  catch (e) { error.value = e.message }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <form @submit.prevent="submit" class="w-full max-w-md rounded-3xl bg-white p-7 shadow-lg">
      <div class="mb-7 text-center">
        <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-xl text-white">M</div>
        <h1 class="text-2xl font-bold text-slate-900">Mis Compras</h1>
      </div>
      <label class="mb-2 block text-sm font-semibold text-slate-700">Nombre de usuario</label>
      <input v-model="username" class="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500" autocomplete="username" />
      <label class="mb-2 block text-sm font-semibold text-slate-700">Contraseña</label>
      <input v-model="password" type="password" class="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500" autocomplete="current-password" />
      <p v-if="error" class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{{ error }}</p>
      <button class="w-full rounded-xl bg-violet-600 py-3 font-bold text-white">Entrar</button>
      <RouterLink to="/registro" class="mt-5 block text-center text-sm font-semibold text-violet-700">Crear una cuenta</RouterLink>
    </form>
  </main>
</template>
