import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ChargersView from '../views/ChargersView.vue'
import MapView from '../views/Mapview.vue' // <--- Make sure this line is here

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/chargers',
    name: 'chargers',
    component: ChargersView,
    meta: { requiresAuth: true }
  },
  {
    path: '/map', // <--- Make sure this route is here
    name: 'map',
    component: MapView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('userToken')
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login') // Redirect to login if not authenticated
  } else {
    next() // Proceed to the route
  }
})

export default router
