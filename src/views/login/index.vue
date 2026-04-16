<template>
  <div class="login-container">
    <div class="animated-bg"></div>
    <div class="grid-overlay"></div>
    
    <div class="login-box fade-in">
      <div class="login-header">
        <div class="logo-wrapper">
          <span class="logo-icon">🎮</span>
        </div>
        <h1 class="title">游戏代练后台</h1>
        <p class="subtitle">专业游戏代练服务平台</p>
      </div>
      
      <div class="neon-line"></div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            class="login-input"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            :show-password="true"
            class="login-input"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
            <span class="forgot-password" @click="handleForgotPassword">忘记密码？</span>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <div class="test-accounts">
          <p class="test-title">测试账号：</p>
          <div class="accounts-list">
            <div class="account-item">
              <span class="label">管理员：</span>
              <span class="value">admin / admin123</span>
            </div>
            <div class="account-item">
              <span class="label">客服：</span>
              <span class="value">customer / customer123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await userStore.handleLogin(loginForm)
        if (res.code === 200) {
          ElMessage.success('登录成功')
          router.push('/dashboard')
        } else {
          ElMessage.error(res.message || '登录失败')
        }
      } catch (error) {
        console.error('Login error:', error)
        ElMessage.error('登录失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleForgotPassword = () => {
  ElMessage.info('请联系管理员重置密码')
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-box {
  width: 420px;
  padding: 40px;
  background: rgba(26, 26, 37, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  position: relative;
  z-index: 10;

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, var(--accent-cyan), var(--accent-purple), var(--accent-orange), var(--accent-cyan));
    background-size: 400% 400%;
    border-radius: 16px;
    z-index: -1;
    animation: borderGlow 3s ease infinite;
    opacity: 0.3;
  }

  .login-header {
    text-align: center;
    margin-bottom: 30px;

    .logo-wrapper {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 30px rgba(0, 245, 255, 0.4);
      animation: logoPulse 2s ease-in-out infinite;

      .logo-icon {
        font-size: 42px;
      }
    }

    .title {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(90deg, var(--accent-cyan), var(--accent-purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
      letter-spacing: 2px;
    }

    .subtitle {
      font-size: 14px;
      color: var(--text-secondary);
    }
  }

  .neon-line {
    margin-bottom: 30px;
  }

  .login-form {
    .login-input {
      :deep(.el-input__wrapper) {
        height: 50px;
        background: var(--bg-secondary) !important;
        border: 1px solid var(--border-color) !important;
        box-shadow: none !important;
        transition: all var(--transition-normal);

        &:hover {
          border-color: var(--accent-cyan) !important;
        }

        &.is-focus {
          border-color: var(--accent-cyan) !important;
          box-shadow: 0 0 0 2px rgba(0, 245, 255, 0.2) !important;
        }
      }
    }

    .login-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;

      .forgot-password {
        color: var(--accent-cyan);
        cursor: pointer;
        transition: all var(--transition-fast);

        &:hover {
          color: var(--accent-purple);
          text-decoration: underline;
        }
      }
    }

    .login-btn {
      width: 100%;
      height: 50px;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 4px;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%) !important;
      border: none !important;
      color: var(--bg-dark) !important;
      transition: all var(--transition-normal);

      &:hover {
        box-shadow: 0 0 25px rgba(0, 245, 255, 0.5);
        transform: translateY(-2px);
      }
    }
  }

  .login-footer {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);

    .test-accounts {
      .test-title {
        font-size: 12px;
        color: var(--text-muted);
        margin-bottom: 10px;
      }

      .accounts-list {
        display: flex;
        flex-direction: column;
        gap: 6px;

        .account-item {
          font-size: 12px;
          color: var(--text-secondary);

          .label {
            color: var(--text-muted);
          }

          .value {
            color: var(--accent-cyan);
            font-family: monospace;
          }
        }
      }
    }
  }
}

@keyframes logoPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 30px rgba(0, 245, 255, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 40px rgba(0, 245, 255, 0.6);
  }
}

@keyframes borderGlow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>
