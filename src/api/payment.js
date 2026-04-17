import request from '@/utils/request'
import { mockPaymentList, mockPaymentConfig, mockPaymentStats, mockPayStatusMap, mockPayMethodMap, mockRefundStatusMap } from '@/mock/payment'

export function getPaymentList(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { 
        page = 1, 
        pageSize = 10, 
        keyword = '', 
        payMethod = '', 
        payStatus = '', 
        refundStatus = '',
        startTime = '',
        endTime = ''
      } = params || {}
      
      let list = [...mockPaymentList]
      
      if (keyword) {
        list = list.filter(item => 
          item.paymentNo.includes(keyword) || 
          item.orderNo.includes(keyword) ||
          item.orderTitle.includes(keyword) ||
          item.payer.includes(keyword)
        )
      }
      
      if (payMethod) {
        list = list.filter(item => item.payMethod === payMethod)
      }
      
      if (payStatus) {
        list = list.filter(item => item.payStatus === payStatus)
      }
      
      if (refundStatus) {
        list = list.filter(item => item.refundStatus === refundStatus)
      }
      
      if (startTime && endTime) {
        const startDate = new Date(startTime)
        const endDate = new Date(endTime + ' 23:59:59')
        list = list.filter(item => {
          const itemDate = new Date(item.createdAt)
          return itemDate >= startDate && itemDate <= endDate
        })
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

export function getPaymentDetail(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const payment = mockPaymentList.find(p => p.id === id)
      if (payment) {
        resolve({
          code: 200,
          data: payment
        })
      } else {
        resolve({
          code: 404,
          message: '支付记录不存在'
        })
      }
    }, 200)
  })
}

export function getPaymentConfig() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockPaymentConfig
      })
    }, 200)
  })
}

export function updatePaymentConfig(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { method, config, settings } = data
      if (mockPaymentConfig[method]) {
        if (config) {
          Object.assign(mockPaymentConfig[method].config, config)
        }
        if (settings) {
          Object.assign(mockPaymentConfig[method].settings, settings)
        }
      }
      resolve({
        code: 200,
        message: '配置更新成功'
      })
    }, 500)
  })
}

export function togglePaymentMethod(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { method, enabled } = data
      if (mockPaymentConfig[method]) {
        mockPaymentConfig[method].enabled = enabled
      }
      resolve({
        code: 200,
        message: enabled ? '支付方式已启用' : '支付方式已禁用'
      })
    }, 300)
  })
}

export function processRefund(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { paymentId, action, reason } = data
      const index = mockPaymentList.findIndex(p => p.id === paymentId)
      if (index !== -1) {
        if (action === 'approve') {
          mockPaymentList[index].refundStatus = 'success'
          mockPaymentList[index].logs.push({
            time: new Date().toISOString().slice(0, 19).replace('T', ' '),
            action: '退款审核通过',
            operator: '管理员',
            status: 'success'
          })
        } else if (action === 'reject') {
          mockPaymentList[index].refundStatus = 'rejected'
          mockPaymentList[index].logs.push({
            time: new Date().toISOString().slice(0, 19).replace('T', ' '),
            action: '退款被驳回',
            operator: '管理员',
            reason: reason,
            status: 'rejected'
          })
        }
      }
      resolve({
        code: 200,
        message: action === 'approve' ? '退款已处理' : '退款已驳回'
      })
    }, 500)
  })
}

export function getPaymentStats(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockPaymentStats
      })
    }, 200)
  })
}

export function manualConfirmPayment(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { paymentId, tradeNo, remark } = data
      const index = mockPaymentList.findIndex(p => p.id === paymentId)
      if (index !== -1) {
        mockPaymentList[index].payStatus = 'success'
        mockPaymentList[index].tradeNo = tradeNo
        mockPaymentList[index].paidAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
        mockPaymentList[index].logs.push({
          time: new Date().toISOString().slice(0, 19).replace('T', ' '),
          action: '人工确认支付',
          operator: '管理员',
          tradeNo: tradeNo,
          remark: remark,
          status: 'success'
        })
      }
      resolve({
        code: 200,
        message: '支付确认成功'
      })
    }, 500)
  })
}

export function closePayment(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { paymentId, reason } = data
      const index = mockPaymentList.findIndex(p => p.id === paymentId)
      if (index !== -1) {
        mockPaymentList[index].payStatus = 'closed'
        mockPaymentList[index].logs.push({
          time: new Date().toISOString().slice(0, 19).replace('T', ' '),
          action: '关闭支付订单',
          operator: '管理员',
          reason: reason,
          status: 'closed'
        })
      }
      resolve({
        code: 200,
        message: '支付订单已关闭'
      })
    }, 300)
  })
}

export { mockPayStatusMap, mockPayMethodMap, mockRefundStatusMap }
