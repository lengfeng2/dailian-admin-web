import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, logout, getUserInfo as fetchUserInfo } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)
  const roles = ref([])

  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const removeToken = () => {
    token.value = ''
    localStorage.removeItem('token')
  }

  const handleLogin = async (loginForm) => {
    const res = await login(loginForm)
    if (res.code === 200) {
      setToken(res.data.token)
      await getUserInfo()
    }
    return res
  }

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      removeToken()
      userInfo.value = null
      roles.value = []
    }
  }

  const getUserInfo = async () => {
    const res = await fetchUserInfo()
    if (res.code === 200) {
      userInfo.value = res.data.userInfo
      roles.value = res.data.roles || []
    }
    return res
  }

  return {
    token,
    userInfo,
    roles,
    setToken,
    removeToken,
    handleLogin,
    handleLogout,
    getUserInfo
  }
})
