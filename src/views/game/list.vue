<template>
  <div class="game-list-container fade-in">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <el-icon class="icon"><VideoPlay /></el-icon>
          游戏分类管理
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加游戏
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <div class="search-form">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="关键词">
              <el-input
                v-model="searchForm.keyword"
                placeholder="游戏名称/描述"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="游戏类型">
              <el-select
                v-model="searchForm.category"
                placeholder="全部类型"
                clearable
                style="width: 150px"
              >
                <el-option 
                  v-for="(item, key) in mockGameCategoryMap" 
                  :key="key" 
                  :label="item.label" 
                  :value="key" 
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select
                v-model="searchForm.status"
                placeholder="全部状态"
                clearable
                style="width: 130px"
              >
                <el-option 
                  v-for="(item, key) in mockGameStatusMap" 
                  :key="key" 
                  :label="item.label" 
                  :value="key" 
                />
              </el-select>
            </el-form-item>
            <el-form-item label="热门">
              <el-select
                v-model="searchForm.hot"
                placeholder="全部"
                clearable
                style="width: 120px"
              >
                <el-option label="是" value="true" />
                <el-option label="否" value="false" />
              </el-select>
            </el-form-item>
            <el-form-item label="推荐">
              <el-select
                v-model="searchForm.recommend"
                placeholder="全部"
                clearable
                style="width: 120px"
              >
                <el-option label="是" value="true" />
                <el-option label="否" value="false" />
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
              <el-icon><VideoPlay /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">游戏总数</div>
              <div class="stat-value">{{ stats.totalGames }}</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon active">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">已启用</div>
              <div class="stat-value">{{ stats.activeGames }}</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon hot">
              <el-icon><Fire /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">今日订单</div>
              <div class="stat-value">{{ stats.todayOrders }}</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon order">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">今日金额</div>
              <div class="stat-value">¥{{ stats.todayAmount }}</div>
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
              <span class="game-icon">{{ row.icon }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="游戏名称" min-width="150">
            <template #default="{ row }">
              <div class="game-name-info">
                <span class="game-name">{{ row.name }}</span>
                <div class="game-tags">
                  <el-tag v-if="row.hot" type="danger" size="small" effect="light">热门</el-tag>
                  <el-tag v-if="row.recommend" type="warning" size="small" effect="light">推荐</el-tag>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="category" label="游戏类型" width="120">
            <template #default="{ row }">
              <el-tag size="small">
                {{ mockGameCategoryMap[row.category]?.label || row.category }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
          <el-table-column prop="playerCount" label="打手数量" width="100">
            <template #default="{ row }">
              <span class="count-text">{{ row.playerCount.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="orderCount" label="订单数量" width="100">
            <template #default="{ row }">
              <span class="count-text">{{ row.orderCount.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="mockGameStatusMap[row.status]?.type" size="small">
                {{ mockGameStatusMap[row.status]?.label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="80">
            <template #default="{ row }">
              <span class="sort-text">{{ row.sort }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="170" />
          <el-table-column label="操作" fixed="right" width="260">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button 
                :type="row.hot ? 'success' : 'info'" 
                link 
                size="small"
                @click="handleToggleHot(row)"
              >
                <el-icon><Fire /></el-icon>
                {{ row.hot ? '取消热门' : '设为热门' }}
              </el-button>
              <el-button 
                :type="row.recommend ? 'success' : 'info'" 
                link 
                size="small"
                @click="handleToggleRecommend(row)"
              >
                <el-icon><Star /></el-icon>
                {{ row.recommend ? '取消推荐' : '设为推荐' }}
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
      :title="isEdit ? '编辑游戏' : '添加游戏'"
      width="700px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="游戏名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入游戏名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="游戏图标" prop="icon">
              <el-select v-model="form.icon" placeholder="选择图标" style="width: 100%">
                <el-option label="🎮" value="🎮" />
                <el-option label="⚔️" value="⚔️" />
                <el-option label="🔫" value="🔫" />
                <el-option label="✨" value="✨" />
                <el-option label="💥" value="💥" />
                <el-option label="🚀" value="🚀" />
                <el-option label="📱" value="📱" />
                <el-option label="🪖" value="🪖" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="游戏类型" prop="category">
              <el-select v-model="form.category" placeholder="请选择游戏类型" style="width: 100%">
                <el-option 
                  v-for="(item, key) in mockGameCategoryMap" 
                  :key="key" 
                  :label="item.label" 
                  :value="key" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                <el-option 
                  v-for="(item, key) in mockGameStatusMap" 
                  :key="key" 
                  :label="item.label" 
                  :value="key" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入游戏描述"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="热门推荐">
              <el-switch v-model="form.hot" active-text="是" inactive-text="否" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="首页推荐">
              <el-switch v-model="form.recommend" active-text="是" inactive-text="否" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getGameList, 
  getGameStats,
  createGame,
  updateGame,
  deleteGame,
  toggleGameHot,
  toggleGameRecommend,
  mockGameStatusMap, 
  mockGameCategoryMap 
} from '@/api/game'

const loading = ref(false)
const tableData = ref([])
const showDialog = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const stats = reactive({
  totalGames: 0,
  activeGames: 0,
  todayOrders: 0,
  todayAmount: 0
})

const searchForm = reactive({
  keyword: '',
  category: '',
  status: '',
  hot: '',
  recommend: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  id: null,
  name: '',
  icon: '🎮',
  category: 'MOBA',
  description: '',
  status: 'active',
  sort: 1,
  hot: false,
  recommend: false
})

const rules = {
  name: [{ required: true, message: '请输入游戏名称', trigger: 'blur' }],
  icon: [{ required: true, message: '请选择游戏图标', trigger: 'change' }],
  category: [{ required: true, message: '请选择游戏类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getGameList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      category: searchForm.category,
      status: searchForm.status,
      hot: searchForm.hot,
      recommend: searchForm.recommend
    })
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('Failed to fetch game list:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const res = await getGameStats()
    if (res.code === 200) {
      Object.assign(stats, res.data)
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
  searchForm.category = ''
  searchForm.status = ''
  searchForm.hot = ''
  searchForm.recommend = ''
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
    icon: '🎮',
    category: 'MOBA',
    description: '',
    status: 'active',
    sort: tableData.value.length + 1,
    hot: false,
    recommend: false
  })
  showDialog.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    name: row.name,
    icon: row.icon,
    category: row.category,
    description: row.description,
    status: row.status,
    sort: row.sort,
    hot: row.hot,
    recommend: row.recommend
  })
  showDialog.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除游戏"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteGame(row.id)
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

const handleToggleHot = async (row) => {
  try {
    const res = await toggleGameHot({
      id: row.id,
      hot: !row.hot
    })
    if (res.code === 200) {
      ElMessage.success(res.message)
      fetchData()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleToggleRecommend = async (row) => {
  try {
    const res = await toggleGameRecommend({
      id: row.id,
      recommend: !row.recommend
    })
    if (res.code === 200) {
      ElMessage.success(res.message)
      fetchData()
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
      const res = await updateGame({ ...form })
      if (res.code === 200) {
        ElMessage.success(res.message)
        showDialog.value = false
        fetchData()
        fetchStats()
      }
    } else {
      const res = await createGame({ ...form })
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
.game-list-container {
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

      &.hot {
        background: linear-gradient(135deg, #F56C6C 0%, #db5a5a 100%);
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

  .game-icon {
    font-size: 28px;
  }

  .game-name-info {
    .game-name {
      font-weight: 500;
      color: var(--text-primary);
      display: block;
    }

    .game-tags {
      display: flex;
      gap: 4px;
      margin-top: 4px;
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
