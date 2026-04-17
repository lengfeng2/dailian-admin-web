export const mockPaymentList = [
  {
    id: 'PY20240415001',
    paymentNo: 'PAY202404150001',
    orderNo: 'DL202404150001',
    orderTitle: '王者荣耀-王者10星代练',
    payer: '王者小白',
    payerPhone: '13800138001',
    amount: 800,
    payMethod: 'wechat',
    payStatus: 'success',
    tradeNo: '4200001234567890123456789012',
    paidAt: '2024-04-14 09:35:00',
    createdAt: '2024-04-14 09:30:00',
    refundStatus: 'none',
    refundAmount: 0,
    logs: [
      { time: '2024-04-14 09:30:00', action: '创建支付订单', operator: '系统', status: 'pending' },
      { time: '2024-04-14 09:35:00', action: '微信支付成功', operator: '微信支付', status: 'success', tradeNo: '4200001234567890123456789012' }
    ]
  },
  {
    id: 'PY20240415002',
    paymentNo: 'PAY202404150002',
    orderNo: 'DL202404150002',
    orderTitle: '英雄联盟-铂金到钻石',
    payer: 'LOL新手',
    payerPhone: '13800138004',
    amount: 1200,
    payMethod: 'alipay',
    payStatus: 'success',
    tradeNo: '2024041422001445560012345678',
    paidAt: '2024-04-14 09:05:00',
    createdAt: '2024-04-14 09:00:00',
    refundStatus: 'none',
    refundAmount: 0,
    logs: [
      { time: '2024-04-14 09:00:00', action: '创建支付订单', operator: '系统', status: 'pending' },
      { time: '2024-04-14 09:05:00', action: '支付宝支付成功', operator: '支付宝', status: 'success', tradeNo: '2024041422001445560012345678' }
    ]
  },
  {
    id: 'PY20240415003',
    paymentNo: 'PAY202404150003',
    orderNo: 'DL202404150003',
    orderTitle: '和平精英-王牌段位',
    payer: '吃鸡大神',
    payerPhone: '13800138002',
    amount: 600,
    payMethod: 'bank',
    payStatus: 'success',
    tradeNo: 'ICBC20240415083000123456',
    paidAt: '2024-04-15 08:30:00',
    createdAt: '2024-04-15 08:00:00',
    refundStatus: 'none',
    refundAmount: 0,
    logs: [
      { time: '2024-04-15 08:00:00', action: '创建支付订单', operator: '系统', status: 'pending' },
      { time: '2024-04-15 08:30:00', action: '银行转账支付成功', operator: '工商银行', status: 'success', tradeNo: 'ICBC20240415083000123456' }
    ]
  },
  {
    id: 'PY20240415004',
    paymentNo: 'PAY202404150004',
    orderNo: 'DL202404150004',
    orderTitle: '原神-深渊12层满星',
    payer: '原神玩家',
    payerPhone: '13800138003',
    amount: 300,
    payMethod: 'wechat',
    payStatus: 'success',
    tradeNo: '4200001234567890123456789013',
    paidAt: '2024-04-13 13:15:00',
    createdAt: '2024-04-13 13:00:00',
    refundStatus: 'none',
    refundAmount: 0,
    logs: [
      { time: '2024-04-13 13:00:00', action: '创建支付订单', operator: '系统', status: 'pending' },
      { time: '2024-04-13 13:15:00', action: '微信支付成功', operator: '微信支付', status: 'success', tradeNo: '4200001234567890123456789013' }
    ]
  },
  {
    id: 'PY20240415005',
    paymentNo: 'PAY202404150005',
    orderNo: 'DL202404150005',
    orderTitle: '穿越火线-枪王段位',
    payer: 'CF老玩家',
    payerPhone: '13800138005',
    amount: 1500,
    payMethod: 'alipay',
    payStatus: 'success',
    tradeNo: '2024041222001445560012345679',
    paidAt: '2024-04-12 09:10:00',
    createdAt: '2024-04-12 09:00:00',
    refundStatus: 'pending',
    refundAmount: 500,
    refundReason: '打手未按要求完成，申请部分退款',
    refundAt: '2024-04-14 16:00:00',
    logs: [
      { time: '2024-04-12 09:00:00', action: '创建支付订单', operator: '系统', status: 'pending' },
      { time: '2024-04-12 09:10:00', action: '支付宝支付成功', operator: '支付宝', status: 'success', tradeNo: '2024041222001445560012345679' },
      { time: '2024-04-14 16:00:00', action: '用户申请部分退款', operator: 'CF老玩家', status: 'pending', refundAmount: 500, reason: '打手未按要求完成，申请部分退款' }
    ]
  },
  {
    id: 'PY20240415006',
    paymentNo: 'PAY202404150006',
    orderNo: 'DL202404150006',
    orderTitle: '英雄联盟手游-翡翠到钻石',
    payer: '和平精英',
    payerPhone: '13800138006',
    amount: 500,
    payMethod: 'wechat',
    payStatus: 'pending',
    tradeNo: null,
    paidAt: null,
    createdAt: '2024-04-15 10:00:00',
    refundStatus: 'none',
    refundAmount: 0,
    logs: [
      { time: '2024-04-15 10:00:00', action: '创建支付订单', operator: '系统', status: 'pending' }
    ]
  },
  {
    id: 'PY20240415007',
    paymentNo: 'PAY202404150007',
    orderNo: 'DL202404150007',
    orderTitle: '崩坏星穹铁道-忘却之庭满星',
    payer: '铁道玩家',
    payerPhone: '13800138007',
    amount: 450,
    payMethod: 'bank',
    payStatus: 'refunded',
    tradeNo: 'ABC20240410143000987654',
    paidAt: '2024-04-10 14:30:00',
    createdAt: '2024-04-10 14:00:00',
    refundStatus: 'success',
    refundAmount: 450,
    refundReason: '订单取消，全额退款',
    refundAt: '2024-04-11 09:00:00',
    refundTradeNo: 'ABC20240411090000123456',
    logs: [
      { time: '2024-04-10 14:00:00', action: '创建支付订单', operator: '系统', status: 'pending' },
      { time: '2024-04-10 14:30:00', action: '银行转账支付成功', operator: '农业银行', status: 'success', tradeNo: 'ABC20240410143000987654' },
      { time: '2024-04-11 08:00:00', action: '用户申请全额退款', operator: '铁道玩家', status: 'pending', refundAmount: 450, reason: '订单取消，全额退款' },
      { time: '2024-04-11 09:00:00', action: '退款成功', operator: '系统', status: 'refunded', refundTradeNo: 'ABC20240411090000123456' }
    ]
  }
]

export const mockPaymentConfig = {
  wechat: {
    enabled: true,
    name: '微信支付',
    config: {
      appId: 'wx1234567890abcdef',
      mchId: '1234567890',
      apiKey: 'wechat_api_key_xxxx',
      notifyUrl: 'https://api.example.com/payment/wechat/notify',
      certPath: '/path/to/wechat/cert.p12'
    },
    settings: {
      minAmount: 1,
      maxAmount: 50000,
      feeRate: 0.006,
      autoRefund: false
    }
  },
  alipay: {
    enabled: true,
    name: '支付宝支付',
    config: {
      appId: '2021001234567890',
      privateKey: 'alipay_private_key_xxxx',
      publicKey: 'alipay_public_key_xxxx',
      notifyUrl: 'https://api.example.com/payment/alipay/notify',
      returnUrl: 'https://www.example.com/payment/result'
    },
    settings: {
      minAmount: 1,
      maxAmount: 100000,
      feeRate: 0.006,
      autoRefund: true
    }
  },
  bank: {
    enabled: true,
    name: '银行转账',
    config: {
      banks: [
        {
          id: 'ICBC',
          name: '工商银行',
          accountName: 'XX游戏代练有限公司',
          accountNo: '6222021234567890123',
          branch: 'XX市XX支行',
          enabled: true
        },
        {
          id: 'ABC',
          name: '农业银行',
          accountName: 'XX游戏代练有限公司',
          accountNo: '6228481234567890123',
          branch: 'XX市XX支行',
          enabled: true
        },
        {
          id: 'CCB',
          name: '建设银行',
          accountName: 'XX游戏代练有限公司',
          accountNo: '6227001234567890123',
          branch: 'XX市XX支行',
          enabled: false
        },
        {
          id: 'BOC',
          name: '中国银行',
          accountName: 'XX游戏代练有限公司',
          accountNo: '6216611234567890123',
          branch: 'XX市XX支行',
          enabled: true
        }
      ]
    },
    settings: {
      minAmount: 100,
      maxAmount: 500000,
      feeRate: 0,
      autoConfirm: false,
      confirmHours: 24
    }
  }
}

export const mockPayMethodMap = {
  wechat: { label: '微信支付', icon: 'ChatDotRound', color: '#07C160' },
  alipay: { label: '支付宝', icon: 'Wallet', color: '#1677FF' },
  bank: { label: '银行转账', icon: 'OfficeBuilding', color: '#E6A23C' }
}

export const mockPayStatusMap = {
  pending: { label: '待支付', type: 'warning', class: 'status-pending' },
  success: { label: '支付成功', type: 'success', class: 'status-success' },
  failed: { label: '支付失败', type: 'danger', class: 'status-failed' },
  closed: { label: '已关闭', type: 'info', class: 'status-closed' },
  refunded: { label: '已退款', type: 'info', class: 'status-refunded' }
}

export const mockRefundStatusMap = {
  none: { label: '无退款', type: 'info' },
  pending: { label: '退款中', type: 'warning' },
  processing: { label: '处理中', type: 'warning' },
  success: { label: '退款成功', type: 'success' },
  failed: { label: '退款失败', type: 'danger' },
  rejected: { label: '退款驳回', type: 'danger' }
}

export const mockPaymentStats = {
  today: {
    totalAmount: 15600,
    totalCount: 8,
    wechatAmount: 6800,
    wechatCount: 4,
    alipayAmount: 5200,
    alipayCount: 2,
    bankAmount: 3600,
    bankCount: 2
  },
  week: {
    totalAmount: 98500,
    totalCount: 56,
    wechatAmount: 45200,
    wechatCount: 28,
    alipayAmount: 32800,
    alipayCount: 18,
    bankAmount: 20500,
    bankCount: 10
  },
  month: {
    totalAmount: 456800,
    totalCount: 256,
    wechatAmount: 215600,
    wechatCount: 128,
    alipayAmount: 156200,
    alipayCount: 86,
    bankAmount: 85000,
    bankCount: 42
  },
  refund: {
    pendingCount: 3,
    pendingAmount: 2800,
    todayRefundCount: 1,
    todayRefundAmount: 450,
    monthRefundCount: 12,
    monthRefundAmount: 15600
  }
}
