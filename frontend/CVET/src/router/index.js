import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';

// Layouts
import DefaultLayout from '../components/layout/DefaultLayout.vue';
import AuthLayout from '../components/layout/AuthLayout.vue';

// Auth
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';

// Dashboard
import Dashboard from '../views/Dashboard.vue';

// Appointments
import AppointmentsList from '../views/appointments/AppointmentsList.vue';
import AppointmentForm from '@/views/appointments/AppointmentForm.vue';

// Импортируем компоненты для услуг
import ServicesList from '../views/services/ServicesList.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { guest: true }
  },
  {
    path: '/appointments',
    name: 'Appointments',
    component: () => import('../views/appointments/AppointmentsList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/appointments/create',
    name: 'CreateAppointment',
    component: () => import('../views/appointments/AppointmentForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/appointments/:id',
    name: 'AppointmentDetails',
    component: () => import('../views/appointments/AppointmentDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/appointments/:id/edit',
    name: 'EditAppointment',
    component: () => import('../views/appointments/AppointmentForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/clients',
    name: 'Clients',
    component: () => import('../views/clients/ClientsList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/clients/create',
    name: 'CreateClient',
    component: () => import('../views/clients/ClientForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/clients/:id',
    name: 'ClientDetails',
    component: () => import('../views/clients/ClientDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/clients/:id/edit',
    name: 'EditClient',
    component: () => import('../views/clients/ClientForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/services',
    name: 'ServicesList',
    component: ServicesList,
    meta: { requiresAuth: true }
  },
  {
    path: '/services/create',
    name: 'CreateService',
    component: () => import('../views/services/ServiceForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/services/:id',
    name: 'ServiceDetails',
    component: () => import('../views/services/ServiceDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/services/:id/edit',
    name: 'EditService',
    component: () => import('../views/services/ServiceForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/branches',
    name: 'Branches',
    component: () => import('../views/branches/BranchesList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/branches/create',
    name: 'CreateBranch',
    component: () => import('../views/branches/BranchForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/branches/:id',
    name: 'BranchDetails',
    component: () => import('../views/branches/BranchDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/branches/:id/edit',
    name: 'EditBranch',
    component: () => import('../views/branches/BranchForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.state.token !== null;
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.meta.guest && isAuthenticated) {
    next({ name: 'Home' });
  } else {
    next();
  }
});

export default router; 