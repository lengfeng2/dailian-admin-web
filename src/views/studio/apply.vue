<template>
  <div class="studio-apply-container fade-in">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <el-icon class="icon"><DocumentAdd /></el-icon>
          工作室入驻申请
        </div>
        <div class="header-actions">
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置表单
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <el-steps :active="currentStep" align-center class="apply-steps">
          <el-step title="基本信息" :icon="User" />
          <el-step title="资质信息" :icon="Document" />
          <el-step title="确认提交" :icon="Check" />
        </el-steps>

        <div class="form-content">
          <div v-show="currentStep === 0" class="step-content">
            <el-form
              ref="basicFormRef"
              :model="basicForm"
              :rules="basicFormRules"
              label-width="120px"
              class="apply-form"
            >
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="工作室名称" prop="name">
                    <el-input
                      v-model="basicForm.name"
                      placeholder="请输入工作室名称"
                      maxlength="50"
                      show-word-limit
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="负责人姓名" prop="ownerName">
                    <el-input
                      v-model="basicForm.ownerName"
                      placeholder="请输入负责人姓名"
                      maxlength="20"
                      show-word-limit
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="联系电话" prop="ownerPhone">
                    <el-input
                      v-model="basicForm.ownerPhone"
                      placeholder="请输入联系电话"
                      maxlength="11"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="电子邮箱" prop="email">
                    <el-input
                      v-model="basicForm.email"
                      placeholder="请输入电子邮箱"
                      maxlength="50"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="所在地区" prop="region">
                    <el-cascader
                      v-model="basicForm.region"
                      :options="regionOptions"
                      placeholder="请选择所在地区"
                      style="width: 100%"
                      clearable
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="详细地址" prop="address">
                    <el-input
                      v-model="basicForm.address"
                      placeholder="请输入详细地址"
                      maxlength="100"
                      show-word-limit
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="工作室简介" prop="description">
                <el-input
                  v-model="basicForm.description"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入工作室简介，包括主要业务、团队规模、优势等"
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>
            </el-form>
          </div>

          <div v-show="currentStep === 1" class="step-content">
            <el-form
              ref="qualificationFormRef"
              :model="qualificationForm"
              :rules="qualificationFormRules"
              label-width="120px"
              class="apply-form"
            >
              <el-form-item label="工作室Logo">
                <el-upload
                  class="avatar-uploader"
                  action="#"
                  :show-file-list="false"
                  :on-change="handleLogoChange"
                  :auto-upload="false"
                  accept="image/*"
                >
                  <img v-if="qualificationForm.logo" :src="qualificationForm.logo" class="avatar" />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
                <div class="upload-tip">支持 JPG、PNG 格式，建议尺寸 200x200 像素</div>
              </el-form-item>

              <el-form-item label="主要游戏类型" prop="gameTypes">
                <el-checkbox-group v-model="qualificationForm.gameTypes">
                  <el-checkbox label="王者荣耀">王者荣耀</el-checkbox>
                  <el-checkbox label="和平精英">和平精英</el-checkbox>
                  <el-checkbox label="原神">原神</el-checkbox>
                  <el-checkbox label="英雄联盟">英雄联盟</el-checkbox>
                  <el-checkbox label="穿越火线">穿越火线</el-checkbox>
                  <el-checkbox label="绝地求生">绝地求生</el-checkbox>
                  <el-checkbox label="永劫无间">永劫无间</el-checkbox>
                  <el-checkbox label="其他">其他</el-checkbox>
                </el-checkbox-group>
              </el-form-item>

              <el-form-item label="预计打手数量" prop="expectedPlayerCount">
                <el-input-number
                  v-model="qualificationForm.expectedPlayerCount"
                  :min="1"
                  :max="500"
                  :precision="0"
                  style="width: 200px"
                />
                <span class="unit">人</span>
              </el-form-item>

              <el-form-item label="期望分佣比例" prop="expectedCommissionRate">
                <el-input-number
                  v-model="qualificationForm.expectedCommissionRate"
                  :min="5"
                  :max="40"
                  :precision="0"
                  style="width: 200px"
                />
                <span class="unit">%</span>
                <div class="form-tip">平台最终分佣比例将根据审核结果确定</div>
              </el-form-item>

              <el-form-item label="资质证明" prop="qualification">
                <el-input
                  v-model="qualificationForm.qualification"
                  type="textarea"
                  :rows="4"
                  placeholder="请描述工作室的资质证明情况，如营业执照、相关许可证等"
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="相关证件">
                <el-upload
                  class="certificate-uploader"
                  action="#"
                  :multiple="true"
                  :limit="5"
                  :on-exceed="handleExceed"
                  :file-list="qualificationForm.certificates"
                  :auto-upload="false"
                  accept=".jpg,.jpeg,.png,.pdf"
                >
                  <el-button type="primary">
                    <el-icon><Upload /></el-icon>
                    上传证件
                  </el-button>
                  <template #tip>
                    <div class="el-upload__tip">
                      支持 JPG、PNG、PDF 格式，最多上传 5 个文件
                    </div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-form>
          </div>

          <div v-show="currentStep === 2" class="step-content">
            <div class="preview-card">
              <h3 class="preview-title">申请信息确认</h3>
              
              <el-descriptions :column="2" border class="preview-descriptions">
                <el-descriptions-item label="工作室名称">{{ basicForm.name }}</el-descriptions-item>
                <el-descriptions-item label="负责人姓名">{{ basicForm.ownerName }}</el-descriptions-item>
                <el-descriptions-item label="联系电话">{{ basicForm.ownerPhone }}</el-descriptions-item>
                <el-descriptions-item label="电子邮箱">{{ basicForm.email }}</el-descriptions-item>
                <el-descriptions-item label="详细地址" :span="2">
                  {{ basicForm.region?.join(' ') || '' }} {{ basicForm.address }}
                </el-descriptions-item>
                <el-descriptions-item label="工作室简介" :span="2">
                  {{ basicForm.description }}
                </el-descriptions-item>
                <el-descriptions-item label="主要游戏类型">
                  {{ qualificationForm.gameTypes?.join('、') || '' }}
                </el-descriptions-item>
                <el-descriptions-item label="预计打手数量">
                  {{ qualificationForm.expectedPlayerCount }} 人
                </el-descriptions-item>
                <el-descriptions-item label="期望分佣比例">
                  {{ qualificationForm.expectedCommissionRate }}%
                </el-descriptions-item>
                <el-descriptions-item label="资质证明" :span="2">
                  {{ qualificationForm.qualification }}
                </el-descriptions-item>
              </el-descriptions>

              <div class="agreement-section">
                <el-checkbox v-model="agreementChecked">
                  我已阅读并同意 <a href="javascript:;" class="agreement-link">《工作室入驻服务协议》</a>
                </el-checkbox>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <el-button v-if="currentStep > 0" @click="handlePrev">
            <el-icon><ArrowLeft /></el-icon>
            上一步
          </el-button>
          <el-button v-if="currentStep < 2" type="primary" @click="handleNext">
            下一步
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button v-if="currentStep === 2" type="primary" :loading="submitLoading" @click="handleSubmit">
            <el-icon><Check /></el-icon>
            提交申请
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createStudio } from '@/api/studio'

const router = useRouter()
const currentStep = ref(0)
const submitLoading = ref(false)
const agreementChecked = ref(false)

const basicFormRef = ref()
const qualificationFormRef = ref()

const regionOptions = [
  {
    value: '北京市',
    label: '北京市',
    children: [
      { value: '朝阳区', label: '朝阳区' },
      { value: '海淀区', label: '海淀区' },
      { value: '东城区', label: '东城区' },
      { value: '西城区', label: '西城区' },
      { value: '丰台区', label: '丰台区' }
    ]
  },
  {
    value: '上海市',
    label: '上海市',
    children: [
      { value: '浦东新区', label: '浦东新区' },
      { value: '徐汇区', label: '徐汇区' },
      { value: '黄浦区', label: '黄浦区' },
      { value: '静安区', label: '静安区' },
      { value: '长宁区', label: '长宁区' }
    ]
  },
  {
    value: '广东省',
    label: '广东省',
    children: [
      { value: '广州市', label: '广州市' },
      { value: '深圳市', label: '深圳市' },
      { value: '东莞市', label: '东莞市' },
      { value: '佛山市', label: '佛山市' }
    ]
  },
  {
    value: '浙江省',
    label: '浙江省',
    children: [
      { value: '杭州市', label: '杭州市' },
      { value: '宁波市', label: '宁波市' },
      { value: '温州市', label: '温州市' },
      { value: '嘉兴市', label: '嘉兴市' }
    ]
  }
]

const basicForm = reactive({
  name: '',
  ownerName: '',
  ownerPhone: '',
  email: '',
  region: [],
  address: '',
  description: ''
})

const qualificationForm = reactive({
  logo: '',
  gameTypes: [],
  expectedPlayerCount: 10,
  expectedCommissionRate: 15,
  qualification: '',
  certificates: []
})

const basicFormRules = {
  name: [
    { required: true, message: '请输入工作室名称', trigger: 'blur' },
    { min: 2, max: 50, message: '工作室名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  ownerName: [
    { required: true, message: '请输入负责人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '负责人姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  ownerPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入工作室简介', trigger: 'blur' },
    { min: 10, max: 500, message: '工作室简介长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

const qualificationFormRules = {
  gameTypes: [
    { required: true, message: '请选择主要游戏类型', trigger: 'change', type: 'array' }
  ],
  qualification: [
    { required: true, message: '请描述资质证明情况', trigger: 'blur' },
    { min: 10, max: 500, message: '资质描述长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

const handleLogoChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    qualificationForm.logo = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const handleExceed = (files, fileList) => {
  ElMessage.warning(`最多只能上传 5 个文件`)
}

const handlePrev = () => {
  currentStep.value--
}

const handleNext = async () => {
  if (currentStep.value === 0) {
    if (!basicFormRef.value) return
    await basicFormRef.value.validate((valid) => {
      if (valid) {
        currentStep.value++
      }
    })
  } else if (currentStep.value === 1) {
    if (!qualificationFormRef.value) return
    await qualificationFormRef.value.validate((valid) => {
      if (valid) {
        currentStep.value++
      }
    })
  }
}

const handleSubmit = async () => {
  if (!agreementChecked.value) {
    ElMessage.warning('请先阅读并同意入驻服务协议')
    return
  }

  submitLoading.value = true
  try {
    const res = await createStudio({
      ...basicForm,
      ...qualificationForm,
      status: 'pending',
      applyStatus: 'pending'
    })
    if (res.code === 200) {
      ElMessage.success('申请提交成功，请等待审核')
      setTimeout(() => {
        router.push('/studio/list')
      }, 1500)
    }
  } catch (error) {
    ElMessage.error('提交失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

const handleReset = () => {
  currentStep.value = 0
  agreementChecked.value = false
  
  basicForm.name = ''
  basicForm.ownerName = ''
  basicForm.ownerPhone = ''
  basicForm.email = ''
  basicForm.region = []
  basicForm.address = ''
  basicForm.description = ''
  
  qualificationForm.logo = ''
  qualificationForm.gameTypes = []
  qualificationForm.expectedPlayerCount = 10
  qualificationForm.expectedCommissionRate = 15
  qualificationForm.qualification = ''
  qualificationForm.certificates = []
}

onMounted(() => {
})
</script>

<style lang="scss" scoped>
.studio-apply-container {
  .apply-steps {
    margin-bottom: 40px;
    padding: 20px;
    background: var(--bg-secondary);
    border-radius: 8px;
  }

  .form-content {
    max-width: 900px;
    margin: 0 auto;
  }

  .step-content {
    animation: fadeIn 0.3s ease-in-out;
  }

  .apply-form {
    .form-tip {
      margin-top: 8px;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .unit {
      margin-left: 8px;
      color: var(--text-secondary);
    }
  }

  .avatar-uploader {
    :deep(.el-upload) {
      border: 1px dashed var(--border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--transition);

      &:hover {
        border-color: var(--primary);
      }
    }

    .avatar {
      width: 148px;
      height: 148px;
      display: block;
      object-fit: cover;
    }

    .avatar-uploader-icon {
      font-size: 28px;
      color: var(--text-secondary);
      width: 148px;
      height: 148px;
      line-height: 148px;
      text-align: center;
    }

    .upload-tip {
      margin-top: 8px;
      font-size: 12px;
      color: var(--text-secondary);
    }
  }

  .certificate-uploader {
    :deep(.el-upload-list) {
      margin-top: 12px;
    }
  }

  .preview-card {
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 24px;

    .preview-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-color);
    }

    .preview-descriptions {
      :deep(.el-descriptions__label) {
        background: var(--bg-tertiary);
        width: 150px;
      }

      :deep(.el-descriptions__content) {
        background: var(--bg-primary);
      }
    }

    .agreement-section {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);

      .agreement-link {
        color: var(--primary);
        text-decoration: underline;
      }
    }
  }

  .form-actions {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: center;
    gap: 16px;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
