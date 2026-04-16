<template>
  <div class="member-list-container fade-in">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <el-icon class="icon"><Medal /></el-icon>
          会员列表
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
                placeholder="用户名/昵称/手机号"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="会员等级">
              <el-select
                v-model="searchForm.memberLevel"
                placeholder="全部等级"
                clearable
                style="width: 150px"
              >
                <el-option label="青铜" value="bronze" />
                <el-option label="白银" value="silver" />
                <el-option label="黄金" value="gold" />
                <el-option label="钻石" value="diamond" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select
                v-model="searchForm.status"
                placeholder="全部状态"
                clearable
                style="width: 150px"
              >
                <el-option label="正常" value="active" />
                <el-option label="冻结" value="frozen" />
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
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="nickname" label="昵称" width="120" />
          <el-table-column prop="phone" label="手机号" width="130" />
          <el-table-column prop="balance" label="余额" width="120">
            <template #default="{ row }">
              <span class="balance">¥{{ row.balance.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="totalConsumption" label="累计消费" width="120">
            <template #default="{ row }">
              <span class="consumption">¥{{ row.totalConsumption.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="memberLevel" label="会员等级" width="100">
            <template #default="{ row }">
              <el-tag :type="getMemberLevelType(row.memberLevel)" size="small">
                {{ getMemberLevelName(row.memberLevel) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                {{ row.status === 'active' ? '正常' : '冻结' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="isMuted" label="禁言状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.isMuted ? 'warning' : 'info'" size="small">
                {{ row.isMuted ? '已禁言' : '正常' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="注册时间" width="120" />
          <el-table-column label="操作" fixed="right" width="320">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleViewConsumption(row)">
                <el-icon><Wallet /></el-icon>
                消费明细
              </el-button>
              <el-button type="primary" link size="small" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑资料
              </el-button>
              <el-button 
                :type="row.isMuted ? 'success' : 'warning'" 
                link 
                size="small"
                @click="handleToggleMute(row)"
              >
                <el-icon><component :is="row.isMuted ? 'ChatDotRound' : 'MicrophoneOff'" /></el-icon>
                {{ row.isMuted ? '解除禁言' : '禁言' }}
              </el-button>
              <el-button 
                :type="row.status === 'active' ? 'danger' : 'success'" 
                link 
                size="small"
                @click="handleToggleStatus(row)"
              >
                <el-icon><component :is="row.status === 'active' ? 'Lock' : 'Unlock'" /></el-icon>
                {{ row.status === 'active' ? '冻结' : '解冻' }}
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
      v-model="dialogVisible"
      title="编辑会员资料"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="会员等级" prop="memberLevel">
          <el-select v-model="form.memberLevel" placeholder="请选择会员等级" style="width: 100%">
            <el-option label="青铜" value="bronze" />
            <el-option label="白银" value="silver" />
            <el-option label="黄金" value="gold" />
            <el-option label="钻石" value="diamond" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="active">正常</el-radio>
            <el-radio value="frozen">冻结</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMemberList, updateMember, updateMemberStatus, toggleMemberMute } from '@/api/member'

const router = useRouter()
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref()
const tableData = ref([])

const searchForm = reactive({
  keyword: '',
  memberLevel: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  id: null,
  username: '',
  nickname: '',
  phone: '',
  email: '',
  memberLevel: 'bronze',
  status: 'active'
})

const formRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

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

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getMemberList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      memberLevel: searchForm.memberLevel,
      status: searchForm.status
    })
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('Failed to fetch member list:', error)
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
  searchForm.memberLevel = ''
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

const handleViewConsumption = (row) => {
  router.push(`/member/consumption/${row.id}`)
}

const handleEdit = (row) => {
  form.id = row.id
  form.username = row.username
  form.nickname = row.nickname
  form.phone = row.phone
  form.email = row.email
  form.memberLevel = row.memberLevel
  form.status = row.status
  dialogVisible.value = true
}

const handleToggleMute = async (row) => {
  const action = row.isMuted ? '解除禁言' : '禁言'
  try {
    await ElMessageBox.confirm(`确定要${action}该用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const newMuteStatus = !row.isMuted
    const res = await toggleMemberMute({ id: row.id, isMuted: newMuteStatus })
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

const handleToggleStatus = async (row) => {
  const action = row.status === 'active' ? '冻结' : '解冻'
  try {
    await ElMessageBox.confirm(`确定要${action}该用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const newStatus = row.status === 'active' ? 'frozen' : 'active'
    const res = await updateMemberStatus({ id: row.id, status: newStatus })
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

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const res = await updateMember({
          id: form.id,
          nickname: form.nickname,
          phone: form.phone,
          email: form.email,
          memberLevel: form.memberLevel,
          status: form.status
        })
        if (res.code === 200) {
          ElMessage.success('编辑成功')
          dialogVisible.value = false
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

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.member-list-container {
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

  .balance {
    color: var(--accent-orange);
    font-weight: 600;
  }

  .consumption {
    color: var(--accent-purple);
    font-weight: 600;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}
</style>
