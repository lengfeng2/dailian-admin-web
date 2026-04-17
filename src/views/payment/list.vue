<template>
  <div class="payment-list-container fade-in">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <el-icon class="icon"><Wallet /></el-icon>
          支付列表
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出记录
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <div class="search-form">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="关键词">
              <el-input
                v-model="searchForm.keyword"
                placeholder="支付单号/订单号/订单标题/付款人"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="支付方式">
              <el-select
                v-model="searchForm.payMethod"
                placeholder="全部方式"
                clearable
                style="width: 140px"
              >
                <el-option 
                  v-for="(item, key) in mockPayMethodMap" 
                  :key="key" 
                  :label="item.label" 
                  :value="key" 
                />
              </el-select>
            </el-form-item>
            <el-form-item label="支付状态">
              <el-select
                v-model="searchForm.payStatus"
                placeholder="全部状态"
                clearable
                style="width: 140px"
              >
                <el-option 
                  v-for="(item, key) in mockPayStatusMap" 
                  :key="key" 
                  :label="item.label" 
                  :value="key" 
                />
              </el-select>
            </el-form-item>
            <el-form-item label="退款状态">
              <el-select
                v-model="searchForm.refundStatus"
                placeholder="全部状态"
                clearable
                style="width: 140px"
              >
                <el-option 
                  v-for="(item, key) in mockRefundStatusMap" 
                  :key="key" 
                  :label="item.label" 
                  :value="key" 
                />
              </el-select>
            </el-form-item>
            <el-form-item label="时间">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 280px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="handleReset">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="stats-overview">
          <div class="stat-item">
            <div class="stat-icon total">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">今日交易额</div>
              <div class="stat-value">¥{{ stats.today.totalAmount }}</div>
              <div class="stat-sub">共 {{ stats.today.totalCount }} 笔</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon wechat">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">微信支付</div>
              <div class="stat-value">¥{{ stats.today.wechatAmount }}</div>
              <div class="stat-sub">{{ stats.today.wechatCount }} 笔</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon alipay">
              <el-icon><Wallet /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">支付宝</div>
              <div class="stat-value">¥{{ stats.today.alipayAmount }}</div>
              <div class="stat-sub">{{ stats.today.alipayCount }} 笔</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon bank">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">银行转账</div>
              <div class="stat-value">¥{{ stats.today.bankAmount }}</div>
              <div class="stat-sub">{{ stats.today.bankCount }} 笔</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon refund">
              <el-icon><Refund /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">待处理退款</div>
              <div class="stat-value">¥{{ stats.refund.pendingAmount }}</div>
              <div class="stat-sub">{{ stats.refund.pendingCount }} 笔</div>
            </div>
          </div>
        </div>

        <el-table
          v-loading="loading"
          :data="tableData"
          stripe
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="paymentNo" label="支付单号" width="180" />
          <el-table-column prop="orderNo" label="关联订单" width="160" />
          <el-table-column prop="orderTitle" label="订单信息" min-width="220">
            <template #default="{ row }">
              <div class="order-info">
                <div class="order-title">{{ row.orderTitle }}</div>
                <div class="payer-info">
                  <span class="payer">{{ row.payer }}</span>
                  <span class="phone">{{ row.payerPhone }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" width="120">
            <template #default="{ row }">
              <div class="amount-info">
                <span class="amount">¥{{ row.amount }}</span>
                <span v-if="row.refundAmount > 0" class="refund-amount">
                  已退¥{{ row.refundAmount }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="payMethod" label="支付方式" width="120">
            <template #default="{ row }">
              <div class="pay-method" :style="{ color: mockPayMethodMap[row.payMethod]?.color }">
                <el-icon><component :is="mockPayMethodMap[row.payMethod]?.icon" /></el-icon>
                <span>{{ mockPayMethodMap[row.payMethod]?.label }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="payStatus" label="支付状态" width="100">
            <template #default="{ row }">
              <el-tag :type="mockPayStatusMap[row.payStatus]?.type" size="small">
                {{ mockPayStatusMap[row.payStatus]?.label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="refundStatus" label="退款状态" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.refundStatus !== 'none'" :type="mockRefundStatusMap[row.refundStatus]?.type" size="small">
                {{ mockRefundStatusMap[row.refundStatus]?.label }}
              </el-tag>
              <span v-else class="no-refund">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="tradeNo" label="第三方流水号" width="220">
            <template #default="{ row }">
              <span v-if="row.tradeNo" class="trade-no">{{ row.tradeNo }}</span>
              <span v-else class="no-trade-no">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column prop="paidAt" label="支付时间" width="180">
            <template #default="{ row }">
              <span v-if="row.paidAt">{{ row.paidAt }}</span>
              <span v-else class="no-paid-time">-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="220">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleView(row)">
                <el-icon><View /></el-icon>
                详情
              </el-button>
              <el-button 
                v-if="row.payStatus === 'pending'"
                type="success" 
                link 
                size="small"
                @click="handleConfirm(row)"
              >
                <el-icon><Check /></el-icon>
                确认支付
              </el-button>
              <el-button 
                v-if="row.refundStatus === 'pending'"
                type="warning" 
                link 
                size="small"
                @click="handleRefund(row)"
              >
                <el-icon><Refund /></el-icon>
                处理退款
              </el-button>
              <el-button 
                v-if="row.payStatus === 'pending'"
                type="danger" 
                link 
                size="small"
                @click="handleClose(row)"
              >
                <el-icon><Close /></el-icon>
                关闭
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <el-dialog
      v-model="showConfirmDialog"
      title="人工确认支付"
      width="500px"
    >
      <el-form :model="confirmForm" label-width="100px">
        <el-form-item label="支付单号">
          <el-input :value="currentPayment?.paymentNo" disabled />
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input :value="'¥' + currentPayment?.amount" disabled />
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
          <el-input :value="currentPayment?.paymentNo" disabled />
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input :value="'¥' + currentPayment?.amount" disabled />
        </el-form-item>
        <el-form-item label="申请退款金额">
          <el-input :value="'¥' + currentPayment?.refundAmount" disabled />
        </el-form-item>
        <el-form-item label="退款原因">
          <el-input :value="currentPayment?.refundReason" type="textarea" :rows="2" disabled />
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPaymentList, getPaymentStats, manualConfirmPayment, processRefund, closePayment, mockPayStatusMap, mockPayMethodMap, mockRefundStatusMap } from '@/api/payment'

const router = useRouter()

const loading = ref(false)
const tableData = ref([])
const selectedPayments = ref([])
const currentPayment = ref(null)
const showConfirmDialog = ref(false)
const showRefundDialog = ref(false)
const showCloseDialog = ref(false)

const stats = reactive({
  today: {
    totalAmount: 0,
    totalCount: 0,
    wechatAmount: 0,
    wechatCount: 0,
    alipayAmount: 0,
    alipayCount: 0,
    bankAmount: 0,
    bankCount: 0
  },
  week: {},
  month: {},
  refund: {
    pendingCount: 0,
    pendingAmount: 0
  }
})

const searchForm = reactive({
  keyword: '',
  payMethod: '',
  payStatus: '',
  refundStatus: '',
  dateRange: []
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
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

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      payMethod: searchForm.payMethod,
      payStatus: searchForm.payStatus,
      refundStatus: searchForm.refundStatus
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startTime = searchForm.dateRange[0]
      params.endTime = searchForm.dateRange[1]
    }
    const res = await getPaymentList(params)
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('Failed to fetch payment list:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
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

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.payMethod = ''
  searchForm.payStatus = ''
  searchForm.refundStatus = ''
  searchForm.dateRange = []
  pagination.page = 1
  fetchData()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchData()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  fetchData()
}

const handleSelectionChange = (selection) => {
  selectedPayments.value = selection
}

const handleView = (row) => {
  router.push(`/payment/detail/${row.id}`)
}

const handleConfirm = (row) => {
  currentPayment.value = row
  confirmForm.tradeNo = ''
  confirmForm.remark = ''
  showConfirmDialog.value = true
}

const handleRefund = (row) => {
  currentPayment.value = row
  refundForm.reason = ''
  showRefundDialog.value = true
}

const handleClose = (row) => {
  currentPayment.value = row
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
      paymentId: currentPayment.value.id,
      tradeNo: confirmForm.tradeNo,
      remark: confirmForm.remark
    })
    if (res.code === 200) {
      ElMessage.success(res.message)
      showConfirmDialog.value = false
      fetchData()
      fetchStats()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const approveRefund = async () => {
  try {
    const res = await processRefund({
      paymentId: currentPayment.value.id,
      action: 'approve',
      reason: refundForm.reason
    })
    if (res.code === 200) {
      ElMessage.success('退款已处理')
      showRefundDialog.value = false
      fetchData()
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
      paymentId: currentPayment.value.id,
      action: 'reject',
      reason: refundForm.reason
    })
    if (res.code === 200) {
      ElMessage.success('退款已驳回')
      showRefundDialog.value = false
      fetchData()
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
      paymentId: currentPayment.value.id,
      reason: closeForm.reason
    })
    if (res.code === 200) {
      ElMessage.success(res.message)
      showCloseDialog.value = false
      fetchData()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleExport = async () => {
  try {
    const params = {
      page: 1,
      pageSize: 10000,
      keyword: searchForm.keyword,
      payMethod: searchForm.payMethod,
      payStatus: searchForm.payStatus,
      refundStatus: searchForm.refundStatus
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startTime = searchForm.dateRange[0]
      params.endTime = searchForm.dateRange[1]
    }
    const res = await getPaymentList(params)
    if (res.code === 200 && res.data.list.length > 0) {
      const list = res.data.list
      
      const headers = [
        '支付单号',
        '关联订单',
        '订单信息',
        '付款人',
        '联系电话',
        '金额',
        '支付方式',
        '支付状态',
        '退款状态',
        '第三方流水号',
        '创建时间',
        '支付时间'
      ]
      
      const methodMap = {
        wechat: '微信支付',
        alipay: '支付宝',
        bank: '银行转账'
      }
      
      const statusMap = {
        pending: '待支付',
        success: '支付成功',
        failed: '支付失败',
        closed: '已关闭',
        refunded: '已退款'
      }
      
      const refundMap = {
        none: '无',
        pending: '退款中',
        processing: '处理中',
        success: '退款成功',
        failed: '退款失败',
        rejected: '退款驳回'
      }
      
      const rows = list.map(item => [
        item.paymentNo,
        item.orderNo,
        item.orderTitle,
        item.payer,
        item.payerPhone,
        item.amount,
        methodMap[item.payMethod] || item.payMethod,
        statusMap[item.payStatus] || item.payStatus,
        refundMap[item.refundStatus] || item.refundStatus,
        item.tradeNo || '-',
        item.createdAt,
        item.paidAt || '-'
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `支付记录_${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      ElMessage.success(`成功导出 ${list.length} 条记录`)
    } else {
      ElMessage.warning('没有可导出的数据')
    }
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  fetchData()
  fetchStats()
})
</script>

<style lang="scss" scoped>
.payment-list-container {
  .search-form {
    margin-bottom: 20px;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }

  .stats-overview {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: var(--bg-secondary);
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;

      &.total {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
      }

      &.wechat {
        background: linear-gradient(135deg, #07C160 0%, #05A150 100%);
        color: #fff;
      }

      &.alipay {
        background: linear-gradient(135deg, #1677FF 0%, #0d5bc0 100%);
        color: #fff;
      }

      &.bank {
        background: linear-gradient(135deg, #E6A23C 0%, #cf9235 100%);
        color: #fff;
      }

      &.refund {
        background: linear-gradient(135deg, #F56C6C 0%, #db5a5a 100%);
        color: #fff;
      }
    }

    .stat-content {
      flex: 1;

      .stat-label {
        font-size: 13px;
        color: var(--text-muted);
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 20px;
        font-weight: 700;
        color: var(--text-primary);
      }

      .stat-sub {
        font-size: 12px;
        color: var(--text-muted);
        margin-top: 2px;
      }
    }
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .order-info {
    .order-title {
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .payer-info {
      font-size: 12px;
      color: var(--text-muted);

      .payer {
        margin-right: 8px;
      }
    }
  }

  .amount-info {
    display: flex;
    flex-direction: column;

    .amount {
      font-weight: 600;
      color: var(--accent-orange);
      font-size: 14px;
    }

    .refund-amount {
      font-size: 12px;
      color: #F56C6C;
      margin-top: 2px;
    }
  }

  .pay-method {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
  }

  .no-refund,
  .no-trade-no,
  .no-paid-time {
    color: var(--text-muted);
    font-size: 13px;
  }

  .trade-no {
    font-size: 12px;
    font-family: monospace;
    color: var(--text-secondary);
  }
}
</style>
