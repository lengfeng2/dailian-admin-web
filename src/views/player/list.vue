<template>
  <div class="player-list-container fade-in">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <el-icon class="icon"><List /></el-icon>
          打手列表
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增打手
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
            <el-form-item label="状态">
              <el-select
                v-model="searchForm.status"
                placeholder="全部状态"
                clearable
                style="width: 150px"
              >
                <el-option label="正常" value="active" />
                <el-option label="审核中" value="review" />
                <el-option label="冻结" value="frozen" />
              </el-select>
            </el-form-item>
            <el-form-item label="等级">
              <el-select
                v-model="searchForm.level"
                placeholder="全部等级"
                clearable
                style="width: 150px"
              >
                <el-option label="黄金" value="gold" />
                <el-option label="铂金" value="platinum" />
                <el-option label="钻石" value="diamond" />
                <el-option label="大师" value="master" />
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
          <el-table-column prop="nickname" label="昵称" width="160" />
          <el-table-column prop="realName" label="真实姓名" width="100" />
          <el-table-column prop="phone" label="手机号" width="140" />
          <el-table-column prop="games" label="擅长游戏" min-width="180">
            <template #default="{ row }">
              <div class="games-tags">
                <el-tag 
                  v-for="(game, index) in row.games.slice(0, 3)" 
                  :key="index" 
                  size="small" 
                  type="info"
                >
                  {{ game }}
                </el-tag>
                <span v-if="row.games.length > 3" class="more-games">
                  +{{ row.games.length - 3 }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="level" label="等级" width="100">
            <template #default="{ row }">
              <el-tag :type="getLevelType(row.level)" size="small">
                {{ getLevelName(row.level) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="rating" label="评分" width="100">
            <template #default="{ row }">
              <div class="rating">
                <el-rate 
                  v-model="row.rating" 
                  disabled 
                  :max="5" 
                  :show-text="false"
                  :colors="['#FFD700', '#FFD700', '#FFD700']"
                />
                <span class="rating-value">{{ row.rating }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="completedCount" label="完成单量" width="100" />
          <el-table-column prop="totalEarnings" label="总收入" width="120">
            <template #default="{ row }">
              <span class="earnings">¥{{ row.totalEarnings.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusName(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="220">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleView(row)">
                <el-icon><View /></el-icon>
                详情
              </el-button>
              <el-button type="primary" link size="small" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button 
                v-if="row.status === 'review'"
                type="primary" 
                link 
                size="small"
                @click="handleVerify(row)"
              >
                <el-icon><CircleCheck /></el-icon>
                审核
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
      width="700px"
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
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="等级" prop="level">
          <el-select v-model="form.level" placeholder="请选择等级" style="width: 100%">
            <el-option label="黄金" value="gold" />
            <el-option label="铂金" value="platinum" />
            <el-option label="钻石" value="diamond" />
            <el-option label="大师" value="master" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="active">正常</el-radio>
            <el-radio value="review">审核中</el-radio>
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

    <el-dialog
      v-model="verifyDialogVisible"
      title="打手审核"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border v-if="currentPlayer.id">
        <el-descriptions-item label="用户名">{{ currentPlayer.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentPlayer.nickname }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{ currentPlayer.realName }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentPlayer.phone }}</el-descriptions-item>
        <el-descriptions-item label="擅长游戏">
          <el-tag 
            v-for="(game, index) in currentPlayer.games" 
            :key="index" 
            size="small" 
            style="margin-right: 5px"
          >
            {{ game }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <el-form label-width="100px" style="margin-top: 20px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="verifyResult">
            <el-radio value="pass">通过</el-radio>
            <el-radio value="reject">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="verifyRemark" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入审核备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="verifyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitVerify">
          提交审核
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPlayerList, updatePlayer, verifyPlayer } from '@/api/player'

const router = useRouter()
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const verifyDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const tableData = ref([])
const currentPlayer = ref({})
const verifyResult = ref('pass')
const verifyRemark = ref('')

const searchForm = reactive({
  keyword: '',
  status: '',
  level: ''
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
  realName: '',
  phone: '',
  email: '',
  password: '',
  level: 'gold',
  status: 'active'
})

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择等级', trigger: 'change' }
  ]
}

const dialogTitle = computed(() => isEdit.value ? '编辑打手' : '新增打手')

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

const getLevelName = (level) => levelMap[level]?.name || level
const getLevelType = (level) => levelMap[level]?.type || 'info'
const getStatusName = (status) => statusMap[status]?.name || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getPlayerList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      status: searchForm.status,
      level: searchForm.level
    })
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('Failed to fetch player list:', error)
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
  searchForm.level = ''
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
  form.nickname = ''
  form.realName = ''
  form.phone = ''
  form.email = ''
  form.password = ''
  form.level = 'gold'
  form.status = 'active'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  form.id = row.id
  form.username = row.username
  form.nickname = row.nickname
  form.realName = row.realName
  form.phone = row.phone
  form.email = row.email
  form.level = row.level
  form.status = row.status
  dialogVisible.value = true
}

const handleView = (row) => {
  router.push(`/player/detail/${row.id}`)
}

const handleVerify = (row) => {
  currentPlayer.value = row
  verifyResult.value = 'pass'
  verifyRemark.value = ''
  verifyDialogVisible.value = true
}

const submitVerify = async () => {
  try {
    const res = await verifyPlayer({
      id: currentPlayer.value.id,
      passed: verifyResult.value === 'pass',
      remark: verifyRemark.value
    })
    if (res.code === 200) {
      ElMessage.success(verifyResult.value === 'pass' ? '审核通过' : '审核已拒绝')
      verifyDialogVisible.value = false
      fetchData()
    }
  } catch (error) {
    ElMessage.error('审核失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const res = await updatePlayer(form)
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
.player-list-container {
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

  .games-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;

    .more-games {
      font-size: 12px;
      color: var(--text-muted);
    }
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 6px;

    .rating-value {
      font-size: 12px;
      color: var(--accent-orange);
      font-weight: 600;
    }
  }

  .earnings {
    color: var(--accent-orange);
    font-weight: 600;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}
</style>
