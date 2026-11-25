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
  try { await auth.register(username.value, password.value); router.push('/dashboard') }
  catch (e) { error.value = e.message }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <form @submit.prevent="submit" class="w-full max-w-md rounded-3xl bg-white p-7 shadow-lg">
      <h1 class="mb-6 text-center text-2xl font-bold text-slate-900">Crear cuenta</h1>
      <label class="mb-2 block text-sm font-semibold">Nombre de usuario</label>
      <input v-model="username" class="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3" autocomplete="username" />
      <label class="mb-2 block text-sm font-semibold">Contraseña</label>
      <input v-model="password" type="password" class="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3" autocomplete="new-password" />
      <p v-if="error" class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{{ error }}</p>
      <button class="w-full rounded-xl bg-violet-600 py-3 font-bold text-white">Crear cuenta</button>
      <RouterLink to="/login" class="mt-5 block text-center text-sm font-semibold text-violet-700">Ya tengo una cuenta</RouterLink>
    </form>
  </main>
</template>
