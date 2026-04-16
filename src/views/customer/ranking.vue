<template>
  <div class="ranking-container fade-in">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <el-icon class="icon"><Trophy /></el-icon>
          打手排行榜
        </div>
        <div class="header-actions">
          <el-radio-group v-model="period" @change="handlePeriodChange">
            <el-radio-button value="week">本周</el-radio-button>
            <el-radio-button value="month">本月</el-radio-button>
            <el-radio-button value="all">全部</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div class="card-body">
        <div class="ranking-header">
          <div class="stat-cards">
            <div class="stat-card top1">
              <div class="stat-icon">
                <el-icon><FirstAidKit /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">本周榜首</div>
                <div class="stat-value">{{ topPlayer?.nickname || '-' }}</div>
              </div>
            </div>
            <div class="stat-card total-earnings">
              <div class="stat-icon">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">总收益金额</div>
                <div class="stat-value">¥{{ totalEarnings.toLocaleString() }}</div>
              </div>
            </div>
            <div class="stat-card total-orders">
              <div class="stat-icon">
                <el-icon><DocumentChecked /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">总完成订单</div>
                <div class="stat-value">{{ totalCompletedCount }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="ranking-table-wrapper">
          <el-table
            v-loading="loading"
            :data="rankingList"
            stripe
            style="width: 100%"
            :row-class-name="getRowClassName"
          >
            <el-table-column prop="rank" label="排名" width="100" align="center">
              <template #default="{ row }">
                <div class="rank-badge" :class="`rank-${row.rank}`">
                  <span v-if="row.rank <= 3" class="rank-number">{{ row.rank }}</span>
                  <span v-else class="rank-number">{{ row.rank }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="打手信息" min-width="200">
              <template #default="{ row }">
                <div class="player-info-row">
                  <div class="player-avatar">
                    <el-avatar :size="48" class="avatar">
                      <el-icon><User /></el-icon>
                    </el-avatar>
                  </div>
                  <div class="player-details">
                    <div class="player-nickname">{{ row.nickname }}</div>
                    <div class="player-stats">
                      <el-rate v-model="row.rating" disabled :max="5" :show-text="false" size="small" />
                      <span class="rating-text">{{ row.rating }}分</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="orderCount" label="接单总数" width="120" align="center">
              <template #default="{ row }">
                <span class="order-count">{{ row.orderCount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="completedCount" label="完成单数" width="120" align="center">
              <template #default="{ row }">
                <span class="completed-count">{{ row.completedCount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="completionRate" label="完成率" width="120" align="center">
              <template #default="{ row }">
                <el-progress
                  :percentage="row.completionRate"
                  :stroke-width="10"
                  :color="getProgressColor(row.completionRate)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="thisMonthEarnings" label="本月收益" width="140" align="center">
              <template #default="{ row }">
                <span class="earnings">¥{{ row.thisMonthEarnings.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="totalEarnings" label="总收益" width="140" align="center">
              <template #default="{ row }">
                <span class="total-earnings">¥{{ row.totalEarnings.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="150" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleViewPlayer(row)">
                  <el-icon><View /></el-icon>
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPlayerRanking } from '@/api/player'

const router = useRouter()
const loading = ref(false)
const period = ref('month')
const rankingList = ref([])

const totalEarnings = computed(() => {
  return rankingList.value.reduce((sum, item) => sum + item.totalEarnings, 0)
})

const totalCompletedCount = computed(() => {
  return rankingList.value.reduce((sum, item) => sum + item.completedCount, 0)
})

const topPlayer = computed(() => {
  return rankingList.value[0] || null
})

const getRowClassName = ({ row, rowIndex }) => {
  if (row.rank <= 3) {
    return `row-rank-${row.rank}`
  }
  return ''
}

const getProgressColor = (percentage) => {
  if (percentage >= 95) return '#67C23A'
  if (percentage >= 85) return '#409EFF'
  if (percentage >= 75) return '#E6A23C'
  return '#F56C6C'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getPlayerRanking({
      period: period.value
    })
    if (res.code === 200) {
      rankingList.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch ranking:', error)
    ElMessage.error('获取排行榜数据失败')
  } finally {
    loading.value = false
  }
}

const handlePeriodChange = () => {
  fetchData()
}

const handleViewPlayer = (row) => {
  router.push(`/player/detail/${row.playerId}`)
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.ranking-container {
  .ranking-header {
    margin-bottom: 24px;
  }

  .stat-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    padding: 20px;
    background: var(--bg-secondary);
    border-radius: 12px;
    border-left: 4px solid;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    &.top1 {
      border-left-color: var(--accent-orange);
      
      .stat-icon {
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        color: #fff;
      }
    }

    &.total-earnings {
      border-left-color: var(--accent-green);
      
      .stat-icon {
        background: linear-gradient(135deg, #67C23A 0%, #4CAF50 100%);
        color: #fff;
      }
    }

    &.total-orders {
      border-left-color: var(--accent-blue);
      
      .stat-icon {
        background: linear-gradient(135deg, #409EFF 0%, #2196F3 100%);
        color: #fff;
      }
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      font-size: 24px;
    }

    .stat-info {
      flex: 1;

      .stat-label {
        font-size: 13px;
        color: var(--text-muted);
        margin-bottom: 6px;
      }

      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }

  .ranking-table-wrapper {
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 16px;
  }

  .rank-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-weight: 600;
    font-size: 14px;

    &.rank-1 {
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      color: #fff;
      box-shadow: 0 4px 15px rgba(255, 165, 0, 0.4);
    }

    &.rank-2 {
      background: linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%);
      color: #fff;
      box-shadow: 0 4px 15px rgba(169, 169, 169, 0.4);
    }

    &.rank-3 {
      background: linear-gradient(135deg, #CD7F32 0%, #B87333 100%);
      color: #fff;
      box-shadow: 0 4px 15px rgba(205, 127, 50, 0.4);
    }

    .rank-number {
      font-size: 16px;
      font-weight: bold;
    }
  }

  .player-info-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .player-avatar {
    .avatar {
      background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-cyan) 100%);
    }
  }

  .player-details {
    .player-nickname {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .player-stats {
      display: flex;
      align-items: center;
      gap: 8px;

      .rating-text {
        font-size: 12px;
        color: var(--text-muted);
      }
    }
  }

  .order-count,
  .completed-count {
    font-weight: 500;
    color: var(--text-primary);
  }

  .earnings {
    color: var(--accent-orange);
    font-weight: 600;
  }

  .total-earnings {
    color: var(--accent-green);
    font-weight: 700;
    font-size: 15px;
  }

  :deep(.el-table) {
    .row-rank-1 {
      background: linear-gradient(90deg, rgba(255, 215, 0, 0.08) 0%, transparent 100%);
    }

    .row-rank-2 {
      background: linear-gradient(90deg, rgba(192, 192, 192, 0.06) 0%, transparent 100%);
    }

    .row-rank-3 {
      background: linear-gradient(90deg, rgba(205, 127, 50, 0.05) 0%, transparent 100%);
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
</style>
