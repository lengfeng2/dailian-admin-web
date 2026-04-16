import request from '@/utils/request'
import { mockOrderList, mockOrderStatusMap } from '@/mock/order'

export function getOrderList(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { 
        page = 1, 
        pageSize = 10, 
        keyword = '', 
        status = '', 
        game = '',
        playerId = '',
        startTime = '',
        endTime = ''
      } = params || {}
      
      let list = [...mockOrderList]
      
      if (keyword) {
        list = list.filter(item => 
          item.orderNo.includes(keyword) || 
          item.title.includes(keyword) ||
          item.username.includes(keyword) ||
          item.nickname.includes(keyword)
        )
      }
      
      if (status) {
        list = list.filter(item => item.status === status)
      }
      
      if (game) {
        list = list.filter(item => item.game === game)
      }
      
      if (playerId) {
        list = list.filter(item => item.playerId === parseInt(playerId))
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

export function getOrderDetail(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const order = mockOrderList.find(o => o.id === id)
      if (order) {
        resolve({
          code: 200,
          data: order
        })
      } else {
        resolve({
          code: 404,
          message: '订单不存在'
        })
      }
    }, 200)
  })
}

export function assignOrder(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockOrderList.findIndex(item => item.id === data.orderId)
      if (index !== -1) {
        mockOrderList[index].playerId = data.playerId
        mockOrderList[index].playerName = data.playerName
        mockOrderList[index].playerPhone = data.playerPhone
        mockOrderList[index].status = 'pending'
        mockOrderList[index].logs.push({
          time: new Date().toISOString().slice(0, 19).replace('T', ' '),
          action: '客服分配订单',
          operator: '客服'
        })
      }
      resolve({
        code: 200,
        message: '订单分配成功'
      })
    }, 500)
  })
}

export function cancelOrder(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockOrderList.findIndex(item => item.id === data.orderId)
      if (index !== -1) {
        mockOrderList[index].status = 'cancelled'
        mockOrderList[index].endTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
        mockOrderList[index].logs.push({
          time: new Date().toISOString().slice(0, 19).replace('T', ' '),
          action: '订单取消',
          operator: data.operator || '系统',
          reason: data.reason
        })
      }
      resolve({
        code: 200,
        message: '订单取消成功'
      })
    }, 500)
  })
}

export function completeOrder(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockOrderList.findIndex(item => item.id === data.orderId)
      if (index !== -1) {
        mockOrderList[index].status = 'completed'
        mockOrderList[index].endTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
        mockOrderList[index].logs.push({
          time: new Date().toISOString().slice(0, 19).replace('T', ' '),
          action: '订单确认完成',
          operator: '客服'
        })
      }
      resolve({
        code: 200,
        message: '订单确认完成'
      })
    }, 500)
  })
}

export function handleDispute(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockOrderList.findIndex(item => item.id === data.orderId)
      if (index !== -1) {
        mockOrderList[index].status = data.result === 'complete' ? 'completed' : (data.result === 'refund' ? 'refunded' : 'active')
        mockOrderList[index].logs.push({
          time: new Date().toISOString().slice(0, 19).replace('T', ' '),
          action: '仲裁处理完成',
          operator: '客服',
          result: data.result
        })
      }
      resolve({
        code: 200,
        message: '仲裁处理完成'
      })
    }, 500)
  })
}

export function getOrderStats(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          total: 128,
          pending: 15,
          active: 32,
          completed: 76,
          cancelled: 5,
          dispute: 2,
          todayNew: 8,
          todayCompleted: 12,
          todayAmount: 15600
        }
      })
    }, 200)
  })
}

export function getPendingOrders() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const list = mockOrderList.filter(o => o.status === 'pending' || o.status === 'waiting')
      resolve({
        code: 200,
        data: list
      })
    }, 300)
  })
}

export function getActiveOrders() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const list = mockOrderList.filter(o => o.status === 'active' || o.status === 'dispute')
      resolve({
        code: 200,
        data: list
      })
    }, 300)
  })
}
