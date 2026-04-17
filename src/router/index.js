import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '数据概览', icon: 'DataAnalysis' }
      }
    ]
  },
  {
    path: '/user',
    component: () => import('@/layout/index.vue'),
    redirect: '/user/list',
    meta: { title: '用户端管理', icon: 'User' },
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: () => import('@/views/user/list.vue'),
        meta: { title: '用户列表', icon: 'UserFilled' }
      },
      {
        path: 'admin',
        name: 'AdminList',
        component: () => import('@/views/user/admin.vue'),
        meta: { title: '管理员管理', icon: 'Key' }
      }
    ]
  },
  {
    path: '/player',
    component: () => import('@/layout/index.vue'),
    redirect: '/player/list',
    meta: { title: '打手端管理', icon: 'Aim' },
    children: [
      {
        path: 'list',
        name: 'PlayerList',
        component: () => import('@/views/player/list.vue'),
        meta: { title: '打手列表', icon: 'List' }
      },
      {
        path: 'detail/:id',
        name: 'PlayerDetail',
        component: () => import('@/views/player/detail.vue'),
        meta: { title: '打手详情', icon: 'Document', hidden: true }
      },
      {
        path: 'order',
        name: 'PlayerOrder',
        component: () => import('@/views/player/order.vue'),
        meta: { title: '订单管理', icon: 'ShoppingCart' }
      }
    ]
  },
  {
    path: '/customer',
    component: () => import('@/layout/index.vue'),
    redirect: '/customer/ranking',
    meta: { title: '客服端管理', icon: 'Service' },
    children: [
      {
        path: 'ranking',
        name: 'CustomerRanking',
        component: () => import('@/views/customer/ranking.vue'),
        meta: { title: '打手排行', icon: 'Trophy' }
      },
      {
        path: 'assign',
        name: 'CustomerAssign',
        component: () => import('@/views/customer/assign.vue'),
        meta: { title: '订单分配', icon: 'Share' }
      },
      {
        path: 'process',
        name: 'CustomerProcess',
        component: () => import('@/views/customer/process.vue'),
        meta: { title: '订单处理', icon: 'DocumentChecked' }
      }
    ]
  },
  {
    path: '/order',
    component: () => import('@/layout/index.vue'),
    redirect: '/order/list',
    meta: { title: '订单管理', icon: 'List' },
    children: [
      {
        path: 'list',
        name: 'OrderList',
        component: () => import('@/views/order/list.vue'),
        meta: { title: '订单列表', icon: 'Document' }
      },
      {
        path: 'detail/:id',
        name: 'OrderDetail',
        component: () => import('@/views/order/detail.vue'),
        meta: { title: '订单详情', icon: 'View', hidden: true }
      }
    ]
  },
  {
    path: '/payment',
    component: () => import('@/layout/index.vue'),
    redirect: '/payment/list',
    meta: { title: '支付管理', icon: 'Wallet' },
    children: [
      {
        path: 'list',
        name: 'PaymentList',
        component: () => import('@/views/payment/list.vue'),
        meta: { title: '支付列表', icon: 'Document' }
      },
      {
        path: 'detail/:id',
        name: 'PaymentDetail',
        component: () => import('@/views/payment/detail.vue'),
        meta: { title: '支付详情', icon: 'View', hidden: true }
      },
      {
        path: 'config',
        name: 'PaymentConfig',
        component: () => import('@/views/payment/config.vue'),
        meta: { title: '支付配置', icon: 'Setting' }
      }
    ]
  },
  {
    path: '/game',
    component: () => import('@/layout/index.vue'),
    redirect: '/game/list',
    meta: { title: '游戏专区', icon: 'VideoPlay' },
    children: [
      {
        path: 'list',
        name: 'GameList',
        component: () => import('@/views/game/list.vue'),
        meta: { title: '游戏分类', icon: 'Grid' }
      },
      {
        path: 'category',
        name: 'GameCategory',
        component: () => import('@/views/game/category.vue'),
        meta: { title: '代练类型', icon: 'Menu' }
      },
      {
        path: 'order',
        name: 'QuickOrder',
        component: () => import('@/views/game/quickOrder.vue'),
        meta: { title: '快速下单', icon: 'Plus' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const token = localStorage.getItem('token')

  if (to.path === '/login') {
    if (token) {
      next('/')
    } else {
      next()
    }
  } else {
    if (token) {
      if (!userStore.userInfo) {
        try {
          await userStore.getUserInfo()
        } catch (error) {
          localStorage.removeItem('token')
          next('/login')
          return
        }
      }
      next()
    } else {
      next('/login')
    }
  }
})

export default router
