<template>
  <div class="process-container fade-in">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <el-icon class="icon"><DocumentChecked /></el-icon>
          订单处理
        </div>
        <div class="header-actions">
          <el-tabs v-model="activeTab" @tab-click="handleTabChange">
            <el-tab-pane label="待处理" name="pending">
              <span class="tab-count">({{ stats.pending }})</span>
            </el-tab-pane>
            <el-tab-pane label="进行中" name="active">
              <span class="tab-count">({{ stats.active }})</span>
            </el-tab-pane>
            <el-tab-pane label="仲裁中" name="dispute">
              <span class="tab-count">({{ stats.dispute }})</span>
            </el-tab-pane>
            <el-tab-pane label="已完成" name="completed">
              <span class="tab-count">({{ stats.completed }})</span>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <div class="card-body">
        <div class="search-form">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="关键词">
              <el-input
                v-model="searchForm.keyword"
                placeholder="订单号/用户/打手"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="游戏">
              <el-select
                v-model="searchForm.game"
                placeholder="全部游戏"
                clearable
                style="width: 150px"
              >
                <el-option v-for="game in gameList" :key="game.id" :label="game.name" :value="game.name" />
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

        <el-table
          v-loading="loading"
          :data="tableData"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="orderNo" label="订单号" width="180" />
          <el-table-column prop="title" label="订单信息" min-width="250">
            <template #default="{ row }">
              <div class="order-info">
                <div class="order-title">
                  <span class="title-text">{{ row.title }}</span>
                  <el-tag size="small" type="info">{{ row.game }}</el-tag>
                </div>
                <div class="order-range">{{ row.currentRank }} → {{ row.targetRank }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" width="100">
            <template #default="{ row }">
              <span class="amount">¥{{ row.amount }}</span>
            </template>
          </el-table-column>
          <el-table-column label="用户" width="130">
            <template #default="{ row }">
              <div class="user-mini">
                <div class="user-name">{{ row.nickname }}</div>
                <div class="user-phone">{{ row.phone }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="打手" width="130">
            <template #default="{ row }">
              <div class="player-mini" v-if="row.playerName">
                <div class="player-name">{{ row.playerName }}</div>
                <div class="player-phone">{{ row.playerPhone }}</div>
              </div>
              <span v-else class="no-player">未分配</span>
            </template>
          </el-table-column>
          <el-table-column label="进度" width="150">
            <template #default="{ row }">
              <div class="progress-info">
                <el-progress 
                  :percentage="getOrderProgress(row)" 
                  :stroke-width="8"
                  :color="getProgressColor(row)"
                />
                <span class="progress-text">{{ getOrderProgressText(row) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" fixed="right" width="280">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleView(row)">
                <el-icon><View /></el-icon>
                详情
              </el-button>
              <el-button 
                v-if="row.status === 'active'"
                type="success" 
                link 
                size="small"
                @click="handleComplete(row)"
              >
                <el-icon><CircleCheck /></el-icon>
                确认完成
              </el-button>
              <el-button 
                v-if="row.status === 'dispute'"
                type="warning" 
                link 
                size="small"
                @click="openDisputeDialog(row)"
              >
                <el-icon><Warning /></el-icon>
                仲裁处理
              </el-button>
              <el-button 
                v-if="row.status === 'pending' || row.status === 'active'"
                type="danger" 
                link 
                size="small"
                @click="handleCancel(row)"
              >
                <el-icon><Close /></el-icon>
                取消订单
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
      v-model="completeDialogVisible"
      title="确认订单完成"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border v-if="currentOrder.id">
        <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单标题">{{ currentOrder.title }}</el-descriptions-item>
        <el-descriptions-item label="打手">{{ currentOrder.playerName }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">{{ currentOrder.amount }}元</el-descriptions-item>
        <el-descriptions-item label="打手分成">{{ currentOrder.playerAmount }}元</el-descriptions-item>
      </el-descriptions>
      <el-form label-width="80px" style="margin-top: 20px">
        <el-form-item label="备注">
          <el-input
            v-model="completeRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入确认备注（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitComplete">
          确认完成
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="disputeDialogVisible"
      title="仲裁处理"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="dispute-content" v-if="currentOrder.id">
        <div class="dispute-section">
          <div class="section-title">订单信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="状态">仲裁中</el-descriptions-item>
            <el-descriptions-item label="订单标题">{{ currentOrder.title }}</el-descriptions-item>
            <el-descriptions-item label="金额">{{ currentOrder.amount }}元</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="dispute-section">
          <div class="section-title">双方信息</div>
          <div class="parties-info">
            <div class="party-info">
              <div class="party-label">用户</div>
              <div class="party-detail">
                <div class="party-name">{{ currentOrder.nickname }}</div>
                <div class="party-phone">{{ currentOrder.phone }}</div>
              </div>
            </div>
            <div class="party-divider">
              <el-icon><Switch /></el-icon>
            </div>
            <div class="party-info">
              <div class="party-label">打手</div>
              <div class="party-detail">
                <div class="party-name">{{ currentOrder.playerName || '未分配' }}</div>
                <div class="party-phone">{{ currentOrder.playerPhone || '-' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="dispute-section">
          <div class="section-title">仲裁处理</div>
          <el-form label-width="100px">
            <el-form-item label="处理结果">
              <el-radio-group v-model="disputeResult">
                <el-radio value="complete">确认完成（全额结算）</el-radio>
                <el-radio value="partial">部分完成（部分结算）</el-radio>
                <el-radio value="refund">全额退款</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="退款金额" v-if="disputeResult === 'partial'">
              <el-input-number
                v-model="refundAmount"
                :min="0"
                :max="currentOrder.amount || 0"
                :precision="2"
                placeholder="请输入退款金额"
              />
              <span class="amount-hint">订单总金额: ¥{{ currentOrder.amount || 0 }}</span>
            </el-form-item>
            <el-form-item label="处理说明">
              <el-input
                v-model="disputeRemark"
                type="textarea"
                :rows="4"
                placeholder="请输入详细的处理说明"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>
      <template #footer>
        <el-button @click="disputeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitDispute">
          提交处理
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="cancelDialogVisible"
      title="取消订单"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border v-if="currentOrder.id">
        <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单标题">{{ currentOrder.title }}</el-descriptions-item>
      </el-descriptions>
      <el-form label-width="80px" style="margin-top: 20px">
        <el-form-item label="取消原因">
          <el-select v-model="cancelReason" placeholder="请选择取消原因" style="width: 100%">
            <el-option label="用户主动取消" value="user_cancel" />
            <el-option label="打手无法完成" value="player_cancel" />
            <el-option label="双方协商取消" value="both_cancel" />
            <el-option label="其他原因" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="cancelRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入详细说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="submitLoading" @click="submitCancel">
          确认取消
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, completeOrder, handleDispute, cancelOrder } from '@/api/order'
import { mockGameList, mockOrderStatusMap } from '@/mock/order'

const router = useRouter()

const loading = ref(false)
const submitLoading = ref(false)
const activeTab = ref('pending')
const tableData = ref([])
const currentOrder = ref({})

const completeDialogVisible = ref(false)
const completeRemark = ref('')

const disputeDialogVisible = ref(false)
const disputeResult = ref('complete')
const disputeRemark = ref('')
const refundAmount = ref(0)

const cancelDialogVisible = ref(false)
const cancelReason = ref('')
const cancelRemark = ref('')

const gameList = ref(mockGameList)

const stats = reactive({
  pending: 0,
  active: 0,
  dispute: 0,
  completed: 0
})

const searchForm = reactive({
  keyword: '',
  game: '',
  dateRange: []
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const getStatusLabel = (status) => mockOrderStatusMap[status]?.label || status
const getStatusType = (status) => {
  const map = {
    waiting: 'warning',
    pending: 'warning',
    active: 'success',
    completed: 'info',
    dispute: 'warning',
    cancelled: 'danger',
    refunded: 'danger'
  }
  return map[status] || 'info'
}

const getOrderProgress = (row) => {
  if (row.status === 'waiting') return 0
  if (row.status === 'pending') return 20
  if (row.status === 'active') return 50
  if (row.status === 'dispute') return 70
  if (row.status === 'completed') return 100
  return 0
}

const getOrderProgressText = (row) => {
  if (row.status === 'waiting') return '待支付'
  if (row.status === 'pending') return '待接单'
  if (row.status === 'active') return '进行中'
  if (row.status === 'dispute') return '仲裁中'
  if (row.status === 'completed') return '已完成'
  return '未知'
}

const getProgressColor = (row) => {
  if (row.status === 'completed') return '#67C23A'
  if (row.status === 'active') return '#409EFF'
  if (row.status === 'dispute') return '#E6A23C'
  return '#909399'
}

const getStatusForTab = () => {
  if (activeTab.value === 'pending') return 'pending'
  if (activeTab.value === 'active') return 'active'
  if (activeTab.value === 'dispute') return 'dispute'
  if (activeTab.value === 'completed') return 'completed'
  return ''
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getOrderList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      status: getStatusForTab(),
      game: searchForm.game
    })
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('Failed to fetch order list:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const [pendingRes, activeRes, disputeRes, completedRes] = await Promise.all([
      getOrderList({ status: 'pending', pageSize: 1000 }),
      getOrderList({ status: 'active', pageSize: 1000 }),
      getOrderList({ status: 'dispute', pageSize: 1000 }),
      getOrderList({ status: 'completed', pageSize: 1000 })
    ])
    
    stats.pending = pendingRes.data?.total || 0
    stats.active = activeRes.data?.total || 0
    stats.dispute = disputeRes.data?.total || 0
    stats.completed = completedRes.data?.total || 0
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

const handleTabChange = () => {
  pagination.page = 1
  fetchData()
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.game = ''
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

const handleView = (row) => {
  router.push(`/order/detail/${row.id}`)
}

const handleComplete = (row) => {
  currentOrder.value = row
  completeRemark.value = ''
  completeDialogVisible.value = true
}

const openDisputeDialog = (row) => {
  currentOrder.value = row
  disputeResult.value = 'complete'
  disputeRemark.value = ''
  refundAmount.value = 0
  disputeDialogVisible.value = true
}

const handleCancel = (row) => {
  currentOrder.value = row
  cancelReason.value = ''
  cancelRemark.value = ''
  cancelDialogVisible.value = true
}

const submitComplete = async () => {
  submitLoading.value = true
  try {
    const res = await completeOrder({
      orderId: currentOrder.value.id,
      remark: completeRemark.value
    })
    if (res.code === 200) {
      ElMessage.success('订单已确认完成')
      completeDialogVisible.value = false
      fetchData()
      fetchStats()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

const submitDispute = async () => {
  if (!disputeRemark.value) {
    ElMessage.warning('请输入处理说明')
    return
  }

  submitLoading.value = true
  try {
    const res = await handleDispute({
      orderId: currentOrder.value.id,
      result: disputeResult.value,
      refundAmount: disputeResult.value === 'partial' ? refundAmount.value : 0,
      remark: disputeRemark.value
    })
    if (res.code === 200) {
      ElMessage.success('仲裁处理完成')
      disputeDialogVisible.value = false
      fetchData()
      fetchStats()
    }
  } catch (error) {
    ElMessage.error('处理失败')
  } finally {
    submitLoading.value = false
  }
}

const submitCancel = async () => {
  if (!cancelReason.value) {
    ElMessage.warning('请选择取消原因')
    return
  }

  submitLoading.value = true
  try {
    const res = await cancelOrder({
      orderId: currentOrder.value.id,
      reason: cancelReason.value,
      operator: '客服',
      remark: cancelRemark.value
    })
    if (res.code === 200) {
      ElMessage.success('订单已取消')
      cancelDialogVisible.value = false
      fetchData()
      fetchStats()
    }
  } catch (error) {
    ElMessage.error('取消失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchData()
  fetchStats()
})
</script>

<style lang="scss" scoped>
.process-container {
  .search-form {
    margin-bottom: 20px;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .header-actions {
    display: flex;
    gap: 12px;

    .tab-count {
      color: var(--text-muted);
      font-size: 12px;
    }
  }

  .order-info {
    .order-title {
      display: flex;
      align-items: center;
      gap: 8px;

      .title-text {
        font-weight: 500;
        color: var(--text-primary);
      }
    }

    .order-range {
      font-size: 12px;
      color: var(--accent-blue);
      margin-top: 4px;
    }
  }

  .amount {
    color: var(--accent-orange);
    font-weight: 600;
    font-size: 15px;
  }

  .user-mini,
  .player-mini {
    .user-name,
    .player-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .user-phone,
    .player-phone {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }
  }

  .no-player {
    color: var(--text-muted);
    font-size: 13px;
  }

  .progress-info {
    .progress-text {
      display: block;
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
      text-align: center;
    }
  }

  .dispute-content {
    .dispute-section {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
    }

    .parties-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: var(--bg-secondary);
      border-radius: 8px;
    }

    .party-info {
      text-align: center;

      .party-label {
        font-size: 12px;
        color: var(--text-muted);
        margin-bottom: 8px;
      }

      .party-detail {
        .party-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .party-phone {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
        }
      }
    }

    .party-divider {
      font-size: 20px;
      color: var(--accent-blue);
    }

    .amount-hint {
      margin-left: 12px;
      font-size: 12px;
      color: var(--text-muted);
    }
  }
}
</style>
