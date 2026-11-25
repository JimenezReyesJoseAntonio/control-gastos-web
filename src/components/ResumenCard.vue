<script setup>
defineProps({ title: String, value: [String, Number], color: { type: String, default: 'violet' } })
</script>

<template>
  <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
    <p class="text-sm text-slate-500">{{ title }}</p>
    <p class="mt-2 text-2xl font-bold" :class="color === 'green' ? 'text-emerald-600' : color === 'red' ? 'text-red-500' : 'text-violet-700'">{{ value }}</p>
  </div>
</template>
