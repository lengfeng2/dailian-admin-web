import request from '@/utils/request'
import { mockMemberList, mockConsumptionList } from '@/mock/member'

export function getMemberList(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page = 1, pageSize = 10, keyword = '', status = '', memberLevel = '' } = params || {}
      let list = [...mockMemberList]
      
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
      
      if (memberLevel) {
        list = list.filter(item => item.memberLevel === memberLevel)
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

export function getMemberDetail(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const member = mockMemberList.find(item => item.id === parseInt(id))
      if (member) {
        resolve({
          code: 200,
          data: member
        })
      } else {
        resolve({
          code: 404,
          message: '会员不存在'
        })
      }
    }, 200)
  })
}

export function updateMember(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockMemberList.findIndex(item => item.id === data.id)
      if (index !== -1) {
        mockMemberList[index] = { ...mockMemberList[index], ...data }
        resolve({
          code: 200,
          message: '更新成功'
        })
      } else {
        resolve({
          code: 404,
          message: '会员不存在'
        })
      }
    }, 300)
  })
}

export function updateMemberStatus(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockMemberList.findIndex(item => item.id === data.id)
      if (index !== -1) {
        mockMemberList[index].status = data.status
        resolve({
          code: 200,
          message: '状态更新成功'
        })
      } else {
        resolve({
          code: 404,
          message: '会员不存在'
        })
      }
    }, 300)
  })
}

export function toggleMemberMute(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockMemberList.findIndex(item => item.id === data.id)
      if (index !== -1) {
        mockMemberList[index].isMuted = data.isMuted
        resolve({
          code: 200,
          message: data.isMuted ? '禁言成功' : '解除禁言成功'
        })
      } else {
        resolve({
          code: 404,
          message: '会员不存在'
        })
      }
    }, 300)
  })
}

export function getConsumptionList(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page = 1, pageSize = 10, userId, type = '', startDate = '', endDate = '' } = params || {}
      let list = [...mockConsumptionList]
      
      if (userId) {
        list = list.filter(item => item.userId === parseInt(userId))
      }
      
      if (type) {
        list = list.filter(item => item.type === type)
      }
      
      if (startDate) {
        list = list.filter(item => item.createdAt >= startDate)
      }
      
      if (endDate) {
        list = list.filter(item => item.createdAt <= endDate + ' 23:59:59')
      }
      
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      
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

export function getMemberStatistics(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const member = mockMemberList.find(item => item.id === parseInt(userId))
      if (member) {
        const userConsumptions = mockConsumptionList.filter(item => item.userId === parseInt(userId))
        const totalRecharge = userConsumptions.filter(item => item.type === 'recharge').reduce((sum, item) => sum + item.amount, 0)
        const totalPayment = userConsumptions.filter(item => item.type === 'order_payment').reduce((sum, item) => sum + item.amount, 0)
        const totalRefund = userConsumptions.filter(item => item.type === 'order_refund').reduce((sum, item) => sum + item.amount, 0)
        
        resolve({
          code: 200,
          data: {
            ...member,
            totalRecharge,
            totalPayment,
            totalRefund,
            orderCount: userConsumptions.filter(item => item.type === 'order_payment').length
          }
        })
      } else {
        resolve({
          code: 404,
          message: '会员不存在'
        })
      }
    }, 200)
  })
}
