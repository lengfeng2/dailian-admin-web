<template>
  <div class="player-order-container fade-in">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <el-icon class="icon"><ShoppingCart /></el-icon>
          打手订单管理
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
            <el-form-item label="订单状态">
              <el-select
                v-model="searchForm.status"
                placeholder="全部状态"
                clearable
                style="width: 150px"
              >
                <el-option label="待支付" value="waiting" />
                <el-option label="待接单" value="pending" />
                <el-option label="进行中" value="active" />
                <el-option label="已完成" value="completed" />
                <el-option label="仲裁中" value="dispute" />
                <el-option label="已取消" value="cancelled" />
              </el-select>
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
          <el-table-column prop="title" label="订单标题" min-width="220">
            <template #default="{ row }">
              <div class="order-title">
                <span>{{ row.title }}</span>
                <el-tag size="small" type="info" style="margin-left: 8px">{{ row.game }}</el-tag>
              </div>
              <div class="order-range">
                {{ row.currentRank }} → {{ row.targetRank }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" width="100">
            <template #default="{ row }">
              <span class="amount">¥{{ row.amount }}</span>
            </template>
          </el-table-column>
          <el-table-column label="用户信息" min-width="180">
            <template #default="{ row }">
              <div class="user-info">
                <div class="user-name">{{ row.nickname }}</div>
                <div class="user-phone">{{ row.phone }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="打手信息" min-width="180">
            <template #default="{ row }">
              <div class="player-info" v-if="row.playerName">
                <div class="player-name">{{ row.playerName }}</div>
                <div class="player-phone">{{ row.playerPhone }}</div>
              </div>
              <span v-else class="no-player">未分配</span>
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
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleView(row)">
                <el-icon><View /></el-icon>
                详情
              </el-button>
              <el-button 
                v-if="row.status === 'pending' && !row.playerId"
                type="primary" 
                link 
                size="small"
                @click="handleAssign(row)"
              >
                <el-icon><Share /></el-icon>
                分配
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
      v-model="assignDialogVisible"
      title="分配打手"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="assign-form">
        <div class="order-info-preview">
          <div class="preview-label">订单信息</div>
          <div class="preview-content">
            <div class="preview-row">
              <span class="preview-key">订单号：</span>
              <span class="preview-value">{{ currentOrder.orderNo }}</span>
            </div>
            <div class="preview-row">
              <span class="preview-key">订单标题：</span>
              <span class="preview-value">{{ currentOrder.title }}</span>
            </div>
            <div class="preview-row">
              <span class="preview-key">游戏：</span>
              <span class="preview-value">{{ currentOrder.game }}</span>
            </div>
            <div class="preview-row">
              <span class="preview-key">金额：</span>
              <span class="preview-value amount">¥{{ currentOrder.amount }}</span>
            </div>
          </div>
        </div>

        <el-form label-width="100px">
          <el-form-item label="选择打手">
            <el-select
              v-model="selectedPlayerId"
              placeholder="请选择打手"
              style="width: 100%"
              filterable
              :filter-method="filterPlayer"
            >
              <el-option
                v-for="player in availablePlayers"
                :key="player.id"
                :label="player.nickname + ' - ' + player.realName"
                :value="player.id"
              >
                <div class="player-option">
                  <div class="player-option-name">{{ player.nickname }}</div>
                  <div class="player-option-info">
                    <span>评分: {{ player.rating }}</span>
                    <span>完成: {{ player.completedCount }}单</span>
                    <span>擅长: {{ player.games.join('、') }}</span>
                  </div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="assignRemark"
              type="textarea"
              :rows="2"
              placeholder="请输入备注信息（选填）"
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, assignOrder } from '@/api/order'
import { getPlayerList } from '@/api/player'
import { mockGameList, mockOrderStatusMap } from '@/mock/order'

const router = useRouter()

const loading = ref(false)
const submitLoading = ref(false)
const assignDialogVisible = ref(false)
const tableData = ref([])
const currentOrder = ref({})
const selectedPlayerId = ref<number | null>(null)
const assignRemark = ref('')
const gameList = ref(mockGameList)
const availablePlayers = ref([])

const searchForm = reactive({
  keyword: '',
  status: '',
  game: ''
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

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getOrderList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      status: searchForm.status,
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

const fetchPlayers = async () => {
  try {
    const res = await getPlayerList({ status: 'active' })
    if (res.code === 200) {
      availablePlayers.value = res.data.list
    }
  } catch (error) {
    console.error('Failed to fetch players:', error)
  }
}

const filterPlayer = (query) => {
  if (query) {
    availablePlayers.value = availablePlayers.value.filter(
      item => item.nickname.toLowerCase().includes(query.toLowerCase()) || 
               item.realName.toLowerCase().includes(query.toLowerCase())
    )
  } else {
    fetchPlayers()
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.game = ''
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

const handleAssign = (row) => {
  currentOrder.value = row
  selectedPlayerId.value = null
  assignRemark.value = ''
  fetchPlayers()
  assignDialogVisible.value = true
}

const submitAssign = async () => {
  if (!selectedPlayerId.value) {
    ElMessage.warning('请选择打手')
    return
  }

  const player = availablePlayers.value.find(p => p.id === selectedPlayerId.value)
  if (!player) return

  submitLoading.value = true
  try {
    const res = await assignOrder({
      orderId: currentOrder.value.id,
      playerId: selectedPlayerId.value,
      playerName: player.nickname,
      playerPhone: player.phone,
      remark: assignRemark.value
    })
    if (res.code === 200) {
      ElMessage.success('订单分配成功')
      assignDialogVisible.value = false
      fetchData()
    }
  } catch (error) {
    ElMessage.error('分配失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.player-order-container {
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

  .order-title {
    display: flex;
    align-items: center;
    font-weight: 500;
    color: var(--text-primary);
  }

  .order-range {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .amount {
    color: var(--accent-orange);
    font-weight: 600;
  }

  .user-info, .player-info {
    .user-name, .player-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .user-phone, .player-phone {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }
  }

  .no-player {
    color: var(--text-muted);
    font-size: 13px;
  }

  .assign-form {
    .order-info-preview {
      margin-bottom: 20px;
      padding: 16px;
      background: var(--bg-secondary);
      border-radius: 8px;

      .preview-label {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 12px;
      }

      .preview-content {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;

        .preview-row {
          display: flex;

          .preview-key {
            color: var(--text-secondary);
            font-size: 13px;
            min-width: 70px;
          }

          .preview-value {
            color: var(--text-primary);
            font-size: 13px;

            &.amount {
              color: var(--accent-orange);
              font-weight: 600;
            }
          }
        }
      }
    }

    .player-option {
      .player-option-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
      }

      .player-option-info {
        display: flex;
        gap: 12px;
        margin-top: 4px;
        font-size: 12px;
        color: var(--text-muted);
      }
    }
  }
}
</style>
