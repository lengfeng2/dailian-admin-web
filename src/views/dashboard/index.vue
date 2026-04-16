<template>
  <div class="dashboard-container fade-in">
    <div class="stats-row">
      <div class="stat-card fade-in stagger-1">
        <div class="stat-icon total">
          <el-icon :size="32"><ShoppingCart /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ orderStats.total }}</div>
          <div class="stat-label">总订单数</div>
        </div>
        <div class="stat-trend up">
          <el-icon><CaretTop /></el-icon>
          <span>+12%</span>
        </div>
      </div>

      <div class="stat-card fade-in stagger-2">
        <div class="stat-icon pending">
          <el-icon :size="32"><Clock /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ orderStats.pending }}</div>
          <div class="stat-label">待处理订单</div>
        </div>
        <div class="stat-trend down">
          <el-icon><CaretBottom /></el-icon>
          <span>-5%</span>
        </div>
      </div>

      <div class="stat-card fade-in stagger-3">
        <div class="stat-icon active">
          <el-icon :size="32"><VideoPlay /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ orderStats.active }}</div>
          <div class="stat-label">进行中订单</div>
        </div>
        <div class="stat-trend up">
          <el-icon><CaretTop /></el-icon>
          <span>+8%</span>
        </div>
      </div>

      <div class="stat-card fade-in stagger-4">
        <div class="stat-icon completed">
          <el-icon :size="32"><CircleCheck /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">¥{{ orderStats.todayAmount.toLocaleString() }}</div>
          <div class="stat-label">今日成交额</div>
        </div>
        <div class="stat-trend up">
          <el-icon><CaretTop /></el-icon>
          <span>+25%</span>
        </div>
      </div>
    </div>

    <div class="content-row">
      <div class="content-left">
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <el-icon class="icon"><TrendCharts /></el-icon>
              订单趋势
            </div>
            <el-radio-group v-model="trendPeriod" size="small">
              <el-radio-button value="week">近7天</el-radio-button>
              <el-radio-button value="month">近30天</el-radio-button>
            </el-radio-group>
          </div>
          <div class="card-body">
            <div class="chart-placeholder">
              <div class="chart-bars">
                <div v-for="(item, index) in trendData" :key="index" class="chart-bar-item">
                  <div 
                    class="bar" 
                    :style="{ height: item.height + '%', background: item.color }"
                  ></div>
                  <div class="label">{{ item.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <el-icon class="icon"><Document /></el-icon>
              最新订单
            </div>
            <el-button type="primary" link @click="goToOrders">
              查看全部 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div class="card-body">
            <div class="order-list">
              <div v-for="order in recentOrders" :key="order.id" class="order-item">
                <div class="order-info">
                  <div class="order-title">{{ order.title }}</div>
                  <div class="order-meta">
                    <span class="order-no">{{ order.orderNo }}</span>
                    <span class="order-time">{{ order.createdAt }}</span>
                  </div>
                </div>
                <div class="order-right">
                  <div class="order-amount">¥{{ order.amount }}</div>
                  <el-tag :type="getStatusType(order.status)" size="small">
                    {{ getStatusLabel(order.status) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-right">
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <el-icon class="icon"><Trophy /></el-icon>
              打手排行
            </div>
            <el-button type="primary" link @click="goToRanking">
              查看全部 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div class="card-body">
            <div class="ranking-list">
              <div v-for="(player, index) in topPlayers" :key="player.playerId" class="ranking-item">
                <div class="ranking-rank" :class="'rank-' + (index + 1)">
                  {{ index + 1 }}
                </div>
                <div class="ranking-info">
                  <div class="ranking-name">{{ player.nickname }}</div>
                  <div class="ranking-stats">
                    <span>完成 {{ player.completedCount }} 单</span>
                    <span>·</span>
                    <span>评分 {{ player.rating }}</span>
                  </div>
                </div>
                <div class="ranking-earnings">
                  ¥{{ player.thisMonthEarnings.toLocaleString() }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <el-icon class="icon"><Warning /></el-icon>
              待处理事项
            </div>
          </div>
          <div class="card-body">
            <div class="todo-list">
              <div class="todo-item warning">
                <el-icon class="todo-icon"><Clock /></el-icon>
                <div class="todo-content">
                  <div class="todo-title">待分配订单</div>
                  <div class="todo-desc">有 {{ orderStats.pending }} 个订单等待分配</div>
                </div>
                <el-tag type="warning" size="small">{{ orderStats.pending }}</el-tag>
              </div>
              <div class="todo-item danger">
                <el-icon class="todo-icon"><ChatDotRound /></el-icon>
                <div class="todo-content">
                  <div class="todo-title">仲裁待处理</div>
                  <div class="todo-desc">有 {{ orderStats.dispute }} 个订单需要仲裁</div>
                </div>
                <el-tag type="danger" size="small">{{ orderStats.dispute }}</el-tag>
              </div>
              <div class="todo-item info">
                <el-icon class="todo-icon"><UserPlus /></el-icon>
                <div class="todo-content">
                  <div class="todo-title">新打手审核</div>
                  <div class="todo-desc">有 2 名打手等待审核</div>
                </div>
                <el-tag type="info" size="small">2</el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getOrderStats, getPendingOrders, getActiveOrders } from '@/api/order'
import { getPlayerRanking } from '@/api/player'
import { mockOrderStatusMap } from '@/mock/order'

const router = useRouter()

const orderStats = ref({
  total: 0,
  pending: 0,
  active: 0,
  completed: 0,
  cancelled: 0,
  dispute: 0,
  todayNew: 0,
  todayCompleted: 0,
  todayAmount: 0
})

const trendPeriod = ref('week')

const trendData = ref([
  { label: '周一', value: 28, height: 70, color: 'linear-gradient(180deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)' },
  { label: '周二', value: 35, height: 87, color: 'linear-gradient(180deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)' },
  { label: '周三', value: 22, height: 55, color: 'linear-gradient(180deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)' },
  { label: '周四', value: 40, height: 100, color: 'linear-gradient(180deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)' },
  { label: '周五', value: 32, height: 80, color: 'linear-gradient(180deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)' },
  { label: '周六', value: 45, height: 100, color: 'linear-gradient(180deg, var(--accent-orange) 0%, var(--accent-red) 100%)' },
  { label: '周日', value: 38, height: 95, color: 'linear-gradient(180deg, var(--accent-orange) 0%, var(--accent-red) 100%)' }
])

const recentOrders = ref([])
const topPlayers = ref([])

const getStatusType = (status) => {
  const map = {
    waiting: 'warning',
    pending: 'warning',
    active: 'success',
    completed: 'info',
    cancelled: 'danger',
    dispute: 'warning'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  return mockOrderStatusMap[status]?.label || status
}

const goToOrders = () => {
  router.push('/order/list')
}

const goToRanking = () => {
  router.push('/customer/ranking')
}

onMounted(async () => {
  try {
    const statsRes = await getOrderStats()
    if (statsRes.code === 200) {
      orderStats.value = statsRes.data
    }

    const pendingRes = await getPendingOrders()
    if (pendingRes.code === 200) {
      recentOrders.value = pendingRes.data.slice(0, 5)
    }

    const rankingRes = await getPlayerRanking()
    if (rankingRes.code === 200) {
      topPlayers.value = rankingRes.data.slice(0, 5)
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 24px;

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      position: relative;
      overflow: hidden;
      transition: all var(--transition-normal);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        border-color: rgba(0, 245, 255, 0.3);
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.total {
          background: linear-gradient(135deg, rgba(0, 245, 255, 0.2), rgba(0, 245, 255, 0.05));
          color: var(--accent-cyan);
        }

        &.pending {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.05));
          color: var(--accent-yellow);
        }

        &.active {
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 136, 0.05));
          color: var(--accent-green);
        }

        &.completed {
          background: linear-gradient(135deg, rgba(191, 0, 255, 0.2), rgba(191, 0, 255, 0.05));
          color: var(--accent-purple);
        }
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: var(--text-secondary);
        }
      }

      .stat-trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        position: absolute;
        top: 16px;
        right: 16px;

        &.up {
          color: var(--accent-green);
        }

        &.down {
          color: var(--accent-red);
        }
      }
    }
  }

  .content-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;

    .content-left {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .content-right {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
  }

  .chart-placeholder {
    height: 200px;
    display: flex;
    align-items: flex-end;

    .chart-bars {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      padding: 0 20px;

      .chart-bar-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 50px;
        height: 100%;

        .bar {
          width: 30px;
          border-radius: 4px 4px 0 0;
          transition: all var(--transition-normal);
          animation: barGrow 1s ease-out;

          &:hover {
            opacity: 0.8;
            transform: scaleX(1.1);
          }
        }

        .label {
          margin-top: 8px;
          font-size: 12px;
          color: var(--text-secondary);
        }
      }
    }
  }

  .order-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: var(--bg-secondary);
      border-radius: 8px;
      transition: all var(--transition-normal);

      &:hover {
        background: var(--bg-hover);
      }

      .order-info {
        .order-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .order-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: var(--text-muted);

          .order-no {
            font-family: monospace;
          }
        }
      }

      .order-right {
        text-align: right;

        .order-amount {
          font-size: 16px;
          font-weight: 600;
          color: var(--accent-orange);
          margin-bottom: 6px;
        }
      }
    }
  }

  .ranking-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .ranking-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--bg-secondary);
      border-radius: 8px;
      transition: all var(--transition-normal);

      &:hover {
        background: var(--bg-hover);
      }

      .ranking-rank {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 600;

        &.rank-1 {
          background: linear-gradient(135deg, #ffd700, #ffb347);
          color: var(--bg-dark);
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
        }

        &.rank-2 {
          background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
          color: var(--bg-dark);
        }

        &.rank-3 {
          background: linear-gradient(135deg, #cd7f32, #daa06d);
          color: var(--bg-dark);
        }

        &:not(.rank-1):not(.rank-2):not(.rank-3) {
          background: var(--bg-hover);
          color: var(--text-secondary);
        }
      }

      .ranking-info {
        flex: 1;

        .ranking-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .ranking-stats {
          font-size: 12px;
          color: var(--text-muted);
          display: flex;
          gap: 8px;
        }
      }

      .ranking-earnings {
        font-size: 14px;
        font-weight: 600;
        color: var(--accent-orange);
      }
    }
  }

  .todo-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .todo-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      transition: all var(--transition-normal);

      &.warning {
        background: rgba(255, 215, 0, 0.05);
        border: 1px solid rgba(255, 215, 0, 0.2);
      }

      &.danger {
        background: rgba(255, 51, 102, 0.05);
        border: 1px solid rgba(255, 51, 102, 0.2);
      }

      &.info {
        background: rgba(0, 245, 255, 0.05);
        border: 1px solid rgba(0, 245, 255, 0.2);
      }

      .todo-icon {
        font-size: 20px;

        .warning & {
          color: var(--accent-yellow);
        }

        .danger & {
          color: var(--accent-red);
        }

        .info & {
          color: var(--accent-cyan);
        }
      }

      .todo-content {
        flex: 1;

        .todo-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .todo-desc {
          font-size: 12px;
          color: var(--text-muted);
        }
      }
    }
  }
}

@keyframes barGrow {
  from {
    height: 0;
  }
}

@media (max-width: 1400px) {
  .dashboard-container {
    .stats-row {
      grid-template-columns: repeat(2, 1fr);
    }

    .content-row {
      grid-template-columns: 1fr;
    }
  }
}
</style>
