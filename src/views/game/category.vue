<template>
  <div class="category-list-container fade-in">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <el-icon class="icon"><Menu /></el-icon>
          代练类型管理
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加类型
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <div class="search-form">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="关键词">
              <el-input
                v-model="searchForm.keyword"
                placeholder="类型名称/描述"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select
                v-model="searchForm.status"
                placeholder="全部状态"
                clearable
                style="width: 130px"
              >
                <el-option label="启用" value="active" />
                <el-option label="禁用" value="inactive" />
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

        <div class="stats-overview">
          <div class="stat-item">
            <div class="stat-icon total">
              <el-icon><Menu /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">类型总数</div>
              <div class="stat-value">{{ stats.totalCategories }}</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon active">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">已启用</div>
              <div class="stat-value">{{ stats.activeCategories }}</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon game">
              <el-icon><VideoPlay /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">关联游戏</div>
              <div class="stat-value">{{ stats.totalGames }}</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon order">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">总订单数</div>
              <div class="stat-value">{{ totalOrderCount }}</div>
            </div>
          </div>
        </div>

        <el-table
          v-loading="loading"
          :data="tableData"
          stripe
          style="width: 100%"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="icon" label="图标" width="80">
            <template #default="{ row }">
              <span class="category-icon">{{ row.icon }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="类型名称" min-width="150">
            <template #default="{ row }">
              <div class="category-name-info">
                <span class="category-name">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
          <el-table-column prop="gameCount" label="关联游戏" width="100">
            <template #default="{ row }">
              <span class="count-text">{{ row.gameCount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="orderCount" label="订单数量" width="100">
            <template #default="{ row }">
              <span class="count-text">{{ row.orderCount.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                {{ row.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="80">
            <template #default="{ row }">
              <span class="sort-text">{{ row.sort }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="170" />
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button 
                :type="row.status === 'active' ? 'warning' : 'success'"
                link 
                size="small"
                @click="handleToggleStatus(row)"
              >
                <el-icon><SwitchButton /></el-icon>
                {{ row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
              <el-button 
                type="danger" 
                link 
                size="small"
                @click="handleDelete(row)"
              >
                <el-icon><Delete /></el-icon>
                删除
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
      v-model="showDialog"
      :title="isEdit ? '编辑代练类型' : '添加代练类型'"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="类型名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入类型名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="图标" prop="icon">
              <el-select v-model="form.icon" placeholder="选择图标" style="width: 100%">
                <el-option label="🏆" value="🏆" />
                <el-option label="⚡" value="⚡" />
                <el-option label="🌟" value="🌟" />
                <el-option label="💰" value="💰" />
                <el-option label="🎯" value="🎯" />
                <el-option label="🎁" value="🎁" />
                <el-option label="📊" value="📊" />
                <el-option label="📈" value="📈" />
                <el-option label="💀" value="💀" />
                <el-option label="🏃" value="🏃" />
                <el-option label="📚" value="📚" />
                <el-option label="🌌" value="🌌" />
                <el-option label="🧱" value="🧱" />
                <el-option label="✅" value="✅" />
                <el-option label="🎰" value="🎰" />
                <el-option label="⚔️" value="⚔️" />
                <el-option label="🎖️" value="🎖️" />
                <el-option label="🏛️" value="🏛️" />
                <el-option label="🏔️" value="🏔️" />
                <el-option label="🎫" value="🎫" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入类型描述"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="启用" value="active" />
                <el-option label="禁用" value="inactive" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getCategoryList, 
  getGameStats,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  mockCategoryList
} from '@/api/game'

const loading = ref(false)
const tableData = ref([])
const showDialog = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const stats = reactive({
  totalCategories: 0,
  activeCategories: 0,
  totalGames: 0
})

const totalOrderCount = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.orderCount, 0).toLocaleString()
})

const searchForm = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  id: null,
  name: '',
  icon: '🏆',
  description: '',
  status: 'active',
  sort: 1
})

const rules = {
  name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
  icon: [{ required: true, message: '请选择图标', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCategoryList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      status: searchForm.status
    })
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('Failed to fetch category list:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const res = await getGameStats()
    if (res.code === 200) {
      stats.totalCategories = res.data.totalCategories
      stats.activeCategories = res.data.activeCategories
      stats.totalGames = res.data.totalGames
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
  Object.assign(form, {
    id: null,
    name: '',
    icon: '🏆',
    description: '',
    status: 'active',
    sort: tableData.value.length + 1
  })
  showDialog.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    name: row.name,
    icon: row.icon,
    description: row.description,
    status: row.status,
    sort: row.sort
  })
  showDialog.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除代练类型"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteCategory(row.id)
      if (res.code === 200) {
        ElMessage.success(res.message)
        fetchData()
        fetchStats()
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const handleToggleStatus = async (row) => {
  const newStatus = row.status === 'active' ? 'inactive' : 'active'
  try {
    const res = await toggleCategoryStatus({
      id: row.id,
      status: newStatus
    })
    if (res.code === 200) {
      ElMessage.success(res.message)
      fetchData()
      fetchStats()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (isEdit.value) {
      const res = await updateCategory({ ...form })
      if (res.code === 200) {
        ElMessage.success(res.message)
        showDialog.value = false
        fetchData()
        fetchStats()
      }
    } else {
      const res = await createCategory({ ...form })
      if (res.code === 200) {
        ElMessage.success(res.message)
        showDialog.value = false
        fetchData()
        fetchStats()
      }
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    }
  }
}

onMounted(() => {
  fetchData()
  fetchStats()
})
</script>

<style lang="scss" scoped>
.category-list-container {
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
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #fff;

      &.total {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.active {
        background: linear-gradient(135deg, #67C23A 0%, #5aae32 100%);
      }

      &.game {
        background: linear-gradient(135deg, #409EFF 0%, #3078c7 100%);
      }

      &.order {
        background: linear-gradient(135deg, #E6A23C 0%, #cf9235 100%);
      }
    }

    .stat-content {
      .stat-label {
        font-size: 13px;
        color: var(--text-muted);
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 18px;
        font-weight: 700;
        color: var(--text-primary);
      }
    }
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .category-icon {
    font-size: 28px;
  }

  .category-name-info {
    .category-name {
      font-weight: 500;
      color: var(--text-primary);
    }
  }

  .count-text {
    font-weight: 500;
    color: var(--text-primary);
  }

  .sort-text {
    color: var(--text-muted);
    font-family: monospace;
  }
}
</style>
