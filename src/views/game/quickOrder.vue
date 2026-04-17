<template>
  <div class="quick-order-container fade-in">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <el-icon class="icon"><Plus /></el-icon>
          快速下单
        </div>
      </div>
      <div class="card-body">
        <el-steps :active="currentStep" align-center class="order-steps">
          <el-step title="选择游戏" :icon="VideoPlay" />
          <el-step title="选择代练类型" :icon="Menu" />
          <el-step title="填写订单信息" :icon="Edit" />
          <el-step title="确认并提交" :icon="CircleCheck" />
        </el-steps>

        <div v-if="currentStep === 0" class="step-content">
          <div class="section-title">
            <el-icon><VideoPlay /></el-icon>
            选择游戏
          </div>
          <div class="game-grid">
            <div
              v-for="game in gameList"
              :key="game.id"
              class="game-card"
              :class="{ active: selectedGame?.id === game.id }"
              @click="selectGame(game)"
            >
              <span class="game-icon">{{ game.icon }}</span>
              <span class="game-name">{{ game.name }}</span>
              <div class="game-tags">
                <el-tag v-if="game.hot" type="danger" size="small" effect="light">热门</el-tag>
                <el-tag v-if="game.recommend" type="warning" size="small" effect="light">推荐</el-tag>
              </div>
            </div>
          </div>

          <div class="section-title mt-32">
            <el-icon><Star /></el-icon>
            热门快速下单套餐
          </div>
          <div class="template-grid">
            <div
              v-for="template in quickOrderTemplates"
              :key="template.id"
              class="template-card"
              @click="selectTemplate(template)"
            >
              <div class="template-header">
                <span class="template-icon">{{ getGameIcon(template.gameId) }}</span>
                <div class="template-info">
                  <span class="template-name">{{ template.name }}</span>
                  <span class="template-category">{{ template.categoryName }}</span>
                </div>
              </div>
              <div class="template-desc">{{ template.description }}</div>
              <div class="template-footer">
                <div class="template-price">
                  <span class="price-label">预估价格</span>
                  <span class="price-value">¥{{ template.estimatedAmount }}</span>
                </div>
                <div class="template-time">
                  <el-icon><Clock /></el-icon>
                  {{ template.estimatedTime }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentStep === 1" class="step-content">
          <div class="selected-game-info">
            <span class="selected-icon">{{ selectedGame.icon }}</span>
            <div class="selected-info">
              <span class="selected-name">{{ selectedGame.name }}</span>
              <span class="selected-desc">{{ selectedGame.description }}</span>
            </div>
            <el-button type="primary" link @click="backToStep(0)">更换游戏</el-button>
          </div>

          <div class="section-title">
            <el-icon><Menu /></el-icon>
            选择代练类型
          </div>
          <div class="category-grid">
            <div
              v-for="category in categoryList"
              :key="category.id"
              class="category-card"
              :class="{ active: selectedCategory?.id === category.id }"
              @click="selectCategory(category)"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
              <span class="category-desc">{{ category.description }}</span>
            </div>
          </div>

          <div v-if="selectedGame.ranks && selectedGame.ranks.length > 0 && selectedCategory" class="rank-section">
            <div class="section-title">
              <el-icon><Trophy /></el-icon>
              选择段位
            </div>
            <div class="rank-selector">
              <div class="rank-group">
                <span class="rank-label">当前段位</span>
                <el-select v-model="currentRank" placeholder="请选择" style="width: 200px">
                  <el-option
                    v-for="rank in selectedGame.ranks.slice(0, -1)"
                    :key="rank.id"
                    :label="rank.name"
                    :value="rank.name"
                  />
                </el-select>
              </div>
              <div class="rank-arrow">
                <el-icon><ArrowRight /></el-icon>
              </div>
              <div class="rank-group">
                <span class="rank-label">目标段位</span>
                <el-select v-model="targetRank" placeholder="请选择" style="width: 200px">
                  <el-option
                    v-for="rank in selectedGame.ranks"
                    :key="rank.id"
                    :label="rank.name"
                    :value="rank.name"
                    :disabled="currentRank && getRankIndex(rank.name) <= getRankIndex(currentRank)"
                  />
                </el-select>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentStep === 2" class="step-content">
          <div class="order-summary-bar">
            <div class="summary-item">
              <span class="summary-label">游戏</span>
              <span class="summary-value">{{ selectedGame?.name }}</span>
            </div>
            <div class="summary-divider">/</div>
            <div class="summary-item">
              <span class="summary-label">代练类型</span>
              <span class="summary-value">{{ selectedCategory?.name }}</span>
            </div>
            <div v-if="currentRank && targetRank" class="summary-divider">/</div>
            <div v-if="currentRank && targetRank" class="summary-item">
              <span class="summary-label">段位</span>
              <span class="summary-value">{{ currentRank }} → {{ targetRank }}</span>
            </div>
            <el-button type="primary" link @click="backToStep(1)">修改</el-button>
          </div>

          <el-form :model="orderForm" :rules="orderRules" ref="orderFormRef" label-width="120px" class="order-form">
            <div class="section-title">
              <el-icon><User /></el-icon>
              账号信息
            </div>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="游戏账号" prop="gameAccount">
                  <el-input v-model="orderForm.gameAccount" placeholder="请输入游戏账号" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="游戏密码" prop="gamePassword">
                  <el-input v-model="orderForm.gamePassword" type="password" placeholder="请输入游戏密码" show-password />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="游戏区服" prop="server">
                  <el-input v-model="orderForm.server" placeholder="请输入游戏区服" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="角色名称" prop="roleName">
                  <el-input v-model="orderForm.roleName" placeholder="请输入角色名称" />
                </el-form-item>
              </el-col>
            </el-row>

            <div class="section-title mt-32">
              <el-icon><Coin /></el-icon>
              价格与赏金
            </div>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="代练价格" prop="price">
                  <el-input-number v-model="orderForm.price" :min="0" :precision="2" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="打手赏金" prop="playerAmount">
                  <el-input-number v-model="orderForm.playerAmount" :min="0" :precision="2" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="保证金" prop="deposit">
                  <el-input-number v-model="orderForm.deposit" :min="0" :precision="2" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="服务费" prop="serviceFee">
                  <el-input-number v-model="orderForm.serviceFee" :min="0" :precision="2" disabled style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>

            <div class="section-title mt-32">
              <el-icon><Clock /></el-icon>
              代练要求
            </div>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="要求完成时间" prop="deadline">
                  <el-date-picker
                    v-model="orderForm.deadline"
                    type="datetime"
                    placeholder="请选择完成时间"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="接单截止时间" prop="acceptDeadline">
                  <el-date-picker
                    v-model="orderForm.acceptDeadline"
                    type="datetime"
                    placeholder="请选择接单截止时间"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="特殊要求" prop="requirements">
              <el-input
                v-model="orderForm.requirements"
                type="textarea"
                :rows="4"
                placeholder="请输入其他特殊要求，如：禁止使用金币、禁止打排位等"
              />
            </el-form-item>
          </el-form>
        </div>

        <div v-if="currentStep === 3" class="step-content">
          <div class="order-preview">
            <div class="section-title">
              <el-icon><Document /></el-icon>
              订单信息确认
            </div>
            
            <el-descriptions :column="2" border class="preview-table">
              <el-descriptions-item label="游戏名称">
                <span class="preview-value">{{ selectedGame?.name }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="代练类型">
                <span class="preview-value">{{ selectedCategory?.name }}</span>
              </el-descriptions-item>
              <el-descriptions-item v-if="currentRank && targetRank" label="段位要求">
                <span class="preview-value">{{ currentRank }} → {{ targetRank }}</span>
              </el-descriptions-item>
              <el-descriptions-item v-else label="段位要求">
                <span class="preview-value">无</span>
              </el-descriptions-item>
              <el-descriptions-item label="游戏账号">
                <span class="preview-value">{{ orderForm.gameAccount }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="游戏区服">
                <span class="preview-value">{{ orderForm.server || '未填写' }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="代练价格">
                <span class="preview-value price">¥{{ orderForm.price }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="打手赏金">
                <span class="preview-value">¥{{ orderForm.playerAmount }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="保证金">
                <span class="preview-value">¥{{ orderForm.deposit }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="服务费">
                <span class="preview-value">¥{{ orderForm.serviceFee }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="要求完成时间">
                <span class="preview-value">{{ formatDate(orderForm.deadline) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="接单截止时间">
                <span class="preview-value">{{ formatDate(orderForm.acceptDeadline) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="特殊要求" :span="2">
                <span class="preview-value">{{ orderForm.requirements || '无' }}</span>
              </el-descriptions-item>
            </el-descriptions>

            <div class="total-price-section">
              <div class="total-info">
                <span class="total-label">订单总价</span>
                <span class="total-price">¥{{ orderForm.price }}</span>
              </div>
              <el-button type="primary" link @click="backToStep(2)">修改订单信息</el-button>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <el-button v-if="currentStep > 0" @click="backToStep(currentStep - 1)">
            <el-icon><ArrowLeft /></el-icon>
            上一步
          </el-button>
          <el-button
            v-if="currentStep < 3"
            type="primary"
            :disabled="!canProceed"
            @click="nextStep"
          >
            下一步
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button
            v-if="currentStep === 3"
            type="primary"
            :loading="submitting"
            @click="submitOrder"
          >
            <el-icon><CircleCheck /></el-icon>
            提交订单
          </el-button>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="showSuccessDialog"
      title="订单创建成功"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="success-dialog">
        <el-icon :size="64" class="success-icon"><CircleCheckFilled /></el-icon>
        <p class="success-text">订单已成功创建！</p>
        <div class="order-no">
          <span>订单编号：</span>
          <span class="order-no-value">{{ createdOrderNo }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="resetForm">继续下单</el-button>
        <el-button type="primary" @click="goToOrderList">查看订单</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getAllGames,
  getAllCategories,
  getQuickOrderTemplates,
  calculateQuickOrderPrice,
  submitQuickOrder
} from '@/api/game'
import { mockGameList } from '@/api/game'

const router = useRouter()

const currentStep = ref(0)
const submitting = ref(false)
const showSuccessDialog = ref(false)
const createdOrderNo = ref('')
const orderFormRef = ref(null)

const gameList = ref([])
const categoryList = ref([])
const quickOrderTemplates = ref([])

const selectedGame = ref(null)
const selectedCategory = ref(null)
const currentRank = ref('')
const targetRank = ref('')

const orderForm = reactive({
  gameAccount: '',
  gamePassword: '',
  server: '',
  roleName: '',
  price: 0,
  playerAmount: 0,
  deposit: 0,
  serviceFee: 0,
  deadline: null,
  acceptDeadline: null,
  requirements: ''
})

const orderRules = {
  gameAccount: [{ required: true, message: '请输入游戏账号', trigger: 'blur' }],
  gamePassword: [{ required: true, message: '请输入游戏密码', trigger: 'blur' }],
  price: [{ required: true, message: '请输入代练价格', trigger: 'blur' }]
}

const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return selectedGame.value !== null
  }
  if (currentStep.value === 1) {
    if (!selectedCategory.value) return false
    if (selectedGame.value?.ranks?.length > 0) {
      return currentRank.value && targetRank.value && getRankIndex(targetRank.value) > getRankIndex(currentRank.value)
    }
    return true
  }
  if (currentStep.value === 2) {
    return true
  }
  return false
})

const getRankIndex = (rankName) => {
  if (!selectedGame.value?.ranks) return -1
  return selectedGame.value.ranks.findIndex(r => r.name === rankName)
}

const getGameIcon = (gameId) => {
  const game = mockGameList.find(g => g.id === gameId)
  return game?.icon || '🎮'
}

const formatDate = (date) => {
  if (!date) return '未设置'
  return date.toLocaleString('zh-CN')
}

const fetchInitialData = async () => {
  try {
    const [gamesRes, categoriesRes, templatesRes] = await Promise.all([
      getAllGames(),
      getAllCategories(),
      getQuickOrderTemplates()
    ])
    if (gamesRes.code === 200) {
      gameList.value = gamesRes.data
    }
    if (categoriesRes.code === 200) {
      categoryList.value = categoriesRes.data
    }
    if (templatesRes.code === 200) {
      quickOrderTemplates.value = templatesRes.data
    }
  } catch (error) {
    console.error('Failed to fetch initial data:', error)
  }
}

const selectGame = (game) => {
  selectedGame.value = game
}

const selectCategory = (category) => {
  selectedCategory.value = category
  currentRank.value = ''
  targetRank.value = ''
}

const selectTemplate = (template) => {
  const game = gameList.value.find(g => g.id === template.gameId)
  const category = categoryList.value.find(c => c.id === template.categoryId)
  
  if (game) {
    selectedGame.value = game
  }
  if (category) {
    selectedCategory.value = category
  }
  
  currentRank.value = template.currentRank || ''
  targetRank.value = template.targetRank || ''
  orderForm.price = template.estimatedAmount
  orderForm.deposit = Math.floor(template.estimatedAmount * 0.25)
  orderForm.serviceFee = Math.floor(template.estimatedAmount * 0.05)
  orderForm.playerAmount = template.estimatedAmount - orderForm.deposit - orderForm.serviceFee
  
  currentStep.value = 1
}

const nextStep = async () => {
  if (currentStep.value === 1) {
    if (selectedGame.value && selectedCategory.value) {
      try {
        const res = await calculateQuickOrderPrice({
          gameId: selectedGame.value.id,
          categoryId: selectedCategory.value.id,
          currentRank: currentRank.value,
          targetRank: targetRank.value
        })
        if (res.code === 200) {
          orderForm.price = res.data.basePrice
          orderForm.deposit = res.data.deposit
          orderForm.serviceFee = res.data.serviceFee
          orderForm.playerAmount = res.data.playerAmount
        }
      } catch (error) {
        console.error('Failed to calculate price:', error)
      }
    }
  }
  
  if (currentStep.value === 2) {
    if (!orderFormRef.value) return
    try {
      await orderFormRef.value.validate()
    } catch (error) {
      return
    }
  }
  
  currentStep.value++
}

const backToStep = (step) => {
  currentStep.value = step
}

const submitOrder = async () => {
  submitting.value = true
  try {
    const res = await submitQuickOrder({
      gameId: selectedGame.value.id,
      categoryId: selectedCategory.value.id,
      currentRank: currentRank.value,
      targetRank: targetRank.value,
      ...orderForm
    })
    if (res.code === 200) {
      createdOrderNo.value = res.data.orderNo
      showSuccessDialog.value = true
    }
  } catch (error) {
    ElMessage.error('订单创建失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  currentStep.value = 0
  selectedGame.value = null
  selectedCategory.value = null
  currentRank.value = ''
  targetRank.value = ''
  Object.assign(orderForm, {
    gameAccount: '',
    gamePassword: '',
    server: '',
    roleName: '',
    price: 0,
    playerAmount: 0,
    deposit: 0,
    serviceFee: 0,
    deadline: null,
    acceptDeadline: null,
    requirements: ''
  })
  showSuccessDialog.value = false
}

const goToOrderList = () => {
  router.push('/order/list')
}

watch(orderForm.price, (newPrice) => {
  if (newPrice > 0) {
    orderForm.deposit = Math.floor(newPrice * 0.25)
    orderForm.serviceFee = Math.floor(newPrice * 0.05)
    orderForm.playerAmount = newPrice - orderForm.deposit - orderForm.serviceFee
  }
})

onMounted(() => {
  fetchInitialData()
})
</script>

<style lang="scss" scoped>
.quick-order-container {
  .order-steps {
    margin-bottom: 40px;
    padding: 20px 0;
  }

  .step-content {
    min-height: 400px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
    
    &.mt-32 {
      margin-top: 32px;
    }
  }

  .game-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  .game-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 24px 16px;
    background: var(--bg-secondary);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    &.active {
      border-color: var(--accent-cyan);
      background: linear-gradient(135deg, rgba(102, 197, 204, 0.1) 0%, rgba(120, 119, 198, 0.1) 100%);
    }

    .game-icon {
      font-size: 40px;
    }

    .game-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .game-tags {
      display: flex;
      gap: 4px;
    }
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }

  .template-card {
    padding: 20px;
    background: var(--bg-secondary);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      border-color: var(--accent-purple);
    }

    .template-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .template-icon {
      font-size: 32px;
    }

    .template-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .template-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .template-category {
      font-size: 12px;
      color: var(--text-muted);
    }

    .template-desc {
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color);
    }

    .template-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .template-price {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .price-label {
      font-size: 12px;
      color: var(--text-muted);
    }

    .price-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--accent-orange);
    }

    .template-time {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--text-secondary);
    }
  }

  .selected-game-info {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: linear-gradient(90deg, rgba(102, 197, 204, 0.1) 0%, rgba(120, 119, 198, 0.1) 100%);
    border-radius: 8px;
    margin-bottom: 24px;
  }

  .selected-icon {
    font-size: 36px;
  }

  .selected-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .selected-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .selected-desc {
    font-size: 13px;
    color: var(--text-muted);
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .category-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px 16px;
    background: var(--bg-secondary);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    &.active {
      border-color: var(--accent-cyan);
      background: linear-gradient(135deg, rgba(102, 197, 204, 0.1) 0%, rgba(120, 119, 198, 0.1) 100%);
    }

    .category-icon {
      font-size: 36px;
    }

    .category-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .category-desc {
      font-size: 12px;
      color: var(--text-muted);
      text-align: center;
    }
  }

  .rank-section {
    margin-top: 32px;
  }

  .rank-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    padding: 24px;
    background: var(--bg-secondary);
    border-radius: 12px;
  }

  .rank-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rank-label {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .rank-arrow {
    font-size: 24px;
    color: var(--accent-cyan);
    margin-top: 20px;
  }

  .order-summary-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: linear-gradient(90deg, rgba(102, 197, 204, 0.1) 0%, rgba(120, 119, 198, 0.1) 100%);
    border-radius: 8px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .summary-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .summary-label {
    font-size: 13px;
    color: var(--text-muted);
  }

  .summary-value {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .summary-divider {
    color: var(--border-color);
  }

  .order-form {
    max-width: 800px;
  }

  .order-preview {
    max-width: 900px;
    margin: 0 auto;
  }

  .preview-table {
    margin-bottom: 24px;
  }

  .preview-value {
    font-weight: 500;
    color: var(--text-primary);
    
    &.price {
      color: var(--accent-orange);
      font-size: 16px;
    }
  }

  .total-price-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: var(--bg-secondary);
    border-radius: 12px;
  }

  .total-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .total-label {
    font-size: 15px;
    color: var(--text-secondary);
  }

  .total-price {
    font-size: 28px;
    font-weight: 700;
    color: var(--accent-orange);
  }

  .step-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid var(--border-color);
  }

  .success-dialog {
    text-align: center;
    padding: 20px 0;
  }

  .success-icon {
    color: var(--accent-green);
    margin-bottom: 16px;
  }

  .success-text {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
  }

  .order-no {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .order-no-value {
    font-weight: 600;
    color: var(--accent-cyan);
    font-family: monospace;
  }
}
</style>
