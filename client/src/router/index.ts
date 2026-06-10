import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue'),
    },
    {
      path: '/',
      component: () => import('@/components/Layout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue'),
        },
        {
          path: 'rooms',
          name: 'Rooms',
          component: () => import('@/views/RoomList.vue'),
        },
        {
          path: 'rooms/:id',
          name: 'RoomDetail',
          component: () => import('@/views/RoomDetail.vue'),
        },
        {
          path: 'reservations',
          name: 'Reservations',
          component: () => import('@/views/ReservationList.vue'),
        },
        {
          path: 'reservations/create',
          name: 'ReservationCreate',
          component: () => import('@/views/ReservationCreate.vue'),
        },
        {
          path: 'checkin',
          name: 'Checkin',
          component: () => import('@/views/Checkin.vue'),
        },
        {
          path: 'statistics',
          name: 'Statistics',
          component: () => import('@/views/Statistics.vue'),
        },
      ],
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  if (!token && to.path !== '/login' && to.path !== '/register') {
    next('/login');
  } else {
    next();
  }
});

export default router;
