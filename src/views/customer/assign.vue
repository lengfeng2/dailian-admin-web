<template>
  <div class="assign-container fade-in">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <el-icon class="icon"><Share /></el-icon>
          订单分配
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleBatchAssign" :disabled="selectedOrders.length === 0">
            <el-icon><Share /></el-icon>
            批量分配 ({{ selectedOrders.length }})
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <div class="search-form">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="关键词">
              <el-input
                v-model="searchForm.keyword"
                placeholder="订单号/用户昵称"
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
            <el-form-item label="金额区间">
              <el-select
                v-model="searchForm.amountRange"
                placeholder="全部金额"
                clearable
                style="width: 150px"
              >
                <el-option label="500元以下" value="low" />
                <el-option label="500-1000元" value="medium" />
                <el-option label="1000元以上" value="high" />
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
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="orderNo" label="订单号" width="180" />
          <el-table-column prop="title" label="订单信息" min-width="280">
            <template #default="{ row }">
              <div class="order-info">
                <div class="order-title">
                  <span class="title-text">{{ row.title }}</span>
                  <el-tag size="small" type="info">{{ row.game }}</el-tag>
                </div>
                <div class="order-detail">
                  <span class="rank-text">{{ row.currentRank }} → {{ row.targetRank }}</span>
                  <span class="category">{{ row.category }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="订单金额" width="120">
            <template #default="{ row }">
              <div class="amount-info">
                <span class="amount">¥{{ row.amount }}</span>
                <span class="player-amount">打手: ¥{{ row.playerAmount }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="用户信息" width="150">
            <template #default="{ row }">
              <div class="user-mini-info">
                <div class="user-name">{{ row.nickname }}</div>
                <div class="user-phone">{{ row.phone }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="requirements" label="需求" min-width="180">
            <template #default="{ row }">
              <div class="requirements">
                <span v-if="row.requirements">{{ row.requirements.substring(0, 50) }}...</span>
                <span v-else class="no-require">无特殊要求</span>
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
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleView(row)">
                <el-icon><View /></el-icon>
                详情
              </el-button>
              <el-button 
                v-if="row.status === 'waiting' || row.status === 'pending'"
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
      :title="isBatchAssign ? '批量分配打手' : '分配打手'"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="assign-form">
        <div class="order-preview" v-if="!isBatchAssign">
          <div class="preview-label">订单信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="游戏">{{ currentOrder.game }}</el-descriptions-item>
            <el-descriptions-item label="订单金额">{{ currentOrder.amount }}元</el-descriptions-item>
            <el-descriptions-item label="打手金额">{{ currentOrder.playerAmount }}元</el-descriptions-item>
            <el-descriptions-item label="段位要求" :span="2">
              {{ currentOrder.currentRank }} → {{ currentOrder.targetRank }}
            </el-descriptions-item>
            <el-descriptions-item label="特殊要求" :span="2">
              {{ currentOrder.requirements || '无' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="order-preview" v-else>
          <div class="preview-label">已选择订单 ({{ selectedOrders.length }})</div>
          <div class="selected-orders-list">
            <div v-for="order in selectedOrders" :key="order.id" class="selected-order-item">
              <span class="order-no">{{ order.orderNo }}</span>
              <span class="order-game">{{ order.game }}</span>
              <span class="order-amount">¥{{ order.amount }}</span>
            </div>
          </div>
        </div>

        <div class="player-selection-section">
          <div class="section-label">
            <span>选择打手</span>
            <el-tag size="small" type="info">推荐擅长: {{ recommendedGame }}</el-tag>
          </div>
          
          <div class="search-player">
            <el-input
              v-model="playerSearchKeyword"
              placeholder="搜索打手昵称/姓名"
              prefix-icon="Search"
              clearable
              @input="filterPlayers"
              style="width: 300px"
            />
          </div>

          <el-table
            :data="filteredPlayers"
            stripe
            height="300"
            @selection-change="handlePlayerSelection"
            :row-key="(row) => row.id"
          >
            <el-table-column 
              type="selection" 
              width="55" 
              :selectable="checkPlayerSelectable"
            />
            <el-table-column prop="nickname" label="打手昵称" width="140">
              <template #default="{ row }">
                <div class="player-name-row">
                  <el-avatar :size="32" class="mini-avatar">
                    <el-icon><User /></el-icon>
                  </el-avatar>
                  <span class="nickname">{{ row.nickname }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="games" label="擅长游戏" min-width="150">
              <template #default="{ row }">
                <div class="game-tags">
                  <el-tag 
                    v-for="(game, index) in row.games" 
                    :key="index" 
                    size="small"
                    :type="isRecommendedGame(row.games) ? 'success' : 'info'"
                  >
                    {{ game }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="rating" label="评分" width="100">
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
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                  {{ row.status === 'active' ? '在线' : '离线' }}
                </el-tag>
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
        <el-button 
          type="primary" 
          :loading="submitLoading" 
          @click="submitAssign"
          :disabled="selectedPlayers.length === 0"
        >
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
const isBatchAssign = ref(false)
const tableData = ref([])
const selectedOrders = ref([])
const currentOrder = ref({})
const selectedPlayers = ref([])
const assignRemark = ref('')
const playerSearchKeyword = ref('')
const gameList = ref(mockGameList)
const availablePlayers = ref([])
const filteredPlayers = ref([])

const searchForm = reactive({
  keyword: '',
  game: '',
  amountRange: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const recommendedGame = computed(() => {
  if (isBatchAssign.value && selectedOrders.value.length > 0) {
    const games = selectedOrders.value.map(o => o.game)
    const gameCounts = {}
    games.forEach(g => {
      gameCounts[g] = (gameCounts[g] || 0) + 1
    })
    return Object.keys(gameCounts).sort((a, b) => gameCounts[b] - gameCounts[a])[0] || ''
  }
  return currentOrder.value.game || ''
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

const isRecommendedGame = (games) => {
  return games.includes(recommendedGame.value)
}

const checkPlayerSelectable = (row) => {
  return row.status === 'active'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getOrderList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      status: '',
      game: searchForm.game
    })
    if (res.code === 200) {
      let data = res.data.list
      if (searchForm.amountRange) {
        data = data.filter(item => {
          if (searchForm.amountRange === 'low') return item.amount < 500
          if (searchForm.amountRange === 'medium') return item.amount >= 500 && item.amount <= 1000
          if (searchForm.amountRange === 'high') return item.amount > 1000
          return true
        })
      }
      tableData.value = data
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

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.game = ''
  searchForm.amountRange = ''
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
  selectedOrders.value = selection
}

const handlePlayerSelection = (selection) => {
  selectedPlayers.value = selection
}

const handleView = (row) => {
  router.push(`/order/detail/${row.id}`)
}

const handleAssign = (row) => {
  isBatchAssign.value = false
  currentOrder.value = row
  selectedPlayers.value = []
  playerSearchKeyword.value = ''
  assignRemark.value = ''
  fetchPlayers()
  assignDialogVisible.value = true
}

const handleBatchAssign = () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要分配的订单')
    return
  }
  isBatchAssign.value = true
  selectedPlayers.value = []
  playerSearchKeyword.value = ''
  assignRemark.value = ''
  fetchPlayers()
  assignDialogVisible.value = true
}

const submitAssign = async () => {
  if (selectedPlayers.value.length === 0) {
    ElMessage.warning('请选择打手')
    return
  }

  if (isBatchAssign.value) {
    const assignOne = async (order, player) => {
      await assignOrder({
        orderId: order.id,
        playerId: player.id,
        playerName: player.nickname,
        playerPhone: player.phone,
        remark: assignRemark.value
      })
    }

    submitLoading.value = true
    try {
      for (let i = 0; i < selectedOrders.value.length; i++) {
        const order = selectedOrders.value[i]
        const playerIndex = i % selectedPlayers.value.length
        await assignOne(order, selectedPlayers.value[playerIndex])
      }
      ElMessage.success(`成功分配 ${selectedOrders.value.length} 个订单`)
      assignDialogVisible.value = false
      selectedOrders.value = []
      fetchData()
    } catch (error) {
      ElMessage.error('分配失败')
    } finally {
      submitLoading.value = false
    }
  } else {
    const player = selectedPlayers.value[0]
    submitLoading.value = true
    try {
      const res = await assignOrder({
        orderId: currentOrder.value.id,
        playerId: player.id,
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
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.assign-container {
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

    .order-detail {
      display: flex;
      gap: 12px;
      margin-top: 4px;
      font-size: 12px;

      .rank-text {
        color: var(--accent-blue);
      }

      .category {
        color: var(--text-muted);
      }
    }
  }

  .amount-info {
    .amount {
      color: var(--accent-orange);
      font-weight: 600;
      font-size: 15px;
    }

    .player-amount {
      display: block;
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }
  }

  .user-mini-info {
    .user-name {
      font-weight: 500;
      color: var(--text-primary);
      font-size: 13px;
    }

    .user-phone {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }
  }

  .requirements {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.5;

    .no-require {
      color: var(--text-muted);
      font-style: italic;
    }
  }

  .assign-form {
    .order-preview {
      margin-bottom: 20px;

      .preview-label {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 12px;
      }

      .selected-orders-list {
        max-height: 120px;
        overflow-y: auto;
        background: var(--bg-secondary);
        border-radius: 8px;
        padding: 12px;
      }

      .selected-order-item {
        display: flex;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);

        &:last-child {
          border-bottom: none;
        }

        .order-no {
          width: 160px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .order-game {
          width: 120px;
          color: var(--text-secondary);
        }

        .order-amount {
          color: var(--accent-orange);
          font-weight: 600;
        }
      }
    }

    .player-selection-section {
      margin-top: 20px;

      .section-label {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 12px;
      }

      .search-player {
        margin-bottom: 12px;
      }
    }

    .player-name-row {
      display: flex;
      align-items: center;
      gap: 8px;

      .mini-avatar {
        background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-cyan) 100%);
      }

      .nickname {
        font-weight: 500;
        color: var(--text-primary);
      }
    }

    .game-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .rating-inline {
      display: flex;
      align-items: center;
      gap: 6px;

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
  }
}
</style>
