<template>
  <div class="studio-list-container fade-in">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <el-icon class="icon"><OfficeBuilding /></el-icon>
          工作室列表
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <div class="search-form">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="关键词">
              <el-input
                v-model="searchForm.keyword"
                placeholder="工作室名称/负责人/手机号"
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
                <el-option label="待审核" value="pending" />
                <el-option label="已拒绝" value="rejected" />
              </el-select>
            </el-form-item>
            <el-form-item label="申请状态">
              <el-select
                v-model="searchForm.applyStatus"
                placeholder="全部申请状态"
                clearable
                style="width: 150px"
              >
                <el-option label="已通过" value="approved" />
                <el-option label="待审核" value="pending" />
                <el-option label="已拒绝" value="rejected" />
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
          <el-table-column prop="name" label="工作室名称" min-width="180" />
          <el-table-column prop="ownerName" label="负责人" width="100" />
          <el-table-column prop="ownerPhone" label="联系电话" width="130" />
          <el-table-column prop="playerCount" label="打手数量" width="100">
            <template #default="{ row }">
              <span class="count">{{ row.playerCount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="orderCount" label="订单数量" width="100">
            <template #default="{ row }">
              <span class="count">{{ row.orderCount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="totalRevenue" label="总收入" width="130">
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
          <el-table-column prop="applyStatus" label="申请状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getApplyStatusType(row.applyStatus)" size="small">
                {{ getApplyStatusName(row.applyStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="申请时间" width="120" />
          <el-table-column label="操作" fixed="right" width="350">
            <template #default="{ row }">
              <el-button 
                v-if="row.applyStatus === 'pending'"
                type="success" 
                link 
                size="small"
                @click="handleApprove(row)"
              >
                <el-icon><Check /></el-icon>
                审核通过
              </el-button>
              <el-button 
                v-if="row.applyStatus === 'pending'"
                type="danger" 
                link 
                size="small"
                @click="handleReject(row)"
              >
                <el-icon><Close /></el-icon>
                拒绝
              </el-button>
              <el-button type="primary" link size="small" @click="handleViewPlayers(row)">
                <el-icon><User /></el-icon>
                打手管理
              </el-button>
              <el-button type="primary" link size="small" @click="handleViewCommission(row)">
                <el-icon><Money /></el-icon>
                分佣管理
              </el-button>
              <el-button 
                :type="row.status === 'active' ? 'danger' : 'success'" 
                link 
                size="small"
                @click="handleToggleStatus(row)"
              >
                <el-icon><component :is="row.status === 'active' ? 'Lock' : 'Unlock'" /></el-icon>
                {{ row.status === 'active' ? '禁用' : '启用' }}
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
      v-model="approveDialogVisible"
      title="审核通过"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="approveFormRef"
        :model="approveForm"
        :rules="approveFormRules"
        label-width="120px"
      >
        <el-form-item label="工作室分佣比例" prop="commissionRate">
          <el-input-number
            v-model="approveForm.commissionRate"
            :min="1"
            :max="50"
            :precision="0"
            style="width: 200px"
          />
          <span class="unit">%</span>
        </el-form-item>
        <el-form-item label="平台分佣比例" prop="platformCommissionRate">
          <el-input-number
            v-model="approveForm.platformCommissionRate"
            :min="1"
            :max="30"
            :precision="0"
            style="width: 200px"
          />
          <span class="unit">%</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="approveForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmitApprove">
          确认通过
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝申请"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="rejectFormRef"
        :model="rejectForm"
        :rules="rejectFormRules"
        label-width="100px"
      >
        <el-form-item label="拒绝原因" prop="rejectReason">
          <el-input
            v-model="rejectForm.rejectReason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="submitLoading" @click="handleSubmitReject">
          确认拒绝
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getStudioList, 
  approveStudio, 
  rejectStudio, 
  updateStudioStatus 
} from '@/api/studio'

const router = useRouter()
const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])

const approveDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const approveFormRef = ref()
const rejectFormRef = ref()
const currentStudio = ref(null)

const searchForm = reactive({
  keyword: '',
  status: '',
  applyStatus: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const approveForm = reactive({
  commissionRate: 15,
  platformCommissionRate: 5,
  remark: ''
})

const rejectForm = reactive({
  rejectReason: ''
})

const approveFormRules = {
  commissionRate: [
    { required: true, message: '请输入工作室分佣比例', trigger: 'blur' }
  ],
  platformCommissionRate: [
    { required: true, message: '请输入平台分佣比例', trigger: 'blur' }
  ]
}

const rejectFormRules = {
  rejectReason: [
    { required: true, message: '请输入拒绝原因', trigger: 'blur' },
    { min: 5, message: '拒绝原因至少5个字符', trigger: 'blur' }
  ]
}

const getStatusType = (status) => {
  const typeMap = {
    active: 'success',
    pending: 'warning',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusName = (status) => {
  const nameMap = {
    active: '正常',
    pending: '待审核',
    rejected: '已拒绝'
  }
  return nameMap[status] || status
}

const getApplyStatusType = (status) => {
  const typeMap = {
    approved: 'success',
    pending: 'warning',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

const getApplyStatusName = (status) => {
  const nameMap = {
    approved: '已通过',
    pending: '待审核',
    rejected: '已拒绝'
  }
  return nameMap[status] || status
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getStudioList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      status: searchForm.status,
      applyStatus: searchForm.applyStatus
    })
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('Failed to fetch studio list:', error)
    ElMessage.error('获取数据失败')
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
  searchForm.applyStatus = ''
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

const handleApprove = (row) => {
  currentStudio.value = row
  approveForm.commissionRate = 15
  approveForm.platformCommissionRate = 5
  approveForm.remark = ''
  approveDialogVisible.value = true
}

const handleSubmitApprove = async () => {
  if (!approveFormRef.value) return
  
  await approveFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const res = await approveStudio({
          id: currentStudio.value.id,
          commissionRate: approveForm.commissionRate,
          platformCommissionRate: approveForm.platformCommissionRate
        })
        if (res.code === 200) {
          ElMessage.success('审核通过')
          approveDialogVisible.value = false
          fetchData()
        }
      } catch (error) {
        ElMessage.error('操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleReject = (row) => {
  currentStudio.value = row
  rejectForm.rejectReason = ''
  rejectDialogVisible.value = true
}

const handleSubmitReject = async () => {
  if (!rejectFormRef.value) return
  
  await rejectFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const res = await rejectStudio({
          id: currentStudio.value.id,
          rejectReason: rejectForm.rejectReason
        })
        if (res.code === 200) {
          ElMessage.success('已拒绝申请')
          rejectDialogVisible.value = false
          fetchData()
        }
      } catch (error) {
        ElMessage.error('操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleViewPlayers = (row) => {
  router.push(`/studio/invite/${row.id}`)
}

const handleViewCommission = (row) => {
  router.push(`/studio/commission/${row.id}`)
}

const handleToggleStatus = async (row) => {
  const action = row.status === 'active' ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}该工作室吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const newStatus = row.status === 'active' ? 'frozen' : 'active'
    const res = await updateStudioStatus({ id: row.id, status: newStatus })
    if (res.code === 200) {
      ElMessage.success(`${action}成功`)
      fetchData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败`)
    }
  }
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.studio-list-container {
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

  .count {
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

  .header-actions {
    display: flex;
    gap: 12px;
  }
}
</style>
