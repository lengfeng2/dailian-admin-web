<template>
  <div class="studio-invite-container fade-in">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <el-icon class="icon"><UserAdd /></el-icon>
          打手管理 - {{ studioInfo.name }}
        </div>
        <div class="header-actions">
          <el-button @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <el-button type="primary" @click="handleInvite">
            <el-icon><Plus /></el-icon>
            邀请打手
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <div class="studio-stats">
          <el-row :gutter="24">
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-icon players">
                  <el-icon><User /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ studioInfo.playerCount || 0 }}</div>
                  <div class="stat-label">打手数量</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-icon orders">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ studioInfo.orderCount || 0 }}</div>
                  <div class="stat-label">完成订单</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-icon revenue">
                  <el-icon><Money /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">¥{{ studioInfo.totalRevenue?.toLocaleString() || 0 }}</div>
                  <div class="stat-label">总收入</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-icon commission">
                  <el-icon><Wallet /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ studioInfo.commissionRate || 0 }}%</div>
                  <div class="stat-label">分佣比例</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="search-form">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="关键词">
              <el-input
                v-model="searchForm.keyword"
                placeholder="打手昵称/手机号"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select
                v-model="searchForm.status"
                placeholder="全部状态"
                clearable
                style="width: 150px"
              >
                <el-option label="正常" value="active" />
                <el-option label="已禁用" value="disabled" />
                <el-option label="待审核" value="pending" />
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
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="playerName" label="打手昵称" width="140" />
          <el-table-column prop="playerPhone" label="手机号" width="130" />
          <el-table-column prop="gameType" label="游戏类型" width="120" />
          <el-table-column prop="rank" label="段位/等级" width="150" />
          <el-table-column prop="winRate" label="胜率" width="100">
            <template #default="{ row }">
              <span :class="{'high-winrate': row.winRate >= 80}">{{ row.winRate }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="orderCount" label="完成订单" width="100">
            <template #default="{ row }">
              <span class="order-count">{{ row.orderCount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="totalRevenue" label="总收入" width="120">
            <template #default="{ row }">
              <span class="revenue">¥{{ row.totalRevenue.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="commissionRate" label="分佣比例" width="100">
            <template #default="{ row }">
              <span class="commission-rate">{{ row.commissionRate }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusName(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="joinAt" label="加入时间" width="120" />
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEditCommission(row)">
                <el-icon><Edit /></el-icon>
                调整分佣
              </el-button>
              <el-button type="danger" link size="small" @click="handleRemove(row)">
                <el-icon><Delete /></el-icon>
                移除
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
      v-model="inviteDialogVisible"
      title="邀请打手"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="inviteFormRef"
        :model="inviteForm"
        :rules="inviteFormRules"
        label-width="120px"
      >
        <el-form-item label="打手昵称" prop="playerName">
          <el-input
            v-model="inviteForm.playerName"
            placeholder="请输入打手昵称"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="playerPhone">
          <el-input
            v-model="inviteForm.playerPhone"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </el-form-item>
        <el-form-item label="游戏类型" prop="gameType">
          <el-select
            v-model="inviteForm.gameType"
            placeholder="请选择游戏类型"
            style="width: 100%"
          >
            <el-option label="王者荣耀" value="王者荣耀" />
            <el-option label="和平精英" value="和平精英" />
            <el-option label="原神" value="原神" />
            <el-option label="英雄联盟" value="英雄联盟" />
            <el-option label="穿越火线" value="穿越火线" />
            <el-option label="绝地求生" value="绝地求生" />
            <el-option label="永劫无间" value="永劫无间" />
          </el-select>
        </el-form-item>
        <el-form-item label="段位/等级" prop="rank">
          <el-input
            v-model="inviteForm.rank"
            placeholder="请输入段位或等级"
          />
        </el-form-item>
        <el-form-item label="分佣比例" prop="commissionRate">
          <el-input-number
            v-model="inviteForm.commissionRate"
            :min="5"
            :max="50"
            :precision="0"
            style="width: 200px"
          />
          <span class="unit">%</span>
          <div class="form-tip">打手实际收入 = 订单金额 - 工作室分佣 - 平台分佣</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inviteDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmitInvite">
          发送邀请
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="commissionDialogVisible"
      title="调整分佣比例"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="commissionFormRef"
        :model="commissionForm"
        :rules="commissionFormRules"
        label-width="120px"
      >
        <el-form-item label="打手昵称">
          <el-input v-model="commissionForm.playerName" disabled />
        </el-form-item>
        <el-form-item label="当前分佣比例">
          <el-input :value="commissionForm.currentRate + '%'" disabled />
        </el-form-item>
        <el-form-item label="新分佣比例" prop="commissionRate">
          <el-input-number
            v-model="commissionForm.commissionRate"
            :min="5"
            :max="50"
            :precision="0"
            style="width: 200px"
          />
          <span class="unit">%</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="commissionDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmitCommission">
          确认调整
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getStudioDetail, 
  getStudioPlayerList, 
  invitePlayer, 
  updatePlayerCommission, 
  removePlayer 
} from '@/api/studio'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const studioInfo = ref({})

const inviteDialogVisible = ref(false)
const commissionDialogVisible = ref(false)
const inviteFormRef = ref()
const commissionFormRef = ref()
const currentPlayer = ref(null)

const studioId = computed(() => route.params.id)

const searchForm = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const inviteForm = reactive({
  playerName: '',
  playerPhone: '',
  gameType: '',
  rank: '',
  commissionRate: 20
})

const commissionForm = reactive({
  id: null,
  playerName: '',
  currentRate: 0,
  commissionRate: 0
})

const inviteFormRules = {
  playerName: [
    { required: true, message: '请输入打手昵称', trigger: 'blur' }
  ],
  playerPhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  gameType: [
    { required: true, message: '请选择游戏类型', trigger: 'change' }
  ],
  commissionRate: [
    { required: true, message: '请输入分佣比例', trigger: 'blur' }
  ]
}

const commissionFormRules = {
  commissionRate: [
    { required: true, message: '请输入分佣比例', trigger: 'blur' }
  ]
}

const getStatusType = (status) => {
  const typeMap = {
    active: 'success',
    disabled: 'danger',
    pending: 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusName = (status) => {
  const nameMap = {
    active: '正常',
    disabled: '已禁用',
    pending: '待审核'
  }
  return nameMap[status] || status
}

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

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getStudioPlayerList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      studioId: studioId.value,
      keyword: searchForm.keyword,
      status: searchForm.status
    })
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('Failed to fetch player list:', error)
    ElMessage.error('获取打手列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
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

const handleInvite = () => {
  inviteForm.playerName = ''
  inviteForm.playerPhone = ''
  inviteForm.gameType = ''
  inviteForm.rank = ''
  inviteForm.commissionRate = 20
  inviteDialogVisible.value = true
}

const handleSubmitInvite = async () => {
  if (!inviteFormRef.value) return
  
  await inviteFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const res = await invitePlayer({
          studioId: studioId.value,
          ...inviteForm
        })
        if (res.code === 200) {
          ElMessage.success('邀请已发送')
          inviteDialogVisible.value = false
          fetchData()
        }
      } catch (error) {
        ElMessage.error('发送邀请失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleEditCommission = (row) => {
  currentPlayer.value = row
  commissionForm.id = row.id
  commissionForm.playerName = row.playerName
  commissionForm.currentRate = row.commissionRate
  commissionForm.commissionRate = row.commissionRate
  commissionDialogVisible.value = true
}

const handleSubmitCommission = async () => {
  if (!commissionFormRef.value) return
  
  await commissionFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const res = await updatePlayerCommission({
          id: commissionForm.id,
          commissionRate: commissionForm.commissionRate
        })
        if (res.code === 200) {
          ElMessage.success('分佣比例调整成功')
          commissionDialogVisible.value = false
          fetchData()
        }
      } catch (error) {
        ElMessage.error('调整失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleRemove = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要移除打手 "${row.playerName}" 吗？移除后无法恢复。`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await removePlayer({ id: row.id })
    if (res.code === 200) {
      ElMessage.success('已移除打手')
      fetchData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('移除失败')
    }
  }
}

onMounted(() => {
  fetchStudioInfo()
  fetchData()
})
</script>

<style lang="scss" scoped>
.studio-invite-container {
  .studio-stats {
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

      &.players {
        background: var(--primary-light);
        color: var(--primary);
      }

      &.orders {
        background: var(--success-light);
        color: var(--success);
      }

      &.revenue {
        background: var(--warning-light);
        color: var(--warning);
      }

      &.commission {
        background: var(--danger-light);
        color: var(--danger);
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

  .high-winrate {
    color: var(--success);
    font-weight: 600;
  }

  .order-count {
    color: var(--primary);
    font-weight: 600;
  }

  .revenue {
    color: var(--accent-orange);
    font-weight: 600;
  }

  .commission-rate {
    color: var(--accent-purple);
    font-weight: 600;
  }

  .unit {
    margin-left: 8px;
    color: var(--text-secondary);
  }

  .form-tip {
    margin-top: 8px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}
</style>
