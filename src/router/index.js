import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页仪表盘', requiresAuth: true }
      }
    ]
  },
  {
    path: '/products',
    component: Layout,
    redirect: '/products/list',
    meta: { title: '产品管理', requiresAuth: true },
    children: [
      {
        path: 'list',
        name: 'ProductList',
        component: () => import('@/views/products/index.vue'),
        meta: { title: '产品列表', requiresAuth: true }
      },
      {
        path: 'add',
        name: 'ProductAdd',
        component: () => import('@/views/products/ProductForm.vue'),
        meta: { title: '添加产品', requiresAuth: true }
      },
      {
        path: 'edit/:id',
        name: 'ProductEdit',
        component: () => import('@/views/products/ProductForm.vue'),
        meta: { title: '编辑产品', requiresAuth: true }
      }
    ]
  },
  {
    path: '/pricing',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Pricing',
        component: () => import('@/views/pricing/index.vue'),
        meta: { title: '报价管理', requiresAuth: true }
      }
    ]
  },
  {
    path: '/mapping',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Mapping',
        component: () => import('@/views/mapping/index.vue'),
        meta: { title: '配对管理', requiresAuth: true }
      }
    ]
  },
  {
    path: '/statistics',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Statistics',
        component: () => import('@/views/statistics/index.vue'),
        meta: { title: '数据统计', requiresAuth: true }
      }
    ]
  },
  {
    path: '/chat',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Chat',
        component: () => import('@/views/Chat.vue'),
        meta: { title: '智能客服', requiresAuth: true }
      }
    ]
  },
  {
    path: '/settings',
    component: Layout,
    redirect: '/settings/users',
    meta: { title: '系统设置', requiresAuth: true },
    children: [
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/settings/index.vue'),
        meta: { title: '用户管理', requiresAuth: true }
      },
      {
        path: 'channels',
        name: 'Channels',
        component: () => import('@/views/settings/index.vue'),
        meta: { title: '渠道管理', requiresAuth: true }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/settings/index.vue'),
        meta: { title: '分类管理', requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
