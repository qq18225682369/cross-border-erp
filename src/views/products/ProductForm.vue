<template>
  <div class="product-form-container">
    <div class="page-header">
      <el-page-header @back="goBack">
        <template #content>
          <span class="page-title">{{ isEdit ? '编辑产品' : '添加产品' }}</span>
        </template>
      </el-page-header>
    </div>

    <el-card>
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        style="max-width: 600px"
      >
        <el-form-item label="SKU" prop="sku">
          <el-input v-model="formData.sku" placeholder="请输入SKU" />
        </el-form-item>
        
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入产品名称" />
        </el-form-item>
        
        <el-form-item label="产品分类" prop="categoryId">
          <el-select v-model="formData.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="成本价" prop="costPrice">
          <el-input-number v-model="formData.costPrice" :precision="2" :min="0" style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="重量(kg)" prop="weight">
          <el-input-number v-model="formData.weight" :precision="3" :min="0" style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="产品图片" prop="image">
          <el-input v-model="formData.image" placeholder="请输入图片URL" />
        </el-form-item>
        
        <el-form-item label="产品描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入产品描述" />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">在售</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '添加产品' }}
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const formRef = ref(null)
const loading = ref(false)

const isEdit = computed(() => !!route.params.id)

const categories = ref([
  { id: 1, name: '上装' },
  { id: 2, name: '外套' },
  { id: 3, name: '鞋类' },
  { id: 4, name: '配饰' }
])

const formData = reactive({
  sku: '',
  name: '',
  categoryId: null,
  costPrice: 0,
  weight: 0,
  image: '',
  description: '',
  status: 1
})

const formRules = {
  sku: [{ required: true, message: '请输入SKU', trigger: 'blur' }],
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  costPrice: [{ required: true, message: '请输入成本价', trigger: 'blur' }],
  weight: [{ required: true, message: '请输入重量', trigger: 'blur' }]
}

const goBack = () => {
  router.push('/products')
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      setTimeout(() => {
        ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
        loading.value = false
        router.push('/products')
      }, 500)
    }
  })
}

onMounted(() => {
  if (isEdit.value) {
    Object.assign(formData, {
      sku: 'SKU001',
      name: '男士休闲T恤',
      categoryId: 1,
      costPrice: 45.00,
      weight: 0.25,
      image: '',
      description: '优质纯棉面料，舒适透气',
      status: 1
    })
  }
})
</script>

<style scoped>
.product-form-container {
  padding-bottom: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
}
</style>
