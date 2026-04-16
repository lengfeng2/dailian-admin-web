<template>
  <div class="player-detail-container fade-in">
    <div class="page-header">
      <el-button link @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回列表
      </el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="8">
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <el-icon class="icon"><UserFilled /></el-icon>
              基本信息
            </div>
            <el-button type="primary" size="small" @click="handleEdit">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
          </div>
          <div class="card-body">
            <div class="player-info-header">
              <el-avatar :size="80" class="player-avatar">
                <el-icon :size="40"><UserFilled /></el-icon>
              </el-avatar>
              <div class="player-info">
                <div class="player-name">
                  {{ playerInfo.nickname }}
                  <el-tag :type="getLevelType(playerInfo.level)" size="small">
                    {{ getLevelName(playerInfo.level) }}
                  </el-tag>
                </div>
                <div class="player-rating">
                  <el-rate 
                    v-model="playerInfo.rating" 
                    disabled 
                    :max="5" 
                    :show-text="false"
                    :colors="['#FFD700', '#FFD700', '#FFD700']"
                  />
                  <span class="rating-value">{{ playerInfo.rating }}</span>
                </div>
                <div class="player-status">
                  <el-tag :type="getStatusType(playerInfo.status)" size="small">
                    {{ getStatusName(playerInfo.status) }}
                  </el-tag>
                </div>
              </div>
            </div>

            <el-divider />

            <el-descriptions :column="1" border>
              <el-descriptions-item label="用户名">
                {{ playerInfo.username }}
              </el-descriptions-item>
              <el-descriptions-item label="真实姓名">
                {{ playerInfo.realName }}
              </el-descriptions-item>
              <el-descriptions-item label="手机号">
                {{ playerInfo.phone }}
              </el-descriptions-item>
              <el-descriptions-item label="邮箱">
                {{ playerInfo.email }}
              </el-descriptions-item>
              <el-descriptions-item label="身份证号">
                {{ playerInfo.idCard }}
              </el-descriptions-item>
              <el-descriptions-item label="注册时间">
                {{ playerInfo.createdAt }}
              </el-descriptions-item>
            </el-descriptions>

            <el-divider />

            <div class="info-section">
              <div class="section-title">
                <el-icon><Wallet /></el-icon>
                账户信息
              </div>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="银行卡">
                  {{ playerInfo.bankCard }}
                  <span class="gray-text">({{ playerInfo.bankName }})</span>
                </el-descriptions-item>
                <el-descriptions-item label="支付宝">
                  {{ playerInfo.alipay }}
                </el-descriptions-item>
                <el-descriptions-item label="微信">
                  {{ playerInfo.wechat }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="16">
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <el-icon class="icon"><DataAnalysis /></el-icon>
              数据统计
            </div>
          </div>
          <div class="card-body">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-icon total">
                    <el-icon><Document /></el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ playerInfo.orderCount }}</div>
                    <div class="stat-label">总订单数</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-icon success">
                    <el-icon><CircleCheck /></el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ playerInfo.completedCount }}</div>
                    <div class="stat-label">完成订单</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-icon warning">
                    <el-icon><CircleClose /></el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ playerInfo.cancelCount }}</div>
                    <div class="stat-label">取消订单</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-icon primary">
                    <el-icon><Money /></el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">¥{{ playerInfo.totalEarnings?.toLocaleString() || 0 }}</div>
                    <div class="stat-label">总收入</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>

        <el-tabs v-model="activeTab" class="detail-tabs">
          <el-tab-pane label="擅长游戏" name="games">
            <div class="card">
              <div class="card-body">
                <div class="games-section">
                  <div class="game-item" v-for="(specialty, index) in playerInfo.specialties" :key="index">
                    <div class="game-header">
                      <span class="game-name">{{ specialty.game }}</span>
                      <el-tag type="primary">{{ specialty.rank }}</el-tag>
                    </div>
                    <div class="game-roles">
                      <span class="role-label">擅长位置：</span>
                      <el-tag 
                        v-for="(role, idx) in specialty.roles" 
                        :key="idx" 
                        size="small"
                        style="margin-right: 5px"
                      >
                        {{ role }}
                      </el-tag>
                    </div>
                  </div>
                </div>

                <el-divider />

                <div class="intro-section">
                  <div class="section-title">个人简介</div>
                  <p class="intro-text">{{ playerInfo.introduction }}</p>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="近期订单" name="orders">
            <div class="card">
              <div class="card-body">
                <el-table :data="playerInfo.recentOrders || []" stripe>
                  <el-table-column prop="id" label="订单号" width="180" />
                  <el-table-column prop="title" label="订单标题" min-width="200" />
                  <el-table-column prop="amount" label="金额" width="100">
                    <template #default="{ row }">
                      <span class="amount">¥{{ row.amount }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                      <el-tag :type="getOrderStatusType(row.status)" size="small">
                        {{ getOrderStatusLabel(row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="completedAt" label="完成时间" min-width="180">
                    <template #default="{ row }">
                      {{ row.completedAt || row.startedAt || '-' }}
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="收益记录" name="earnings">
            <div class="card">
              <div class="card-body">
                <el-table :data="playerInfo.earningsHistory || []" stripe>
                  <el-table-column prop="month" label="月份" width="120" />
                  <el-table-column prop="orderCount" label="完成订单数" width="120" />
                  <el-table-column prop="amount" label="收益金额" min-width="150">
                    <template #default="{ row }">
                      <span class="amount">¥{{ row.amount.toLocaleString() }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="月均收益" width="150">
                    <template #default="{ row }">
                      <span class="avg-amount">
                        ¥{{ Math.round(row.amount / row.orderCount).toLocaleString() }}
                      </span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPlayerDetail } from '@/api/player'

const route = useRoute()
const router = useRouter()

const playerInfo = ref({
  id: null,
  username: '',
  nickname: '',
  realName: '',
  phone: '',
  email: '',
  avatar: '',
  level: '',
  games: [],
  rating: 0,
  orderCount: 0,
  completedCount: 0,
  cancelCount: 0,
  totalEarnings: 0,
  thisMonthEarnings: 0,
  status: '',
  createdAt: '',
  idCard: '',
  bankCard: '',
  bankName: '',
  alipay: '',
  wechat: '',
  introduction: '',
  specialties: [],
  recentOrders: [],
  earningsHistory: []
})

const activeTab = ref('games')

const levelMap = {
  gold: { name: '黄金', type: 'warning' },
  platinum: { name: '铂金', type: 'info' },
  diamond: { name: '钻石', type: 'primary' },
  master: { name: '大师', type: 'success' }
}

const statusMap = {
  active: { name: '正常', type: 'success' },
  review: { name: '审核中', type: 'warning' },
  frozen: { name: '冻结', type: 'danger' },
  rejected: { name: '已拒绝', type: 'info' }
}

const orderStatusMap = {
  waiting: { name: '待支付', type: 'warning' },
  pending: { name: '待接单', type: 'warning' },
  active: { name: '进行中', type: 'success' },
  completed: { name: '已完成', type: 'info' },
  cancelled: { name: '已取消', type: 'danger' }
}

const getLevelName = (level) => levelMap[level]?.name || level
const getLevelType = (level) => levelMap[level]?.type || 'info'
const getStatusName = (status) => statusMap[status]?.name || status
const getStatusType = (status) => statusMap[status]?.type || 'info'
const getOrderStatusLabel = (status) => orderStatusMap[status]?.name || status
const getOrderStatusType = (status) => orderStatusMap[status]?.type || 'info'

const goBack = () => {
  router.back()
}

const handleEdit = () => {
  router.push(`/player/list`)
}

const fetchData = async () => {
  const id = route.params.id
  if (!id) return

  try {
    const res = await getPlayerDetail(id as string)
    if (res.code === 200) {
      playerInfo.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch player detail:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.player-detail-container {
  .page-header {
    margin-bottom: 20px;

    :deep(.el-button) {
      padding: 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .player-info-header {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    .player-avatar {
      background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
    }

    .player-info {
      flex: 1;

      .player-name {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .player-rating {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .rating-value {
          font-size: 14px;
          color: var(--accent-orange);
          font-weight: 600;
        }
      }
    }
  }

  .info-section {
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .gray-text {
      color: var(--text-muted);
    }
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 8px;

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.total {
        background: linear-gradient(135deg, rgba(0, 245, 255, 0.2), rgba(0, 245, 255, 0.05));
        color: var(--accent-cyan);
      }

      &.success {
        background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 136, 0.05));
        color: var(--accent-green);
      }

      &.warning {
        background: linear-gradient(135deg, rgba(255, 51, 102, 0.2), rgba(255, 51, 102, 0.05));
        color: var(--accent-red);
      }

      &.primary {
        background: linear-gradient(135deg, rgba(191, 0, 255, 0.2), rgba(191, 0, 255, 0.05));
        color: var(--accent-purple);
      }
    }

    .stat-content {
      .stat-value {
        font-size: 20px;
        font-weight: 700;
        color: var(--text-primary);
      }

      .stat-label {
        font-size: 12px;
        color: var(--text-secondary);
      }
    }
  }

  .detail-tabs {
    margin-top: 20px;

    :deep(.el-tabs__content) {
      margin-top: 20px;
    }
  }

  .games-section {
    .game-item {
      padding: 16px;
      background: var(--bg-secondary);
      border-radius: 8px;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      .game-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        .game-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }
      }

      .game-roles {
        display: flex;
        align-items: center;
        gap: 8px;

        .role-label {
          font-size: 13px;
          color: var(--text-secondary);
        }
      }
    }
  }

  .intro-section {
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    .intro-text {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.8;
    }
  }

  .amount {
    color: var(--accent-orange);
    font-weight: 600;
  }

  .avg-amount {
    color: var(--text-muted);
    font-size: 13px;
  }
}
</style>
