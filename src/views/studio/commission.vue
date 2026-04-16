<template>
  <div class="studio-commission-container fade-in">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <el-icon class="icon"><Money /></el-icon>
          分佣管理 - {{ studioInfo.name }}
        </div>
        <div class="header-actions">
          <el-button @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出报表
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <div class="commission-stats">
          <el-row :gutter="24">
            <el-col :span="4">
              <div class="stat-item">
                <div class="stat-icon total">
                  <el-icon><Wallet /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">¥{{ statistics.totalRevenue?.toLocaleString() || 0 }}</div>
                  <div class="stat-label">订单总收入</div>
                </div>
              </div>
            </el-col>
            <el-col :span="5">
              <div class="stat-item">
                <div class="stat-icon studio">
                  <el-icon><OfficeBuilding /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">¥{{ statistics.totalStudioCommission?.toLocaleString() || 0 }}</div>
                  <div class="stat-label">工作室分佣 ({{ studioInfo.commissionRate || 0 }}%)</div>
                </div>
              </div>
            </el-col>
            <el-col :span="5">
              <div class="stat-item">
                <div class="stat-icon platform">
                  <el-icon><Platform /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">¥{{ statistics.totalPlatformCommission?.toLocaleString() || 0 }}</div>
                  <div class="stat-label">平台分佣 ({{ studioInfo.platformCommissionRate || 0 }}%)</div>
                </div>
              </div>
            </el-col>
            <el-col :span="5">
              <div class="stat-item">
                <div class="stat-icon player">
                  <el-icon><User /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">¥{{ statistics.totalPlayerIncome?.toLocaleString() || 0 }}</div>
                  <div class="stat-label">打手实际收入</div>
                </div>
              </div>
            </el-col>
            <el-col :span="5">
              <div class="stat-item">
                <div class="stat-icon pending">
                  <el-icon><Clock /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ statistics.pendingCount || 0 }} 笔</div>
                  <div class="stat-label">待结算</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="search-form">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="状态">
              <el-select
                v-model="searchForm.status"
                placeholder="全部状态"
                clearable
                style="width: 150px"
              >
                <el-option label="待结算" value="pending" />
                <el-option label="已结算" value="settled" />
              </el-select>
            </el-form-item>
            <el-form-item label="开始日期">
              <el-date-picker
                v-model="searchForm.startDate"
                type="date"
                placeholder="选择开始日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item label="结束日期">
              <el-date-picker
                v-model="searchForm.endDate"
                type="date"
                placeholder="选择结束日期"
                value-format="YYYY-MM-DD"
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

        <div class="batch-actions" v-if="hasPendingItems">
          <el-button type="primary" @click="handleBatchSettle">
            <el-icon><Money /></el-icon>
            批量结算待结算订单
          </el-button>
          <span class="action-tip">共 {{ pendingCount }} 笔待结算订单</span>
        </div>

        <el-table
          v-loading="loading"
          :data="tableData"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="orderNo" label="订单号" min-width="180" />
          <el-table-column prop="playerName" label="打手" width="120" />
          <el-table-column prop="gameType" label="游戏类型" width="120" />
          <el-table-column prop="orderAmount" label="订单金额" width="120">
            <template #default="{ row }">
              <span class="amount">¥{{ row.orderAmount.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="studioCommission" label="工作室分佣" width="130">
            <template #default="{ row }">
              <div class="commission-detail">
                <span class="commission-value">¥{{ row.studioCommission.toLocaleString() }}</span>
                <span class="commission-rate">({{ row.commissionRate }}%)</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="platformCommission" label="平台分佣" width="130">
            <template #default="{ row }">
              <div class="commission-detail">
                <span class="platform-value">¥{{ row.platformCommission.toLocaleString() }}</span>
                <span class="commission-rate">({{ row.platformRate }}%)</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="playerIncome" label="打手收入" width="120">
            <template #default="{ row }">
              <span class="player-income">¥{{ row.playerIncome.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'settled' ? 'success' : 'warning'" size="small">
                {{ row.status === 'settled' ? '已结算' : '待结算' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column prop="settledAt" label="结算时间" width="180">
            <template #default="{ row }">
              {{ row.settledAt || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="120">
            <template #default="{ row }">
              <el-button 
                v-if="row.status === 'pending'"
                type="primary" 
                link 
                size="small"
                @click="handleSettle(row)"
              >
                <el-icon><Money /></el-icon>
                结算
              </el-button>
              <el-button 
                v-else
                type="info" 
                link 
                size="small"
                @click="handleViewDetail(row)"
              >
                <el-icon><View /></el-icon>
                详情
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
      v-model="detailDialogVisible"
      title="分佣详情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ currentDetail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="打手">{{ currentDetail.playerName }}</el-descriptions-item>
        <el-descriptions-item label="游戏类型">{{ currentDetail.gameType }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">
          <span class="amount">¥{{ currentDetail.orderAmount?.toLocaleString() || 0 }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="工作室分佣">
          <span class="commission-value">¥{{ currentDetail.studioCommission?.toLocaleString() || 0 }}</span>
          <span class="commission-rate">({{ currentDetail.commissionRate || 0 }}%)</span>
        </el-descriptions-item>
        <el-descriptions-item label="平台分佣">
          <span class="platform-value">¥{{ currentDetail.platformCommission?.toLocaleString() || 0 }}</span>
          <span class="commission-rate">({{ currentDetail.platformRate || 0 }}%)</span>
        </el-descriptions-item>
        <el-descriptions-item label="打手实际收入" :span="2">
          <span class="player-income-large">¥{{ currentDetail.playerIncome?.toLocaleString() || 0 }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentDetail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="结算时间">{{ currentDetail.settledAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态" :span="2">
          <el-tag :type="currentDetail.status === 'settled' ? 'success' : 'warning'" size="small">
            {{ currentDetail.status === 'settled' ? '已结算' : '待结算' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getStudioDetail, 
  getStudioCommissionList, 
  getStudioStatistics,
  settleCommission 
} from '@/api/studio'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const studioInfo = ref({})
const statistics = ref({})

const detailDialogVisible = ref(false)
const currentDetail = ref({})

const studioId = computed(() => route.params.id)

const searchForm = reactive({
  status: '',
  startDate: '',
  endDate: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const hasPendingItems = computed(() => {
  return statistics.value.pendingCount > 0
})

const pendingCount = computed(() => {
  return statistics.value.pendingCount || 0
})

const fetchStudioInfo = async () => {
  try {
    const res = await getStudioDetail(studioId.value)
    if (res.code === 200) {
      studioInfo.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch studio info:', error)
    ElMessage.error('获取工作室信息失败')
  }
}

const fetchStatistics = async () => {
  try {
    const res = await getStudioStatistics(studioId.value)
    if (res.code === 200) {
      statistics.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
    ElMessage.error('获取统计信息失败')
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getStudioCommissionList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      studioId: studioId.value,
      status: searchForm.status,
      startDate: searchForm.startDate,
      endDate: searchForm.endDate
    })
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('Failed to fetch commission list:', error)
    ElMessage.error('获取分佣列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.status = ''
  searchForm.startDate = ''
  searchForm.endDate = ''
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

const handleBack = () => {
  router.push('/studio/list')
}

const handleSettle = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要结算订单 "${row.orderNo}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await settleCommission({ id: row.id })
    if (res.code === 200) {
      ElMessage.success('结算成功')
      fetchData()
      fetchStatistics()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('结算失败')
    }
  }
}

const handleBatchSettle = async () => {
  try {
    await ElMessageBox.confirm(`确定要批量结算所有待结算订单吗？共 ${pendingCount.value} 笔订单。`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    ElMessage.info('批量结算功能开发中...')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量结算失败')
    }
  }
}

const handleViewDetail = (row) => {
  currentDetail.value = { ...row }
  detailDialogVisible.value = true
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

onMounted(() => {
  fetchStudioInfo()
  fetchStatistics()
  fetchData()
})
</script>

<style lang="scss" scoped>
.studio-commission-container {
  .commission-stats {
    margin-bottom: 20px;
    padding: 20px;
    background: var(--bg-secondary);
    border-radius: 8px;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;

      &.total {
        background: var(--primary-light);
        color: var(--primary);
      }

      &.studio {
        background: var(--accent-cyan-light);
        color: var(--accent-cyan);
      }

      &.platform {
        background: var(--accent-purple-light);
        color: var(--accent-purple);
      }

      &.player {
        background: var(--success-light);
        color: var(--success);
      }

      &.pending {
        background: var(--warning-light);
        color: var(--warning);
      }
    }

    .stat-info {
      .stat-value {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
      }

      .stat-label {
        font-size: 12px;
        color: var(--text-secondary);
        margin-top: 4px;
      }
    }
  }

  .search-form {
    margin-bottom: 20px;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
  }

  .batch-actions {
    margin-bottom: 20px;
    padding: 12px 16px;
    background: var(--warning-light);
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;

    .action-tip {
      color: var(--warning);
      font-size: 14px;
    }
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .amount {
    color: var(--text-primary);
    font-weight: 600;
  }

  .commission-detail {
    display: flex;
    flex-direction: column;

    .commission-value {
      color: var(--accent-cyan);
      font-weight: 600;
    }

    .platform-value {
      color: var(--accent-purple);
      font-weight: 600;
    }

    .commission-rate {
      font-size: 12px;
      color: var(--text-secondary);
    }
  }

  .player-income {
    color: var(--success);
    font-weight: 600;
  }

  .player-income-large {
    color: var(--success);
    font-weight: 600;
    font-size: 16px;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}
</style>
