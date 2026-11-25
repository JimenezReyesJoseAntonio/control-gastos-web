import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import ComprasView from '../views/ComprasView.vue'
import NuevaCompraView from '../views/NuevaCompraView.vue'
import DetalleCompraView from '../views/DetalleCompraView.vue'
import ResumenView from '../views/ResumenView.vue'
import TarjetasView from '../views/TarjetasView.vue'

const routes = [
  { path: '/login', component: LoginView, meta: { public: true } },
  { path: '/registro', component: RegisterView, meta: { public: true } },
  { path: '/dashboard', component: DashboardView, meta: { private: true } },
  { path: '/compras', component: ComprasView, meta: { private: true } },
  { path: '/compras/nueva', component: NuevaCompraView, meta: { private: true } },
  { path: '/compras/:id', component: DetalleCompraView, meta: { private: true } },
  { path: '/resumen', component: ResumenView, meta: { private: true } },
  { path: '/tarjetas', component: TarjetasView, meta: { private: true } },
  { path: '/', redirect: '/dashboard' },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.user) await auth.checkSession()
  if (to.meta.private && !auth.user) return '/login'
  if (to.meta.public && auth.user) return '/dashboard'
})

export default router
