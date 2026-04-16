<template>
  <div class="member-consumption-container fade-in">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <el-icon class="icon"><Wallet /></el-icon>
          消费明细
        </div>
        <div class="header-actions">
          <el-button @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <div class="member-info-card">
          <el-row :gutter="24">
            <el-col :span="6">
              <div class="info-item">
                <span class="label">用户名：</span>
                <span class="value">{{ memberInfo.username || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="info-item">
                <span class="label">昵称：</span>
                <span class="value">{{ memberInfo.nickname || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="info-item">
                <span class="label">当前余额：</span>
                <span class="value balance">¥{{ memberInfo.balance?.toLocaleString() || 0 }}</span>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="info-item">
                <span class="label">会员等级：</span>
                <span class="value">
                  <el-tag :type="getMemberLevelType(memberInfo.memberLevel)" size="small">
                    {{ getMemberLevelName(memberInfo.memberLevel) }}
                  </el-tag>
                </span>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="statistics-card">
          <el-row :gutter="24">
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-icon recharge">
                  <el-icon><Top /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">¥{{ statistics.totalRecharge?.toLocaleString() || 0 }}</div>
                  <div class="stat-label">累计充值</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-icon payment">
                  <el-icon><Bottom /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">¥{{ statistics.totalPayment?.toLocaleString() || 0 }}</div>
                  <div class="stat-label">累计消费</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-icon refund">
                  <el-icon><RefreshRight /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">¥{{ statistics.totalRefund?.toLocaleString() || 0 }}</div>
                  <div class="stat-label">累计退款</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-icon order">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ statistics.orderCount || 0 }}</div>
                  <div class="stat-label">订单数量</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="search-form">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="交易类型">
              <el-select
                v-model="searchForm.type"
                placeholder="全部类型"
                clearable
                style="width: 150px"
              >
                <el-option label="充值" value="recharge" />
                <el-option label="订单支付" value="order_payment" />
                <el-option label="订单退款" value="order_refund" />
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

        <el-table
          v-loading="loading"
          :data="tableData"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="orderNo" label="订单号" min-width="180">
            <template #default="{ row }">
              <span :class="{ 'text-muted': !row.orderNo }">
                {{ row.orderNo || '-' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="交易类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getTransactionType(row.type)" size="small">
                {{ getTransactionTypeName(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" width="120">
            <template #default="{ row }">
              <span :class="{'amount-positive': isPositiveAmount(row.type), 'amount-negative': !isPositiveAmount(row.type)}">
                {{ isPositiveAmount(row.type) ? '+' : '-' }}¥{{ row.amount.toLocaleString() }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="balanceBefore" label="变动前余额" width="140">
            <template #default="{ row }">
              ¥{{ row.balanceBefore.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="balanceAfter" label="变动后余额" width="140">
            <template #default="{ row }">
              ¥{{ row.balanceAfter.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="200" />
          <el-table-column prop="createdAt" label="交易时间" width="180" />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getConsumptionList, getMemberDetail, getMemberStatistics } from '@/api/member'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const memberInfo = ref({})
const statistics = ref({})

const searchForm = reactive({
  type: '',
  startDate: '',
  endDate: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const memberId = computed(() => route.params.id)

const getMemberLevelType = (level) => {
  const levelMap = {
    bronze: 'info',
    silver: '',
    gold: 'warning',
    diamond: 'success'
  }
  return levelMap[level] || 'info'
}

const getMemberLevelName = (level) => {
  const levelMap = {
    bronze: '青铜',
    silver: '白银',
    gold: '黄金',
    diamond: '钻石'
  }
  return levelMap[level] || level
}

const getTransactionType = (type) => {
  const typeMap = {
    recharge: 'success',
    order_payment: 'danger',
    order_refund: 'warning'
  }
  return typeMap[type] || 'info'
}

const getTransactionTypeName = (type) => {
  const typeMap = {
    recharge: '充值',
    order_payment: '订单支付',
    order_refund: '订单退款'
  }
  return typeMap[type] || type
}

const isPositiveAmount = (type) => {
  return type === 'recharge' || type === 'order_refund'
}

const fetchMemberInfo = async () => {
  try {
    const res = await getMemberDetail(memberId.value)
    if (res.code === 200) {
      memberInfo.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch member info:', error)
    ElMessage.error('获取会员信息失败')
  }
}

const fetchStatistics = async () => {
  try {
    const res = await getMemberStatistics(memberId.value)
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
    const res = await getConsumptionList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      userId: memberId.value,
      type: searchForm.type,
      startDate: searchForm.startDate,
      endDate: searchForm.endDate
    })
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('Failed to fetch consumption list:', error)
    ElMessage.error('获取消费明细失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.type = ''
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
  router.push('/member/list')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

onMounted(() => {
  fetchMemberInfo()
  fetchStatistics()
  fetchData()
})
</script>

<style lang="scss" scoped>
.member-consumption-container {
  .member-info-card {
    margin-bottom: 20px;
    padding: 20px;
    background: var(--bg-secondary);
    border-radius: 8px;

    .info-item {
      display: flex;
      align-items: center;

      .label {
        color: var(--text-secondary);
        margin-right: 8px;
      }

      .value {
        color: var(--text-primary);
        font-weight: 500;
      }

      .balance {
        color: var(--accent-orange);
      }
    }
  }

  .statistics-card {
    margin-bottom: 20px;
    padding: 20px;
    background: var(--bg-secondary);
    border-radius: 8px;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;

      &.recharge {
        background: var(--success-light);
        color: var(--success);
      }

      &.payment {
        background: var(--danger-light);
        color: var(--danger);
      }

      &.refund {
        background: var(--warning-light);
        color: var(--warning);
      }

      &.order {
        background: var(--primary-light);
        color: var(--primary);
      }
    }

    .stat-info {
      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
      }

      .stat-label {
        font-size: 14px;
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

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .amount-positive {
    color: var(--success);
    font-weight: 600;
  }

  .amount-negative {
    color: var(--danger);
    font-weight: 600;
  }

  .text-muted {
    color: var(--text-secondary);
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}
</style>
