<template>
  <div class="layout-container">
    <div class="animated-bg"></div>
    <div class="grid-overlay"></div>
    
    <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="logo">
        <span class="logo-icon">🎮</span>
        <span v-show="!sidebarCollapsed" class="logo-text">游戏代练</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="sidebarCollapsed"
        :collapse-transition="false"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>数据概览</template>
        </el-menu-item>
        
        <el-sub-menu index="/user">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户端管理</span>
          </template>
          <el-menu-item index="/user/list">用户列表</el-menu-item>
          <el-menu-item index="/user/admin">管理员管理</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="/player">
          <template #title>
            <el-icon><Aim /></el-icon>
            <span>打手端管理</span>
          </template>
          <el-menu-item index="/player/list">打手列表</el-menu-item>
          <el-menu-item index="/player/order">订单管理</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="/customer">
          <template #title>
            <el-icon><Service /></el-icon>
            <span>客服端管理</span>
          </template>
          <el-menu-item index="/customer/ranking">打手排行</el-menu-item>
          <el-menu-item index="/customer/assign">订单分配</el-menu-item>
          <el-menu-item index="/customer/process">订单处理</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="/order">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>订单管理</span>
          </template>
          <el-menu-item index="/order/list">订单列表</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="/member">
          <template #title>
            <el-icon><Medal /></el-icon>
            <span>会员管理</span>
          </template>
          <el-menu-item index="/member/list">会员列表</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="/studio">
          <template #title>
            <el-icon><OfficeBuilding /></el-icon>
            <span>工作室管理</span>
          </template>
          <el-menu-item index="/studio/list">工作室列表</el-menu-item>
          <el-menu-item index="/studio/apply">申请入驻</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>
    
    <div class="main-container" :class="{ collapsed: sidebarCollapsed }">
      <header class="header">
        <div class="header-left">
          <div class="toggle-btn" @click="toggleSidebar">
            <el-icon :size="20">
              <component :is="sidebarCollapsed ? 'Expand' : 'Fold'" />
            </el-icon>
          </div>
          
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <div class="header-notification">
            <el-badge :value="3" class="item">
              <el-icon :size="20"><Bell /></el-icon>
            </el-badge>
          </div>
          
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" class="user-avatar">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <span class="user-name">{{ userStore.userInfo?.name || userStore.userInfo?.username }}</span>
              <el-icon class="caret"><ArrowDown /></el-icon>
            </div>
            
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="password">
                  <el-icon><Key /></el-icon>
                  修改密码
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    
    <el-dialog
      v-model="showLogoutDialog"
      title="确认退出"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="logout-dialog-content">
        <el-icon :size="48" class="warning-icon"><Warning /></el-icon>
        <p>确定要退出登录吗？</p>
      </div>
      <template #footer>
        <el-button @click="showLogoutDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmLogout">确定退出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessageBox, ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const sidebarCollapsed = ref(false)
const showLogoutDialog = ref(false)

const activeMenu = computed(() => route.path)

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map(item => ({
    path: item.path,
    title: item.meta.title
  }))
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人中心功能开发中')
      break
    case 'password':
      ElMessage.info('修改密码功能开发中')
      break
    case 'logout':
      showLogoutDialog.value = true
      break
  }
}

const confirmLogout = async () => {
  await userStore.handleLogout()
  showLogoutDialog.value = false
  router.push('/login')
  ElMessage.success('已退出登录')
}
</script>

<style lang="scss" scoped>
.layout-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
}

.sidebar {
  width: var(--sidebar-width);
  height: 100%;
  background: linear-gradient(180deg, var(--bg-secondary) 0%, rgba(18, 18, 26, 0.95) 100%);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width var(--animation-duration) ease;
  position: relative;
  z-index: var(--z-index-sidebar);

  &.collapsed {
    width: var(--sidebar-collapsed-width);
  }

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    border-bottom: 1px solid var(--border-color);
    padding: 0 20px;

    .logo-icon {
      font-size: 28px;
      animation: pulse 2s ease-in-out infinite;
    }

    .logo-text {
      font-size: 18px;
      font-weight: 700;
      background: linear-gradient(90deg, var(--accent-cyan), var(--accent-purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: 1px;
    }
  }

  .sidebar-menu {
    flex: 1;
    border-right: none !important;
    background: transparent !important;
  }
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: var(--sidebar-width);
  transition: margin-left var(--animation-duration) ease;
  overflow: hidden;

  &.collapsed {
    margin-left: var(--sidebar-collapsed-width);
  }

  .header {
    height: var(--header-height);
    background: rgba(18, 18, 26, 0.9);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    position: relative;
    z-index: var(--z-index-header);

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .toggle-btn {
        cursor: pointer;
        padding: 8px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        transition: all var(--transition-normal);

        &:hover {
          background: var(--bg-hover);
          color: var(--accent-cyan);
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 24px;

      .header-notification {
        cursor: pointer;
        padding: 8px;
        color: var(--text-secondary);
        transition: all var(--transition-normal);

        &:hover {
          color: var(--accent-cyan);
        }
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 6px 12px;
        border-radius: 6px;
        transition: all var(--transition-normal);

        &:hover {
          background: var(--bg-hover);
        }

        .user-avatar {
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
        }

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .caret {
          color: var(--text-muted);
          font-size: 12px;
        }
      }
    }
  }

  .main-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }
}

.logout-dialog-content {
  text-align: center;
  padding: 20px 0;

  .warning-icon {
    color: var(--accent-orange);
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    color: var(--text-primary);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>
