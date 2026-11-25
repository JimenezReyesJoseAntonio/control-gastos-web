import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'

export const useTarjetasStore = defineStore('tarjetas', () => {
  const tarjetas = ref([])

  const cargarTarjetas = async () => {
    const auth = useAuthStore()
    if (!auth.user) return
    const { data, error } = await supabase
      .from('tarjetas')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('created_at')
    if (error) throw error
    tarjetas.value = data ?? []
  }

  const crearTarjeta = async (payload) => {
    const auth = useAuthStore()
    const { data, error } = await supabase
      .from('tarjetas')
      .insert({ ...payload, user_id: auth.user.id })
      .select()
      .single()
    if (error) throw error
    tarjetas.value.push(data)
  }

  const editarTarjeta = async (id, payload) => {
    const auth = useAuthStore()
    const { data, error } = await supabase
      .from('tarjetas')
      .update(payload)
      .eq('id', id)
      .eq('user_id', auth.user.id)
      .select()
      .single()
    if (error) throw error
    const index = tarjetas.value.findIndex((item) => item.id === id)
    if (index >= 0) tarjetas.value[index] = data
  }

  const eliminarTarjeta = async (id) => {
    const auth = useAuthStore()
    const { error } = await supabase
      .from('tarjetas')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.user.id)
    if (error) throw error
    tarjetas.value = tarjetas.value.filter((item) => item.id !== id)
  }

  return { tarjetas, cargarTarjetas, crearTarjeta, editarTarjeta, eliminarTarjeta }
})
