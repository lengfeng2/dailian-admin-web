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
    path: '/member',
    component: () => import('@/layout/index.vue'),
    redirect: '/member/list',
    meta: { title: '会员管理', icon: 'Medal' },
    children: [
      {
        path: 'list',
        name: 'MemberList',
        component: () => import('@/views/member/list.vue'),
        meta: { title: '会员列表', icon: 'User' }
      },
      {
        path: 'consumption/:id',
        name: 'MemberConsumption',
        component: () => import('@/views/member/consumption.vue'),
        meta: { title: '消费明细', icon: 'Wallet', hidden: true }
      }
    ]
  },
  {
    path: '/studio',
    component: () => import('@/layout/index.vue'),
    redirect: '/studio/list',
    meta: { title: '工作室管理', icon: 'OfficeBuilding' },
    children: [
      {
        path: 'list',
        name: 'StudioList',
        component: () => import('@/views/studio/list.vue'),
        meta: { title: '工作室列表', icon: 'List' }
      },
      {
        path: 'apply',
        name: 'StudioApply',
        component: () => import('@/views/studio/apply.vue'),
        meta: { title: '申请入驻', icon: 'DocumentAdd' }
      },
      {
        path: 'invite/:id',
        name: 'StudioInvite',
        component: () => import('@/views/studio/invite.vue'),
        meta: { title: '打手邀请', icon: 'UserAdd', hidden: true }
      },
      {
        path: 'commission/:id',
        name: 'StudioCommission',
        component: () => import('@/views/studio/commission.vue'),
        meta: { title: '分佣管理', icon: 'Money', hidden: true }
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
