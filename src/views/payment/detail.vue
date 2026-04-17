<template>
  <div class="payment-detail-container fade-in">
    <div class="page-header">
      <el-button @click="handleBack">
        <el-icon><ArrowLeft /></el-icon>
        返回列表
      </el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="16">
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <el-icon class="icon"><Document /></el-icon>
              支付详情
            </div>
            <div class="header-actions">
              <el-button 
                v-if="paymentInfo?.payStatus === 'pending'"
                type="success" 
                @click="handleConfirm"
              >
                <el-icon><Check /></el-icon>
                确认支付
              </el-button>
              <el-button 
                v-if="paymentInfo?.refundStatus === 'pending'"
                type="warning" 
                @click="handleRefund"
              >
                <el-icon><Refund /></el-icon>
                处理退款
              </el-button>
              <el-button 
                v-if="paymentInfo?.payStatus === 'pending'"
                type="danger" 
                @click="handleClose"
              >
                <el-icon><Close /></el-icon>
                关闭订单
              </el-button>
            </div>
          </div>
          <div class="card-body">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="支付单号">
                <span class="highlight">{{ paymentInfo?.paymentNo }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="关联订单">
                <el-button type="primary" link @click="goToOrder">
                  {{ paymentInfo?.orderNo }}
                </el-button>
              </el-descriptions-item>
              <el-descriptions-item label="订单标题" :span="2">
                {{ paymentInfo?.orderTitle }}
              </el-descriptions-item>
              <el-descriptions-item label="付款人">
                {{ paymentInfo?.payer }}
              </el-descriptions-item>
              <el-descriptions-item label="付款人电话">
                {{ paymentInfo?.payerPhone }}
              </el-descriptions-item>
              <el-descriptions-item label="支付金额">
                <span class="amount-highlight">¥{{ paymentInfo?.amount }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="支付方式">
                <div class="pay-method" :style="{ color: mockPayMethodMap[paymentInfo?.payMethod]?.color }">
                  <el-icon><component :is="mockPayMethodMap[paymentInfo?.payMethod]?.icon" /></el-icon>
                  <span>{{ mockPayMethodMap[paymentInfo?.payMethod]?.label }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="支付状态">
                <el-tag :type="mockPayStatusMap[paymentInfo?.payStatus]?.type" size="large">
                  {{ mockPayStatusMap[paymentInfo?.payStatus]?.label }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="退款状态">
                <el-tag 
                  v-if="paymentInfo?.refundStatus !== 'none'"
                  :type="mockRefundStatusMap[paymentInfo?.refundStatus]?.type" 
                  size="large"
                >
                  {{ mockRefundStatusMap[paymentInfo?.refundStatus]?.label }}
                </el-tag>
                <span v-else class="no-refund">-</span>
              </el-descriptions-item>
              <el-descriptions-item label="第三方流水号">
                <span v-if="paymentInfo?.tradeNo" class="trade-no">{{ paymentInfo?.tradeNo }}</span>
                <span v-else class="no-trade-no">-</span>
              </el-descriptions-item>
              <el-descriptions-item v-if="paymentInfo?.refundAmount > 0" label="退款金额">
                <span class="refund-amount">¥{{ paymentInfo?.refundAmount }}</span>
              </el-descriptions-item>
              <el-descriptions-item v-if="paymentInfo?.refundReason" label="退款原因" :span="2">
                {{ paymentInfo?.refundReason }}
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ paymentInfo?.createdAt }}
              </el-descriptions-item>
              <el-descriptions-item label="支付时间">
                <span v-if="paymentInfo?.paidAt">{{ paymentInfo?.paidAt }}</span>
                <span v-else class="no-paid-time">-</span>
              </el-descriptions-item>
              <el-descriptions-item v-if="paymentInfo?.refundAt" label="退款时间">
                {{ paymentInfo?.refundAt }}
              </el-descriptions-item>
              <el-descriptions-item v-if="paymentInfo?.refundTradeNo" label="退款流水号">
                <span class="trade-no">{{ paymentInfo?.refundTradeNo }}</span>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>

        <div class="card" style="margin-top: 20px;">
          <div class="card-header">
            <div class="card-title">
              <el-icon class="icon"><Timer /></el-icon>
              操作日志
            </div>
          </div>
          <div class="card-body">
            <el-timeline>
              <el-timeline-item
                v-for="(log, index) in paymentInfo?.logs"
                :key="index"
                :timestamp="log.time"
                placement="top"
                :type="getLogType(log.status)"
              >
                <div class="timeline-content">
                  <div class="timeline-action">{{ log.action }}</div>
                  <div class="timeline-operator">操作人: {{ log.operator }}</div>
                  <div v-if="log.tradeNo" class="timeline-extra">流水号: {{ log.tradeNo }}</div>
                  <div v-if="log.reason" class="timeline-extra">原因: {{ log.reason }}</div>
                  <div v-if="log.refundAmount" class="timeline-extra">退款金额: ¥{{ log.refundAmount }}</div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </el-col>

      <el-col :span="8">
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <el-icon class="icon"><DataAnalysis /></el-icon>
              支付统计
            </div>
          </div>
          <div class="card-body">
            <div class="stat-card">
              <div class="stat-card-header">今日统计</div>
              <div class="stat-card-content">
                <div class="stat-card-item">
                  <div class="stat-card-label">交易金额</div>
                  <div class="stat-card-value">¥{{ stats.today?.totalAmount }}</div>
                </div>
                <div class="stat-card-item">
                  <div class="stat-card-label">交易笔数</div>
                  <div class="stat-card-value">{{ stats.today?.totalCount }} 笔</div>
                </div>
              </div>
            </div>

            <div class="stat-card" style="margin-top: 16px;">
              <div class="stat-card-header">本周统计</div>
              <div class="stat-card-content">
                <div class="stat-card-item">
                  <div class="stat-card-label">交易金额</div>
                  <div class="stat-card-value">¥{{ stats.week?.totalAmount }}</div>
                </div>
                <div class="stat-card-item">
                  <div class="stat-card-label">交易笔数</div>
                  <div class="stat-card-value">{{ stats.week?.totalCount }} 笔</div>
                </div>
              </div>
            </div>

            <div class="stat-card" style="margin-top: 16px;">
              <div class="stat-card-header">退款待处理</div>
              <div class="stat-card-content">
                <div class="stat-card-item">
                  <div class="stat-card-label">待处理笔数</div>
                  <div class="stat-card-value warning">{{ stats.refund?.pendingCount }} 笔</div>
                </div>
                <div class="stat-card-item">
                  <div class="stat-card-label">待处理金额</div>
                  <div class="stat-card-value warning">¥{{ stats.refund?.pendingAmount }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card" style="margin-top: 20px;">
          <div class="card-header">
            <div class="card-title">
              <el-icon class="icon"><Wallet /></el-icon>
              支付方式分布
            </div>
          </div>
          <div class="card-body">
            <div class="pay-method-stats">
              <div class="pay-method-stat-item">
                <div class="pay-method-icon wechat">
                  <el-icon><ChatDotRound /></el-icon>
                </div>
                <div class="pay-method-info">
                  <div class="pay-method-name">微信支付</div>
                  <div class="pay-method-amount">¥{{ stats.today?.wechatAmount }}</div>
                  <div class="pay-method-count">{{ stats.today?.wechatCount }} 笔</div>
                </div>
              </div>
              <div class="pay-method-stat-item">
                <div class="pay-method-icon alipay">
                  <el-icon><Wallet /></el-icon>
                </div>
                <div class="pay-method-info">
                  <div class="pay-method-name">支付宝</div>
                  <div class="pay-method-amount">¥{{ stats.today?.alipayAmount }}</div>
                  <div class="pay-method-count">{{ stats.today?.alipayCount }} 笔</div>
                </div>
              </div>
              <div class="pay-method-stat-item">
                <div class="pay-method-icon bank">
                  <el-icon><OfficeBuilding /></el-icon>
                </div>
                <div class="pay-method-info">
                  <div class="pay-method-name">银行转账</div>
                  <div class="pay-method-amount">¥{{ stats.today?.bankAmount }}</div>
                  <div class="pay-method-count">{{ stats.today?.bankCount }} 笔</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-dialog
      v-model="showConfirmDialog"
      title="人工确认支付"
      width="500px"
    >
      <el-form :model="confirmForm" label-width="100px">
        <el-form-item label="支付单号">
          <el-input :value="paymentInfo?.paymentNo" disabled />
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input :value="'¥' + paymentInfo?.amount" disabled />
        </el-form-item>
        <el-form-item label="第三方流水号">
          <el-input v-model="confirmForm.tradeNo" placeholder="请输入银行流水号或交易号" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="confirmForm.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showConfirmDialog = false">取消</el-button>
        <el-button type="primary" @click="submitConfirm">确认支付</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showRefundDialog"
      title="处理退款申请"
      width="500px"
    >
      <el-form :model="refundForm" label-width="100px">
        <el-form-item label="支付单号">
          <el-input :value="paymentInfo?.paymentNo" disabled />
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input :value="'¥' + paymentInfo?.amount" disabled />
        </el-form-item>
        <el-form-item label="申请退款金额">
          <el-input :value="'¥' + paymentInfo?.refundAmount" disabled />
        </el-form-item>
        <el-form-item label="退款原因">
          <el-input :value="paymentInfo?.refundReason" type="textarea" :rows="2" disabled />
        </el-form-item>
        <el-form-item label="处理意见">
          <el-input v-model="refundForm.reason" type="textarea" :rows="2" placeholder="请输入处理意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRefundDialog = false">取消</el-button>
        <el-button type="danger" @click="rejectRefund">驳回申请</el-button>
        <el-button type="primary" @click="approveRefund">同意退款</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showCloseDialog"
      title="确认关闭支付订单"
      width="400px"
    >
      <el-form :model="closeForm" label-width="100px">
        <el-form-item label="关闭原因">
          <el-input v-model="closeForm.reason" type="textarea" :rows="2" placeholder="请输入关闭原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCloseDialog = false">取消</el-button>
        <el-button type="danger" @click="submitClose">确认关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPaymentDetail, getPaymentStats, manualConfirmPayment, processRefund, closePayment, mockPayStatusMap, mockPayMethodMap, mockRefundStatusMap } from '@/api/payment'

const route = useRoute()
const router = useRouter()

const paymentInfo = ref(null)
const showConfirmDialog = ref(false)
const showRefundDialog = ref(false)
const showCloseDialog = ref(false)

const stats = reactive({
  today: {},
  week: {},
  refund: {}
})

const confirmForm = reactive({
  tradeNo: '',
  remark: ''
})

const refundForm = reactive({
  reason: ''
})

const closeForm = reactive({
  reason: ''
})

const fetchDetail = async () => {
  const id = route.params.id
  if (!id) return
  
  try {
    const res = await getPaymentDetail(id)
    if (res.code === 200) {
      paymentInfo.value = res.data
    } else {
      ElMessage.error(res.message || '获取支付详情失败')
    }
  } catch (error) {
    console.error('Failed to fetch payment detail:', error)
    ElMessage.error('获取支付详情失败')
  }
}

const fetchStats = async () => {
  try {
    const res = await getPaymentStats()
    if (res.code === 200) {
      Object.assign(stats, res.data)
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

const handleBack = () => {
  router.push('/payment/list')
}

const goToOrder = () => {
  router.push(`/order/detail/${paymentInfo.value.orderNo}`)
}

const getLogType = (status) => {
  const map = {
    pending: 'warning',
    success: 'success',
    failed: 'danger',
    closed: 'info',
    refunded: 'info',
    rejected: 'danger'
  }
  return map[status] || 'primary'
}

const handleConfirm = () => {
  confirmForm.tradeNo = ''
  confirmForm.remark = ''
  showConfirmDialog.value = true
}

const handleRefund = () => {
  refundForm.reason = ''
  showRefundDialog.value = true
}

const handleClose = () => {
  closeForm.reason = ''
  showCloseDialog.value = true
}

const submitConfirm = async () => {
  if (!confirmForm.tradeNo) {
    ElMessage.warning('请输入第三方流水号')
    return
  }
  try {
    const res = await manualConfirmPayment({
      paymentId: paymentInfo.value.id,
      tradeNo: confirmForm.tradeNo,
      remark: confirmForm.remark
    })
    if (res.code === 200) {
      ElMessage.success(res.message)
      showConfirmDialog.value = false
      fetchDetail()
      fetchStats()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const approveRefund = async () => {
  try {
    const res = await processRefund({
      paymentId: paymentInfo.value.id,
      action: 'approve',
      reason: refundForm.reason
    })
    if (res.code === 200) {
      ElMessage.success('退款已处理')
      showRefundDialog.value = false
      fetchDetail()
      fetchStats()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const rejectRefund = async () => {
  if (!refundForm.reason) {
    ElMessage.warning('请输入处理意见')
    return
  }
  try {
    const res = await processRefund({
      paymentId: paymentInfo.value.id,
      action: 'reject',
      reason: refundForm.reason
    })
    if (res.code === 200) {
      ElMessage.success('退款已驳回')
      showRefundDialog.value = false
      fetchDetail()
      fetchStats()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const submitClose = async () => {
  if (!closeForm.reason) {
    ElMessage.warning('请输入关闭原因')
    return
  }
  try {
    const res = await closePayment({
      paymentId: paymentInfo.value.id,
      reason: closeForm.reason
    })
    if (res.code === 200) {
      ElMessage.success(res.message)
      showCloseDialog.value = false
      fetchDetail()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  fetchDetail()
  fetchStats()
})
</script>

<style lang="scss" scoped>
.payment-detail-container {
  .page-header {
    margin-bottom: 20px;
  }

  .card {
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .highlight {
    font-weight: 600;
    color: var(--accent-cyan);
    font-family: monospace;
  }

  .amount-highlight {
    font-weight: 700;
    color: var(--accent-orange);
    font-size: 18px;
  }

  .refund-amount {
    color: #F56C6C;
    font-weight: 600;
  }

  .pay-method {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
  }

  .no-refund,
  .no-trade-no,
  .no-paid-time {
    color: var(--text-muted);
  }

  .trade-no {
    font-family: monospace;
    color: var(--text-secondary);
    font-size: 12px;
  }

  .timeline-content {
    .timeline-action {
      font-weight: 500;
      color: var(--text-primary);
    }

    .timeline-operator {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .timeline-extra {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 2px;
    }
  }

  .stat-card {
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 16px;

    .stat-card-header {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    .stat-card-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .stat-card-item {
      .stat-card-label {
        font-size: 12px;
        color: var(--text-muted);
        margin-bottom: 4px;
      }

      .stat-card-value {
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary);

        &.warning {
          color: #E6A23C;
        }
      }
    }
  }

  .pay-method-stats {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .pay-method-stat-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--bg-secondary);
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateX(4px);
    }

    .pay-method-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #fff;

      &.wechat {
        background: linear-gradient(135deg, #07C160 0%, #05A150 100%);
      }

      &.alipay {
        background: linear-gradient(135deg, #1677FF 0%, #0d5bc0 100%);
      }

      &.bank {
        background: linear-gradient(135deg, #E6A23C 0%, #cf9235 100%);
      }
    }

    .pay-method-info {
      flex: 1;

      .pay-method-name {
        font-weight: 500;
        color: var(--text-primary);
      }

      .pay-method-amount {
        font-size: 14px;
        font-weight: 600;
        color: var(--accent-orange);
        margin-top: 2px;
      }

      .pay-method-count {
        font-size: 12px;
        color: var(--text-muted);
        margin-top: 2px;
      }
    }
  }
}
</style>
