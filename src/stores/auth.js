import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const cleanUsername = (value) => value.trim().toLowerCase()
const internalEmail = (username) => `${cleanUsername(username)}@miscompras.app`

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const username = ref('')

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    if (user.value) await loadUsername()
  }

  const loadUsername = async () => {
    const { data } = await supabase.from('profiles').select('username').eq('id', user.value.id).single()
    username.value = data?.username ?? cleanUsername(user.value.email?.split('@')[0] ?? '')
  }

  const register = async (name, password) => {
    const clean = cleanUsername(name)
    if (!/^[a-zA-Z0-9_-]{3,}$/.test(clean)) throw new Error('El nombre debe tener al menos 3 caracteres y no contener espacios.')
    if (password.length < 4) throw new Error('La contraseña debe tener al menos 4 caracteres.')

    const { data: existing } = await supabase.from('profiles').select('username').eq('username', clean).maybeSingle()
    if (existing) throw new Error('Ese nombre ya está en uso')

    const { data, error } = await supabase.auth.signUp({
      email: internalEmail(clean),
      password,
      options: { data: { username: clean } },
    })
    if (error) throw new Error(error.message.includes('registered') ? 'Ese nombre ya está en uso' : error.message)
    if (!data.user) throw new Error('No se pudo crear la cuenta.')

    const { error: profileError } = await supabase.from('profiles').insert({ id: data.user.id, username: clean })
    if (profileError) throw new Error(profileError.message)

    user.value = data.user
    username.value = clean
  }

  const login = async (name, password) => {
    const clean = cleanUsername(name)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: internalEmail(clean),
      password,
    })
    if (error) throw new Error('Nombre o contraseña incorrectos')
    user.value = data.user
    await loadUsername()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    user.value = null
    username.value = ''
  }

  return { user, username, register, login, logout, checkSession }
})
