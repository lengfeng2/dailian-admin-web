<template>
  <div class="order-list-container fade-in">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <el-icon class="icon"><List /></el-icon>
          订单列表
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出订单
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <div class="search-form">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="关键词">
              <el-input
                v-model="searchForm.keyword"
                placeholder="订单号/标题/用户/打手"
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
            <div class="stat-label">总订单数</div>
            <div class="stat-value">{{ stats.total }}</div>
          </div>
          <div class="stat-item pending">
            <div class="stat-label">待接单</div>
            <div class="stat-value">{{ stats.pending }}</div>
          </div>
          <div class="stat-item active">
            <div class="stat-label">进行中</div>
            <div class="stat-value">{{ stats.active }}</div>
          </div>
          <div class="stat-item completed">
            <div class="stat-label">已完成</div>
            <div class="stat-value">{{ stats.completed }}</div>
          </div>
          <div class="stat-item dispute">
            <div class="stat-label">仲裁中</div>
            <div class="stat-value">{{ stats.dispute }}</div>
          </div>
          <div class="stat-item cancelled">
            <div class="stat-label">已取消</div>
            <div class="stat-value">{{ stats.cancelled }}</div>
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
          <el-table-column prop="orderNo" label="订单号" width="180" />
          <el-table-column prop="title" label="订单信息" min-width="280">
            <template #default="{ row }">
              <div class="order-info">
                <div class="order-title-row">
                  <span class="title">{{ row.title }}</span>
                  <el-tag size="small" type="info">{{ row.game }}</el-tag>
                  <el-tag size="small" type="warning">{{ row.category }}</el-tag>
                </div>
                <div class="order-detail-row">
                  <span class="rank-text">
                    <span class="label">段位:</span> {{ row.currentRank }} → {{ row.targetRank }}
                  </span>
                  <span class="amount-text">
                    <span class="label">金额:</span>
                    <span class="amount">¥{{ row.amount }}</span>
                    <span class="player-amount">(打手: ¥{{ row.playerAmount }})</span>
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="用户" width="130">
            <template #default="{ row }">
              <div class="user-info">
                <div class="user-name">{{ row.nickname }}</div>
                <div class="user-phone">{{ row.phone }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="打手" width="130">
            <template #default="{ row }">
              <div class="player-info" v-if="row.playerName">
                <div class="player-name">{{ row.playerName }}</div>
                <div class="player-phone">{{ row.playerPhone }}</div>
              </div>
              <span v-else class="no-player">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="进度" width="150">
            <template #default="{ row }">
              <div class="progress-wrapper">
                <el-progress 
                  :percentage="getProgress(row)" 
                  :stroke-width="8"
                  :color="getProgressColor(row)"
                />
                <span class="progress-text">{{ getProgressText(row) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column prop="endTime" label="完成时间" width="180">
            <template #default="{ row }">
              <span v-if="row.endTime">{{ row.endTime }}</span>
              <span v-else class="no-end-time">-</span>
            </template>
          </el-table-column>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, getOrderStats } from '@/api/order'
import { mockGameList, mockOrderStatusMap } from '@/mock/order'

const router = useRouter()

const loading = ref(false)
const tableData = ref([])
const selectedOrders = ref([])
const gameList = ref(mockGameList)

const stats = reactive({
  total: 0,
  pending: 0,
  active: 0,
  completed: 0,
  dispute: 0,
  cancelled: 0
})

const searchForm = reactive({
  keyword: '',
  status: '',
  game: '',
  amountRange: '',
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

const getProgress = (row) => {
  if (row.status === 'waiting') return 0
  if (row.status === 'pending') return 20
  if (row.status === 'active') return 50
  if (row.status === 'dispute') return 70
  if (row.status === 'completed') return 100
  if (row.status === 'cancelled') return 0
  return 0
}

const getProgressText = (row) => {
  if (row.status === 'waiting') return '待支付'
  if (row.status === 'pending') return '待接单'
  if (row.status === 'active') return '进行中'
  if (row.status === 'dispute') return '仲裁中'
  if (row.status === 'completed') return '已完成'
  if (row.status === 'cancelled') return '已取消'
  return '未知'
}

const getProgressColor = (row) => {
  if (row.status === 'completed') return '#67C23A'
  if (row.status === 'active') return '#409EFF'
  if (row.status === 'dispute') return '#E6A23C'
  return '#909399'
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

const fetchStats = async () => {
  try {
    const res = await getOrderStats()
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
  searchForm.status = ''
  searchForm.game = ''
  searchForm.amountRange = ''
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
  selectedOrders.value = selection
}

const handleView = (row) => {
  router.push(`/order/detail/${row.id}`)
}

const handleAssign = (row) => {
  router.push({
    path: '/customer/assign',
    query: { orderId: row.id }
  })
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

onMounted(() => {
  fetchData()
  fetchStats()
})
</script>

<style lang="scss" scoped>
.order-list-container {
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
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .stat-item {
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
    text-align: center;
    border-left: 4px solid var(--border-color);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    &.pending {
      border-left-color: #E6A23C;

      .stat-value {
        color: #E6A23C;
      }
    }

    &.active {
      border-left-color: #409EFF;

      .stat-value {
        color: #409EFF;
      }
    }

    &.completed {
      border-left-color: #67C23A;

      .stat-value {
        color: #67C23A;
      }
    }

    &.dispute {
      border-left-color: #E6A23C;

      .stat-value {
        color: #E6A23C;
      }
    }

    &.cancelled {
      border-left-color: #F56C6C;

      .stat-value {
        color: #F56C6C;
      }
    }

    .stat-label {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
    }
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .order-info {
    .order-title-row {
      display: flex;
      align-items: center;
      gap: 8px;

      .title {
        font-weight: 500;
        color: var(--text-primary);
      }
    }

    .order-detail-row {
      display: flex;
      gap: 16px;
      margin-top: 4px;
      font-size: 12px;

      .label {
        color: var(--text-muted);
      }

      .rank-text {
        color: var(--accent-blue);
      }

      .amount-text {
        .amount {
          color: var(--accent-orange);
          font-weight: 600;
        }

        .player-amount {
          color: var(--text-muted);
        }
      }
    }
  }

  .user-info,
  .player-info {
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

  .no-player,
  .no-end-time {
    color: var(--text-muted);
    font-size: 13px;
  }

  .progress-wrapper {
    .progress-text {
      display: block;
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
      text-align: center;
    }
  }
}
</style>
