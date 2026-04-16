<template>
  <div class="order-detail-container fade-in">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <el-icon class="icon"><View /></el-icon>
          订单详情
        </div>
        <div class="header-actions">
          <el-button @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回列表
          </el-button>
          <el-button type="primary" v-if="order.status === 'pending' && !order.playerId" @click="handleAssign">
            <el-icon><Share /></el-icon>
            分配打手
          </el-button>
          <el-button type="success" v-if="order.status === 'active'" @click="handleComplete">
            <el-icon><CircleCheck /></el-icon>
            确认完成
          </el-button>
          <el-button type="warning" v-if="order.status === 'dispute'" @click="openDisputeDialog">
            <el-icon><Warning /></el-icon>
            仲裁处理
          </el-button>
          <el-button type="danger" v-if="order.status === 'pending' || order.status === 'active'" @click="handleCancel">
            <el-icon><Close /></el-icon>
            取消订单
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <div class="status-bar" :class="`status-${order.status}`">
          <div class="status-left">
            <el-icon class="status-icon"><Clock /></el-icon>
            <div class="status-info">
              <div class="status-text">{{ getStatusText() }}</div>
              <div class="status-time">{{ getStatusTime() }}</div>
            </div>
          </div>
          <div class="status-right">
            <el-tag :type="getStatusType()" size="large">
              {{ getStatusLabel() }}
            </el-tag>
          </div>
        </div>

        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <div class="tab-content">
              <div class="info-section">
                <div class="section-title">订单信息</div>
                <el-descriptions :column="3" border size="small">
                  <el-descriptions-item label="订单号">{{ order.orderNo }}</el-descriptions-item>
                  <el-descriptions-item label="订单标题">{{ order.title }}</el-descriptions-item>
                  <el-descriptions-item label="游戏类型">{{ order.game }}</el-descriptions-item>
                  <el-descriptions-item label="订单类型">{{ order.category }}</el-descriptions-item>
                  <el-descriptions-item label="当前段位">{{ order.currentRank }}</el-descriptions-item>
                  <el-descriptions-item label="目标段位">{{ order.targetRank }}</el-descriptions-item>
                  <el-descriptions-item label="订单金额">
                    <span class="amount-text">¥{{ order.amount }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="押金">
                    <span class="deposit-text">¥{{ order.deposit }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="服务费">
                    <span class="fee-text">¥{{ order.serviceFee }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="打手分成">
                    <span class="player-amount-text">¥{{ order.playerAmount }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="支付状态">
                    <el-tag :type="order.payStatus === 'paid' ? 'success' : 'warning'" size="small">
                      {{ order.payStatus === 'paid' ? '已支付' : '待支付' }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="创建时间">{{ order.createdAt }}</el-descriptions-item>
                </el-descriptions>
              </div>

              <div class="info-section">
                <div class="section-title">用户信息</div>
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="用户名">{{ order.username }}</el-descriptions-item>
                  <el-descriptions-item label="昵称">{{ order.nickname }}</el-descriptions-item>
                  <el-descriptions-item label="联系电话">{{ order.phone }}</el-descriptions-item>
                </el-descriptions>
              </div>

              <div class="info-section" v-if="order.playerName">
                <div class="section-title">打手信息</div>
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="打手昵称">{{ order.playerName }}</el-descriptions-item>
                  <el-descriptions-item label="联系电话">{{ order.playerPhone }}</el-descriptions-item>
                  <el-descriptions-item label="开始时间" v-if="order.startTime">{{ order.startTime }}</el-descriptions-item>
                  <el-descriptions-item label="完成时间" v-if="order.endTime">{{ order.endTime }}</el-descriptions-item>
                </el-descriptions>
              </div>

              <div class="info-section" v-if="order.requirements || order.description">
                <div class="section-title">详细说明</div>
                <div class="detail-content">
                  <div class="detail-item" v-if="order.description">
                    <div class="detail-label">订单描述：</div>
                    <div class="detail-value">{{ order.description }}</div>
                  </div>
                  <div class="detail-item" v-if="order.requirements">
                    <div class="detail-label">特殊要求：</div>
                    <div class="detail-value">{{ order.requirements }}</div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="订单进度" name="progress">
            <div class="tab-content">
              <div class="progress-timeline">
                <el-timeline>
                  <el-timeline-item
                    v-for="(log, index) in sortedLogs"
                    :key="index"
                    :timestamp="log.time"
                    placement="top"
                    :type="getTimelineType(index, sortedLogs.length)"
                  >
                    <el-card shadow="never">
                      <div class="log-content">
                        <div class="log-action">{{ log.action }}</div>
                        <div class="log-operator" v-if="log.operator">操作人：{{ log.operator }}</div>
                        <div class="log-reason" v-if="log.reason">原因：{{ log.reason }}</div>
                        <div class="log-result" v-if="log.result">结果：{{ getResultText(log.result) }}</div>
                      </div>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="相关订单" name="related">
            <div class="tab-content">
              <div class="info-section">
                <div class="section-title">该用户其他订单</div>
                <el-table :data="userOrders" style="width: 100%" stripe>
                  <el-table-column prop="orderNo" label="订单号" width="180" />
                  <el-table-column prop="title" label="订单标题" min-width="200" />
                  <el-table-column prop="game" label="游戏" width="120" />
                  <el-table-column prop="amount" label="金额" width="100">
                    <template #default="{ row }">
                      <span class="amount-text">¥{{ row.amount }}</span>
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
                  <el-table-column label="操作" width="100">
                    <template #default="{ row }">
                      <el-button type="primary" link size="small" @click="handleViewOrder(row)">
                        查看
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <el-dialog
      v-model="assignDialogVisible"
      title="分配打手"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="assign-form">
        <div class="player-selection">
          <el-input
            v-model="playerSearchKeyword"
            placeholder="搜索打手昵称/姓名"
            prefix-icon="Search"
            clearable
            @input="filterPlayers"
            style="width: 300px; margin-bottom: 16px"
          />
          <el-table
            :data="filteredPlayers"
            stripe
            height="300"
            @selection-change="handlePlayerSelection"
            :row-key="(row) => row.id"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="nickname" label="打手昵称" width="140" />
            <el-table-column prop="games" label="擅长游戏" min-width="150">
              <template #default="{ row }">
                <el-tag v-for="(game, index) in row.games.slice(0, 3)" :key="index" size="small" style="margin-right: 4px">
                  {{ game }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="rating" label="评分" width="80">
              <template #default="{ row }">
                <div class="rating-inline">
                  <el-rate v-model="row.rating" disabled :max="5" size="small" />
                  <span class="rating-value">{{ row.rating }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="completedCount" label="完成单量" width="100" align="center" />
            <el-table-column prop="totalEarnings" label="总收入" width="120">
              <template #default="{ row }">
                <span class="earnings-text">¥{{ row.totalEarnings.toLocaleString() }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-form label-width="80px" style="margin-top: 20px">
          <el-form-item label="备注">
            <el-input
              v-model="assignRemark"
              type="textarea"
              :rows="2"
              placeholder="请输入分配备注（选填）"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitAssign">
          确认分配
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="completeDialogVisible"
      title="确认订单完成"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="订单号">{{ order.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单标题">{{ order.title }}</el-descriptions-item>
        <el-descriptions-item label="打手">{{ order.playerName }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">{{ order.amount }}元</el-descriptions-item>
        <el-descriptions-item label="打手分成">{{ order.playerAmount }}元</el-descriptions-item>
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
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px">
        <el-form-item label="处理结果">
          <el-radio-group v-model="disputeResult">
            <el-radio value="complete">确认完成（全额结算）</el-radio>
            <el-radio value="refund">全额退款</el-radio>
          </el-radio-group>
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
      <el-form label-width="80px">
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOrderDetail, getOrderList, assignOrder, completeOrder, handleDispute, cancelOrder } from '@/api/order'
import { getPlayerList } from '@/api/player'
import { mockOrderStatusMap } from '@/mock/order'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const submitLoading = ref(false)
const activeTab = ref('basic')
const order = ref({
  logs: []
})
const userOrders = ref([])

const assignDialogVisible = ref(false)
const completeDialogVisible = ref(false)
const disputeDialogVisible = ref(false)
const cancelDialogVisible = ref(false)

const playerSearchKeyword = ref('')
const filteredPlayers = ref([])
const availablePlayers = ref([])
const selectedPlayers = ref([])

const assignRemark = ref('')
const completeRemark = ref('')
const disputeResult = ref('complete')
const disputeRemark = ref('')
const cancelReason = ref('')
const cancelRemark = ref('')

const sortedLogs = computed(() => {
  return [...order.value.logs].reverse()
})

const getStatusLabel = (status = order.value.status) => {
  return mockOrderStatusMap[status]?.label || status
}

const getStatusType = (status = order.value.status) => {
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

const getStatusText = () => {
  const status = order.value.status
  if (status === 'waiting') return '等待用户支付'
  if (status === 'pending') return '等待打手接单'
  if (status === 'active') return '打手正在代练中'
  if (status === 'dispute') return '订单存在纠纷，等待仲裁'
  if (status === 'completed') return '订单已完成'
  if (status === 'cancelled') return '订单已取消'
  if (status === 'refunded') return '订单已退款'
  return '未知状态'
}

const getStatusTime = () => {
  if (order.value.endTime) return order.value.endTime
  if (order.value.startTime) return order.value.startTime
  return order.value.createdAt || ''
}

const getTimelineType = (index, total) => {
  if (index === total - 1) return 'primary'
  if (index === 0) return 'success'
  return ''
}

const getResultText = (result) => {
  if (result === 'complete') return '确认完成'
  if (result === 'refund') return '全额退款'
  if (result === 'partial') return '部分退款'
  return result
}

const fetchOrderDetail = async () => {
  loading.value = true
  try {
    const orderId = route.params.id
    const res = await getOrderDetail(orderId)
    if (res.code === 200) {
      order.value = res.data
      fetchUserOrders(res.data.username)
    }
  } catch (error) {
    console.error('Failed to fetch order detail:', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

const fetchUserOrders = async (username) => {
  try {
    const res = await getOrderList({ pageSize: 5 })
    if (res.code === 200) {
      userOrders.value = res.data.list.filter(
        item => item.username === username && item.id !== order.value.id
      ).slice(0, 5)
    }
  } catch (error) {
    console.error('Failed to fetch user orders:', error)
  }
}

const fetchPlayers = async () => {
  try {
    const res = await getPlayerList({ status: 'active' })
    if (res.code === 200) {
      availablePlayers.value = res.data.list
      filteredPlayers.value = res.data.list
    }
  } catch (error) {
    console.error('Failed to fetch players:', error)
  }
}

const filterPlayers = () => {
  if (playerSearchKeyword.value) {
    filteredPlayers.value = availablePlayers.value.filter(
      item => item.nickname.toLowerCase().includes(playerSearchKeyword.value.toLowerCase()) ||
               item.realName.toLowerCase().includes(playerSearchKeyword.value.toLowerCase())
    )
  } else {
    filteredPlayers.value = availablePlayers.value
  }
}

const handlePlayerSelection = (selection) => {
  selectedPlayers.value = selection
}

const handleBack = () => {
  router.back()
}

const handleViewOrder = (row) => {
  router.push(`/order/detail/${row.id}`)
}

const handleAssign = () => {
  fetchPlayers()
  assignDialogVisible.value = true
}

const handleComplete = () => {
  completeRemark.value = ''
  completeDialogVisible.value = true
}

const openDisputeDialog = () => {
  disputeResult.value = 'complete'
  disputeRemark.value = ''
  disputeDialogVisible.value = true
}

const handleCancel = () => {
  cancelReason.value = ''
  cancelRemark.value = ''
  cancelDialogVisible.value = true
}

const submitAssign = async () => {
  if (selectedPlayers.value.length === 0) {
    ElMessage.warning('请选择打手')
    return
  }

  const player = selectedPlayers.value[0]
  submitLoading.value = true
  try {
    const res = await assignOrder({
      orderId: order.value.id,
      playerId: player.id,
      playerName: player.nickname,
      playerPhone: player.phone,
      remark: assignRemark.value
    })
    if (res.code === 200) {
      ElMessage.success('订单分配成功')
      assignDialogVisible.value = false
      fetchOrderDetail()
    }
  } catch (error) {
    ElMessage.error('分配失败')
  } finally {
    submitLoading.value = false
  }
}

const submitComplete = async () => {
  submitLoading.value = true
  try {
    const res = await completeOrder({
      orderId: order.value.id,
      remark: completeRemark.value
    })
    if (res.code === 200) {
      ElMessage.success('订单已确认完成')
      completeDialogVisible.value = false
      fetchOrderDetail()
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
      orderId: order.value.id,
      result: disputeResult.value,
      refundAmount: 0,
      remark: disputeRemark.value
    })
    if (res.code === 200) {
      ElMessage.success('仲裁处理完成')
      disputeDialogVisible.value = false
      fetchOrderDetail()
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
      orderId: order.value.id,
      reason: cancelReason.value,
      operator: '客服',
      remark: cancelRemark.value
    })
    if (res.code === 200) {
      ElMessage.success('订单已取消')
      cancelDialogVisible.value = false
      fetchOrderDetail()
    }
  } catch (error) {
    ElMessage.error('取消失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style lang="scss" scoped>
.order-detail-container {
  .header-actions {
    display: flex;
    gap: 12px;
  }

  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-radius: 8px;
    margin-bottom: 20px;
    background: var(--bg-secondary);

    &.status-waiting {
      border-left: 4px solid #E6A23C;
    }

    &.status-pending {
      border-left: 4px solid #E6A23C;
    }

    &.status-active {
      border-left: 4px solid #409EFF;
    }

    &.status-completed {
      border-left: 4px solid #67C23A;
    }

    &.status-dispute {
      border-left: 4px solid #E6A23C;
    }

    &.status-cancelled {
      border-left: 4px solid #F56C6C;
    }

    &.status-refunded {
      border-left: 4px solid #F56C6C;
    }

    .status-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .status-icon {
      font-size: 32px;
      color: var(--accent-blue);
    }

    .status-info {
      .status-text {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
      }

      .status-time {
        font-size: 13px;
        color: var(--text-muted);
        margin-top: 4px;
      }
    }
  }

  .tab-content {
    padding-top: 16px;
  }

  .info-section {
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

  .amount-text {
    color: var(--accent-orange);
    font-weight: 600;
    font-size: 16px;
  }

  .deposit-text,
  .fee-text,
  .player-amount-text {
    color: var(--text-primary);
    font-weight: 500;
  }

  .detail-content {
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 16px;
  }

  .detail-item {
    display: flex;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .detail-label {
      color: var(--text-muted);
      font-size: 13px;
      min-width: 80px;
    }

    .detail-value {
      color: var(--text-primary);
      font-size: 13px;
      flex: 1;
      line-height: 1.6;
    }
  }

  .progress-timeline {
    max-height: 600px;
    overflow-y: auto;
    padding-right: 10px;
  }

  .log-content {
    .log-action {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .log-operator,
    .log-reason,
    .log-result {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
    }
  }

  .rating-inline {
    display: flex;
    align-items: center;
    gap: 4px;

    .rating-value {
      font-size: 12px;
      color: var(--accent-orange);
      font-weight: 600;
    }
  }

  .earnings-text {
    color: var(--accent-green);
    font-weight: 500;
  }

  .assign-form {
    .player-selection {
      :deep(.el-table) {
        font-size: 13px;
      }
    }
  }
}
</style>
