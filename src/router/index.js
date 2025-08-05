import { createRouter, createWebHistory } from 'vue-router';
import nav from '../components/nav.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: nav
  },
  {
    path: '/merge',
    name: 'merge',
    component: () => import('../components/merge.vue')
  },
  {
    path: '/find',
    name: 'find',
    component: () => import('../components/find.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;