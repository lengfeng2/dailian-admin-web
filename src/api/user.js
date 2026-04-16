import request from '@/utils/request'
import { mockUserList, mockAdminList, mockUserInfo } from '@/mock/user'

export function login(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (data.username === 'admin' && data.password === 'admin123') {
        resolve({
          code: 200,
          message: '登录成功',
          data: {
            token: 'mock-admin-token-' + Date.now()
          }
        })
      } else if (data.username === 'customer' && data.password === 'customer123') {
        resolve({
          code: 200,
          message: '登录成功',
          data: {
            token: 'mock-customer-token-' + Date.now()
          }
        })
      } else {
        resolve({
          code: 400,
          message: '用户名或密码错误'
        })
      }
    }, 500)
  })
}

export function logout() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '退出成功'
      })
    }, 200)
  })
}

export function getUserInfo() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockUserInfo
      })
    }, 200)
  })
}

export function getUserList(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page = 1, pageSize = 10, keyword = '', status = '' } = params || {}
      let list = [...mockUserList]
      
      if (keyword) {
        list = list.filter(item => 
          item.username.includes(keyword) || 
          item.nickname.includes(keyword) ||
          item.phone.includes(keyword)
        )
      }
      
      if (status) {
        list = list.filter(item => item.status === status)
      }
      
      const total = list.length
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const data = list.slice(start, end)
      
      resolve({
        code: 200,
        data: {
          list: data,
          total,
          page,
          pageSize
        }
      })
    }, 300)
  })
}

export function getAdminList(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page = 1, pageSize = 10, keyword = '', role = '' } = params || {}
      let list = [...mockAdminList]
      
      if (keyword) {
        list = list.filter(item => 
          item.username.includes(keyword) || 
          item.name.includes(keyword)
        )
      }
      
      if (role) {
        list = list.filter(item => item.role === role)
      }
      
      const total = list.length
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const data = list.slice(start, end)
      
      resolve({
        code: 200,
        data: {
          list: data,
          total,
          page,
          pageSize
        }
      })
    }, 300)
  })
}

export function createAdmin(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockAdminList.unshift({
        id: Date.now(),
        ...data,
        status: 'active',
        createdAt: new Date().toISOString().slice(0, 10)
      })
      resolve({
        code: 200,
        message: '创建成功'
      })
    }, 500)
  })
}

export function updateAdmin(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockAdminList.findIndex(item => item.id === data.id)
      if (index !== -1) {
        mockAdminList[index] = { ...mockAdminList[index], ...data }
      }
      resolve({
        code: 200,
        message: '更新成功'
      })
    }, 500)
  })
}

export function deleteAdmin(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockAdminList.findIndex(item => item.id === id)
      if (index !== -1) {
        mockAdminList.splice(index, 1)
      }
      resolve({
        code: 200,
        message: '删除成功'
      })
    }, 300)
  })
}

export function updateUserStatus(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockUserList.findIndex(item => item.id === data.id)
      if (index !== -1) {
        mockUserList[index].status = data.status
      }
      resolve({
        code: 200,
        message: '状态更新成功'
      })
    }, 300)
  })
}
