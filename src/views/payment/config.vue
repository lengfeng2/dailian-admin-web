<template>
  <div class="payment-config-container fade-in">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <el-icon class="icon"><Setting /></el-icon>
          支付配置管理
        </div>
      </div>
      <div class="card-body">
        <el-tabs v-model="activeTab" type="card">
          <el-tab-pane label="微信支付" name="wechat">
            <div class="config-card">
              <div class="config-header">
                <div class="config-info">
                  <div class="config-icon wechat">
                    <el-icon><ChatDotRound /></el-icon>
                  </div>
                  <div class="config-name">
                    <h3>微信支付</h3>
                    <p class="config-desc">支持微信扫码支付、JSAPI支付、小程序支付等</p>
                  </div>
                </div>
                <div class="config-switch">
                  <el-switch
                    v-model="configs.wechat.enabled"
                    active-text="已启用"
                    inactive-text="已禁用"
                    @change="handleToggleMethod('wechat')"
                  />
                </div>
              </div>

              <el-divider />

              <el-form :model="configs.wechat.config" label-width="140px" class="config-form">
                <el-form-item label="AppID">
                  <el-input v-model="configs.wechat.config.appId" placeholder="请输入微信公众号或小程序AppID" />
                </el-form-item>
                <el-form-item label="商户号">
                  <el-input v-model="configs.wechat.config.mchId" placeholder="请输入微信支付商户号" />
                </el-form-item>
                <el-form-item label="API密钥">
                  <el-input 
                    v-model="configs.wechat.config.apiKey" 
                    type="password"
                    placeholder="请输入API密钥"
                    show-password
                  />
                </el-form-item>
                <el-form-item label="回调地址">
                  <el-input v-model="configs.wechat.config.notifyUrl" placeholder="请输入支付回调地址" />
                </el-form-item>
                <el-form-item label="证书路径">
                  <el-input v-model="configs.wechat.config.certPath" placeholder="请输入证书文件路径" />
                </el-form-item>
              </el-form>

              <el-divider />

              <h4 class="settings-title">支付设置</h4>
              <el-form :model="configs.wechat.settings" label-width="140px" class="config-form">
                <el-form-item label="最小金额">
                  <el-input-number v-model="configs.wechat.settings.minAmount" :min="1" :precision="2" />
                  <span class="unit">元</span>
                </el-form-item>
                <el-form-item label="最大金额">
                  <el-input-number v-model="configs.wechat.settings.maxAmount" :min="1" :precision="2" />
                  <span class="unit">元</span>
                </el-form-item>
                <el-form-item label="手续费率">
                  <el-input-number v-model="configs.wechat.settings.feeRate" :min="0" :max="1" :precision="4" :step="0.001" />
                  <span class="unit">{{ (configs.wechat.settings.feeRate * 100).toFixed(1) }}%</span>
                </el-form-item>
                <el-form-item label="自动退款">
                  <el-switch v-model="configs.wechat.settings.autoRefund" />
                  <span class="help-text">开启后，订单取消时自动发起退款</span>
                </el-form-item>
              </el-form>

              <div class="form-actions">
                <el-button type="primary" @click="handleSaveConfig('wechat')">
                  <el-icon><Check /></el-icon>
                  保存配置
                </el-button>
                <el-button @click="handleResetConfig('wechat')">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="支付宝支付" name="alipay">
            <div class="config-card">
              <div class="config-header">
                <div class="config-info">
                  <div class="config-icon alipay">
                    <el-icon><Wallet /></el-icon>
                  </div>
                  <div class="config-name">
                    <h3>支付宝支付</h3>
                    <p class="config-desc">支持支付宝扫码支付、手机网站支付、APP支付等</p>
                  </div>
                </div>
                <div class="config-switch">
                  <el-switch
                    v-model="configs.alipay.enabled"
                    active-text="已启用"
                    inactive-text="已禁用"
                    @change="handleToggleMethod('alipay')"
                  />
                </div>
              </div>

              <el-divider />

              <el-form :model="configs.alipay.config" label-width="140px" class="config-form">
                <el-form-item label="应用ID">
                  <el-input v-model="configs.alipay.config.appId" placeholder="请输入支付宝应用AppID" />
                </el-form-item>
                <el-form-item label="应用私钥">
                  <el-input 
                    v-model="configs.alipay.config.privateKey" 
                    type="textarea"
                    :rows="3"
                    placeholder="请输入应用私钥"
                  />
                </el-form-item>
                <el-form-item label="支付宝公钥">
                  <el-input 
                    v-model="configs.alipay.config.publicKey" 
                    type="textarea"
                    :rows="3"
                    placeholder="请输入支付宝公钥"
                  />
                </el-form-item>
                <el-form-item label="异步回调地址">
                  <el-input v-model="configs.alipay.config.notifyUrl" placeholder="请输入异步通知回调地址" />
                </el-form-item>
                <el-form-item label="同步返回地址">
                  <el-input v-model="configs.alipay.config.returnUrl" placeholder="请输入同步返回地址" />
                </el-form-item>
              </el-form>

              <el-divider />

              <h4 class="settings-title">支付设置</h4>
              <el-form :model="configs.alipay.settings" label-width="140px" class="config-form">
                <el-form-item label="最小金额">
                  <el-input-number v-model="configs.alipay.settings.minAmount" :min="1" :precision="2" />
                  <span class="unit">元</span>
                </el-form-item>
                <el-form-item label="最大金额">
                  <el-input-number v-model="configs.alipay.settings.maxAmount" :min="1" :precision="2" />
                  <span class="unit">元</span>
                </el-form-item>
                <el-form-item label="手续费率">
                  <el-input-number v-model="configs.alipay.settings.feeRate" :min="0" :max="1" :precision="4" :step="0.001" />
                  <span class="unit">{{ (configs.alipay.settings.feeRate * 100).toFixed(1) }}%</span>
                </el-form-item>
                <el-form-item label="自动退款">
                  <el-switch v-model="configs.alipay.settings.autoRefund" />
                  <span class="help-text">开启后，订单取消时自动发起退款</span>
                </el-form-item>
              </el-form>

              <div class="form-actions">
                <el-button type="primary" @click="handleSaveConfig('alipay')">
                  <el-icon><Check /></el-icon>
                  保存配置
                </el-button>
                <el-button @click="handleResetConfig('alipay')">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="银行转账" name="bank">
            <div class="config-card">
              <div class="config-header">
                <div class="config-info">
                  <div class="config-icon bank">
                    <el-icon><OfficeBuilding /></el-icon>
                  </div>
                  <div class="config-name">
                    <h3>银行转账</h3>
                    <p class="config-desc">支持线下银行转账，人工确认到账</p>
                  </div>
                </div>
                <div class="config-switch">
                  <el-switch
                    v-model="configs.bank.enabled"
                    active-text="已启用"
                    inactive-text="已禁用"
                    @change="handleToggleMethod('bank')"
                  />
                </div>
              </div>

              <el-divider />

              <h4 class="settings-title">收款银行账户</h4>
              <div class="bank-list">
                <div 
                  v-for="(bank, index) in configs.bank.config.banks" 
                  :key="bank.id"
                  class="bank-item"
                >
                  <div class="bank-header">
                    <div class="bank-info">
                      <el-tag :type="bank.enabled ? 'success' : 'info'" size="small">
                        {{ bank.name }}
                      </el-tag>
                      <span class="bank-account">{{ bank.accountNo }}</span>
                    </div>
                    <div class="bank-actions">
                      <el-switch 
                        v-model="bank.enabled" 
                        size="small"
                        @change="handleToggleBank(bank.id)"
                      />
                      <el-button type="primary" link size="small" @click="handleEditBank(index)">
                        <el-icon><Edit /></el-icon>
                        编辑
                      </el-button>
                      <el-button type="danger" link size="small" @click="handleDeleteBank(index)">
                        <el-icon><Delete /></el-icon>
                        删除
                      </el-button>
                    </div>
                  </div>
                  <div class="bank-detail" v-if="bank.enabled">
                    <div class="detail-row">
                      <span class="detail-label">开户名：</span>
                      <span class="detail-value">{{ bank.accountName }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">开户行：</span>
                      <span class="detail-value">{{ bank.branch }}</span>
                    </div>
                  </div>
                </div>

                <el-button type="primary" plain class="add-bank-btn" @click="handleAddBank">
                  <el-icon><Plus /></el-icon>
                  添加银行账户
                </el-button>
              </div>

              <el-divider />

              <h4 class="settings-title">转账设置</h4>
              <el-form :model="configs.bank.settings" label-width="140px" class="config-form">
                <el-form-item label="最小金额">
                  <el-input-number v-model="configs.bank.settings.minAmount" :min="1" :precision="2" />
                  <span class="unit">元</span>
                </el-form-item>
                <el-form-item label="最大金额">
                  <el-input-number v-model="configs.bank.settings.maxAmount" :min="1" :precision="2" />
                  <span class="unit">元</span>
                </el-form-item>
                <el-form-item label="手续费率">
                  <el-input-number v-model="configs.bank.settings.feeRate" :min="0" :max="1" :precision="4" :step="0.001" />
                  <span class="unit">{{ (configs.bank.settings.feeRate * 100).toFixed(1) }}%</span>
                </el-form-item>
                <el-form-item label="自动确认">
                  <el-switch v-model="configs.bank.settings.autoConfirm" />
                  <span class="help-text">开启后，系统自动确认到账（不推荐）</span>
                </el-form-item>
                <el-form-item label="确认时效">
                  <el-input-number v-model="configs.bank.settings.confirmHours" :min="1" :max="168" />
                  <span class="unit">小时内未确认自动取消</span>
                </el-form-item>
              </el-form>

              <div class="form-actions">
                <el-button type="primary" @click="handleSaveConfig('bank')">
                  <el-icon><Check /></el-icon>
                  保存配置
                </el-button>
                <el-button @click="handleResetConfig('bank')">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <el-dialog
      v-model="showBankDialog"
      :title="isEditBank ? '编辑银行账户' : '添加银行账户'"
      width="500px"
    >
      <el-form :model="bankForm" label-width="100px">
        <el-form-item label="银行名称">
          <el-select v-model="bankForm.id" placeholder="请选择银行" style="width: 100%">
            <el-option label="工商银行" value="ICBC" />
            <el-option label="农业银行" value="ABC" />
            <el-option label="建设银行" value="CCB" />
            <el-option label="中国银行" value="BOC" />
            <el-option label="交通银行" value="BOCOM" />
            <el-option label="招商银行" value="CMB" />
            <el-option label="浦发银行" value="SPDB" />
            <el-option label="民生银行" value="CMSB" />
          </el-select>
        </el-form-item>
        <el-form-item label="开户名">
          <el-input v-model="bankForm.accountName" placeholder="请输入公司开户名称" />
        </el-form-item>
        <el-form-item label="银行账号">
          <el-input v-model="bankForm.accountNo" placeholder="请输入银行账号" />
        </el-form-item>
        <el-form-item label="开户行">
          <el-input v-model="bankForm.branch" placeholder="请输入开户支行名称" />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="bankForm.enabled" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBankDialog = false">取消</el-button>
        <el-button type="primary" @click="submitBankForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getPaymentConfig, updatePaymentConfig, togglePaymentMethod } from '@/api/payment'
import { mockPaymentConfig } from '@/mock/payment'

const activeTab = ref('wechat')
const configs = reactive({
  wechat: { ...mockPaymentConfig.wechat },
  alipay: { ...mockPaymentConfig.alipay },
  bank: { ...mockPaymentConfig.bank }
})

const originalConfigs = reactive({})

const showBankDialog = ref(false)
const isEditBank = ref(false)
const editBankIndex = ref(-1)

const bankForm = reactive({
  id: '',
  name: '',
  accountName: '',
  accountNo: '',
  branch: '',
  enabled: true
})

const bankNameMap = {
  'ICBC': '工商银行',
  'ABC': '农业银行',
  'CCB': '建设银行',
  'BOC': '中国银行',
  'BOCOM': '交通银行',
  'CMB': '招商银行',
  'SPDB': '浦发银行',
  'CMSB': '民生银行'
}

watch(() => bankForm.id, (newVal) => {
  bankForm.name = bankNameMap[newVal] || ''
})

const fetchConfig = async () => {
  try {
    const res = await getPaymentConfig()
    if (res.code === 200) {
      Object.assign(configs, res.data)
      Object.assign(originalConfigs, JSON.parse(JSON.stringify(res.data)))
    }
  } catch (error) {
    console.error('Failed to fetch payment config:', error)
  }
}

const handleToggleMethod = async (method) => {
  try {
    const res = await togglePaymentMethod({
      method: method,
      enabled: configs[method].enabled
    })
    if (res.code === 200) {
      ElMessage.success(res.message)
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleSaveConfig = async (method) => {
  try {
    const res = await updatePaymentConfig({
      method: method,
      config: configs[method].config,
      settings: configs[method].settings
    })
    if (res.code === 200) {
      ElMessage.success('配置保存成功')
      originalConfigs[method] = JSON.parse(JSON.stringify(configs[method]))
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const handleResetConfig = (method) => {
  if (originalConfigs[method]) {
    Object.assign(configs[method], JSON.parse(JSON.stringify(originalConfigs[method])))
    ElMessage.info('配置已重置')
  }
}

const handleToggleBank = (bankId) => {
  ElMessage.success('银行状态已更新')
}

const handleAddBank = () => {
  isEditBank.value = false
  editBankIndex.value = -1
  Object.assign(bankForm, {
    id: '',
    name: '',
    accountName: '',
    accountNo: '',
    branch: '',
    enabled: true
  })
  showBankDialog.value = true
}

const handleEditBank = (index) => {
  isEditBank.value = true
  editBankIndex.value = index
  const bank = configs.bank.config.banks[index]
  Object.assign(bankForm, { ...bank })
  showBankDialog.value = true
}

const handleDeleteBank = (index) => {
  ElMessage.confirm('确定要删除该银行账户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    configs.bank.config.banks.splice(index, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const submitBankForm = () => {
  if (!bankForm.id) {
    ElMessage.warning('请选择银行')
    return
  }
  if (!bankForm.accountName) {
    ElMessage.warning('请输入开户名')
    return
  }
  if (!bankForm.accountNo) {
    ElMessage.warning('请输入银行账号')
    return
  }
  if (!bankForm.branch) {
    ElMessage.warning('请输入开户行')
    return
  }

  if (isEditBank.value && editBankIndex.value >= 0) {
    Object.assign(configs.bank.config.banks[editBankIndex.value], { ...bankForm })
    ElMessage.success('编辑成功')
  } else {
    configs.bank.config.banks.push({ ...bankForm })
    ElMessage.success('添加成功')
  }

  showBankDialog.value = false
}

onMounted(() => {
  fetchConfig()
})
</script>

<style lang="scss" scoped>
.payment-config-container {
  .config-card {
    padding: 20px;
  }

  .config-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .config-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .config-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: #fff;

    &.wechat {
      background: linear-gradient(135deg, #07C160 0%, #05A150 100%);
    }

    &.alipay {
      background: linear-gradient(135deg, #1677FF 0%, #0d5bc0 100%);
    }

    &.bank {
      background: linear-gradient(135deg, #E6A23C 0%, #cf9235 100%);
    }
  }

  .config-name {
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 4px 0;
    }

    .config-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin: 0;
    }
  }

  .config-form {
    max-width: 600px;

    .unit {
      margin-left: 8px;
      color: var(--text-muted);
    }

    .help-text {
      margin-left: 12px;
      font-size: 12px;
      color: var(--text-muted);
    }
  }

  .settings-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
  }

  .form-actions {
    margin-top: 24px;
    display: flex;
    gap: 12px;
  }

  .bank-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .bank-item {
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 16px;
    border: 1px solid var(--border-color);

    &:hover {
      border-color: var(--accent-cyan);
    }
  }

  .bank-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .bank-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .bank-account {
      font-family: monospace;
      font-size: 13px;
      color: var(--text-secondary);
    }
  }

  .bank-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .bank-detail {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed var(--border-color);

    .detail-row {
      font-size: 13px;
      margin-bottom: 4px;

      .detail-label {
        color: var(--text-muted);
      }

      .detail-value {
        color: var(--text-primary);
      }
    }
  }

  .add-bank-btn {
    border: 2px dashed var(--border-color);
    padding: 16px;
    font-size: 14px;

    &:hover {
      border-color: var(--accent-cyan);
      color: var(--accent-cyan);
    }
  }
}
</style>
