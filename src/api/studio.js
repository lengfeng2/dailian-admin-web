import request from '@/utils/request'
import { 
  mockStudioList, 
  mockStudioPlayerList, 
  mockStudioCommissionList,
  mockStudioApplyList 
} from '@/mock/studio'

export function getStudioList(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page = 1, pageSize = 10, keyword = '', status = '', applyStatus = '' } = params || {}
      let list = [...mockStudioList]
      
      if (keyword) {
        list = list.filter(item => 
          item.name.includes(keyword) || 
          item.ownerName.includes(keyword) ||
          item.ownerPhone.includes(keyword)
        )
      }
      
      if (status) {
        list = list.filter(item => item.status === status)
      }
      
      if (applyStatus) {
        list = list.filter(item => item.applyStatus === applyStatus)
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

export function getStudioDetail(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const studio = mockStudioList.find(item => item.id === parseInt(id))
      if (studio) {
        resolve({
          code: 200,
          data: studio
        })
      } else {
        resolve({
          code: 404,
          message: '工作室不存在'
        })
      }
    }, 200)
  })
}

export function createStudio(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newStudio = {
        id: Date.now(),
        ...data,
        playerCount: 0,
        orderCount: 0,
        totalRevenue: 0,
        status: 'pending',
        applyStatus: 'pending',
        createdAt: new Date().toISOString().slice(0, 10),
        approvedAt: null
      }
      mockStudioList.unshift(newStudio)
      resolve({
        code: 200,
        message: '申请提交成功',
        data: { id: newStudio.id }
      })
    }, 500)
  })
}

export function updateStudio(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockStudioList.findIndex(item => item.id === data.id)
      if (index !== -1) {
        mockStudioList[index] = { ...mockStudioList[index], ...data }
        resolve({
          code: 200,
          message: '更新成功'
        })
      } else {
        resolve({
          code: 404,
          message: '工作室不存在'
        })
      }
    }, 300)
  })
}

export function approveStudio(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockStudioList.findIndex(item => item.id === data.id)
      if (index !== -1) {
        mockStudioList[index].applyStatus = 'approved'
        mockStudioList[index].status = 'active'
        mockStudioList[index].commissionRate = data.commissionRate || 15
        mockStudioList[index].platformCommissionRate = data.platformCommissionRate || 5
        mockStudioList[index].approvedAt = new Date().toISOString().slice(0, 10)
        resolve({
          code: 200,
          message: '审核通过'
        })
      } else {
        resolve({
          code: 404,
          message: '工作室不存在'
        })
      }
    }, 300)
  })
}

export function rejectStudio(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockStudioList.findIndex(item => item.id === data.id)
      if (index !== -1) {
        mockStudioList[index].applyStatus = 'rejected'
        mockStudioList[index].status = 'rejected'
        mockStudioList[index].rejectReason = data.rejectReason
        resolve({
          code: 200,
          message: '已拒绝申请'
        })
      } else {
        resolve({
          code: 404,
          message: '工作室不存在'
        })
      }
    }, 300)
  })
}

export function updateStudioStatus(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockStudioList.findIndex(item => item.id === data.id)
      if (index !== -1) {
        mockStudioList[index].status = data.status
        resolve({
          code: 200,
          message: '状态更新成功'
        })
      } else {
        resolve({
          code: 404,
          message: '工作室不存在'
        })
      }
    }, 300)
  })
}

export function getStudioPlayerList(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page = 1, pageSize = 10, studioId, keyword = '', status = '' } = params || {}
      let list = [...mockStudioPlayerList]
      
      if (studioId) {
        list = list.filter(item => item.studioId === parseInt(studioId))
      }
      
      if (keyword) {
        list = list.filter(item => 
          item.playerName.includes(keyword) || 
          item.playerPhone.includes(keyword)
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

export function invitePlayer(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newInvite = {
        id: Date.now(),
        studioId: data.studioId,
        playerId: data.playerId,
        playerName: data.playerName,
        playerPhone: data.playerPhone,
        gameType: data.gameType,
        commissionRate: data.commissionRate || 20,
        status: 'pending',
        createdAt: new Date().toISOString().slice(0, 10)
      }
      mockStudioPlayerList.push(newInvite)
      resolve({
        code: 200,
        message: '邀请已发送'
      })
    }, 500)
  })
}

export function updatePlayerCommission(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockStudioPlayerList.findIndex(item => item.id === data.id)
      if (index !== -1) {
        mockStudioPlayerList[index].commissionRate = data.commissionRate
        resolve({
          code: 200,
          message: '分佣比例更新成功'
        })
      } else {
        resolve({
          code: 404,
          message: '打手不存在'
        })
      }
    }, 300)
  })
}

export function removePlayer(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockStudioPlayerList.findIndex(item => item.id === data.id)
      if (index !== -1) {
        mockStudioPlayerList.splice(index, 1)
        resolve({
          code: 200,
          message: '已移除打手'
        })
      } else {
        resolve({
          code: 404,
          message: '打手不存在'
        })
      }
    }, 300)
  })
}

export function getStudioCommissionList(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page = 1, pageSize = 10, studioId, status = '', startDate = '', endDate = '' } = params || {}
      let list = [...mockStudioCommissionList]
      
      if (studioId) {
        list = list.filter(item => item.studioId === parseInt(studioId))
      }
      
      if (status) {
        list = list.filter(item => item.status === status)
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

export function getStudioStatistics(studioId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const studio = mockStudioList.find(item => item.id === parseInt(studioId))
      const players = mockStudioPlayerList.filter(item => item.studioId === parseInt(studioId))
      const commissions = mockStudioCommissionList.filter(item => item.studioId === parseInt(studioId))
      
      const totalStudioCommission = commissions.reduce((sum, item) => sum + item.studioCommission, 0)
      const totalPlatformCommission = commissions.reduce((sum, item) => sum + item.platformCommission, 0)
      const totalPlayerIncome = commissions.reduce((sum, item) => sum + item.playerIncome, 0)
      const pendingCount = commissions.filter(item => item.status === 'pending').length
      const settledCount = commissions.filter(item => item.status === 'settled').length
      
      resolve({
        code: 200,
        data: {
          ...studio,
          playerCount: players.length,
          totalOrderCount: studio.orderCount,
          totalRevenue: studio.totalRevenue,
          totalStudioCommission,
          totalPlatformCommission,
          totalPlayerIncome,
          pendingCount,
          settledCount
        }
      })
    }, 200)
  })
}

export function settleCommission(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockStudioCommissionList.findIndex(item => item.id === data.id)
      if (index !== -1) {
        mockStudioCommissionList[index].status = 'settled'
        mockStudioCommissionList[index].settledAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
        resolve({
          code: 200,
          message: '结算成功'
        })
      } else {
        resolve({
          code: 404,
          message: '分佣记录不存在'
        })
      }
    }, 300)
  })
}
