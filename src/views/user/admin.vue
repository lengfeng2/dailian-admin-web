<template>
  <div class="admin-list-container fade-in">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <el-icon class="icon"><Key /></el-icon>
          管理员管理
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增管理员
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <div class="search-form">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="关键词">
              <el-input
                v-model="searchForm.keyword"
                placeholder="用户名/姓名"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="角色">
              <el-select
                v-model="searchForm.role"
                placeholder="全部角色"
                clearable
                style="width: 150px"
              >
                <el-option label="超级管理员" value="super_admin" />
                <el-option label="管理员" value="admin" />
                <el-option label="客服" value="customer" />
                <el-option label="财务" value="finance" />
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
          <el-table-column prop="username" label="用户名" width="140" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="role" label="角色" width="140">
            <template #default="{ row }">
              <el-tag :type="getRoleType(row.role)" size="small">
                {{ getRoleName(row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column prop="phone" label="手机号" width="140" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                {{ row.status === 'active' ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastLogin" label="最后登录" width="180" />
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
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
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="管理员" value="admin" />
            <el-option label="客服" value="customer" />
            <el-option label="财务" value="finance" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="active">正常</el-radio>
            <el-radio value="frozen">禁用</el-radio>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminList, createAdmin, updateAdmin, deleteAdmin } from '@/api/user'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const tableData = ref([])

const searchForm = reactive({
  keyword: '',
  role: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  id: null,
  username: '',
  name: '',
  password: '',
  role: 'customer',
  email: '',
  phone: '',
  status: 'active'
})

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const dialogTitle = computed(() => isEdit.value ? '编辑管理员' : '新增管理员')

const roleMap = {
  super_admin: { name: '超级管理员', type: 'danger' },
  admin: { name: '管理员', type: 'primary' },
  customer: { name: '客服', type: 'success' },
  finance: { name: '财务', type: 'warning' }
}

const getRoleName = (role) => {
  return roleMap[role]?.name || role
}

const getRoleType = (role) => {
  return roleMap[role]?.type || 'info'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getAdminList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      role: searchForm.role
    })
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('Failed to fetch admin list:', error)
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
  searchForm.role = ''
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

const handleAdd = () => {
  isEdit.value = false
  form.id = null
  form.username = ''
  form.name = ''
  form.password = ''
  form.role = 'customer'
  form.email = ''
  form.phone = ''
  form.status = 'active'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  form.id = row.id
  form.username = row.username
  form.name = row.name
  form.role = row.role
  form.email = row.email
  form.phone = row.phone
  form.status = row.status
  dialogVisible.value = true
}

const handleToggleStatus = async (row) => {
  const action = row.status === 'active' ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}该管理员吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const newStatus = row.status === 'active' ? 'frozen' : 'active'
    const res = await updateAdmin({ id: row.id, status: newStatus })
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
        const res = isEdit.value 
          ? await updateAdmin(form) 
          : await createAdmin(form)
        if (res.code === 200) {
          ElMessage.success(isEdit.value ? '编辑成功' : '创建成功')
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

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.admin-list-container {
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
}
</style>
