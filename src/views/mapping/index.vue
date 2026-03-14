<template>
  <div class="mapping-container">
    <div class="page-header">
      <h2>映射管理</h2>
    </div>

    <el-card>
      <div class="filter-area">
        <el-input v-model="filters.keyword" placeholder="产品名称/SKU" clearable style="width: 200px" @keyup.enter="handleSearch" />
        <el-select v-model="filters.channelType" placeholder="渠道类型" clearable style="width: 120px">
          <el-option v-for="item in channelTypes" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 100px">
          <el-option label="已配对" :value="1" />
          <el-option label="未配对" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="code" label="SKU" width="150" />
        <el-table-column prop="name" label="产品名称" min-width="180" />
        <el-table-column prop="categoryName" label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.categoryName || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="channelName" label="物流渠道" width="140">
          <template #default="{ row }">
            <span v-if="row.channelName">{{ row.channelName }}</span>
            <el-tag v-else type="info" size="small">未配对</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="channelType" label="渠道类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.channelType" size="small">{{ row.channelType }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="destinationCountry" label="目的国家" width="100">
          <template #default="{ row }">
            {{ getCountryName(row.destinationCountry) || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="shippingCost" label="运费" width="100" align="right">
          <template #default="{ row }">
            {{ row.shippingCost ? `¥${row.shippingCost.toFixed(2)}` : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="deliveryTime" label="时效" width="80" align="center">
          <template #default="{ row }">
            {{ row.deliveryTime ? `${row.deliveryTime}天` : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '已配对' : '未配对' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleMapping(row)">
              {{ row.status === 1 ? '修改' : '配对' }}
            </el-button>
            <el-button v-if="row.status === 1" type="warning" link size="small" @click="handleCancel(row)">取消</el-button>
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
    </el-card>

    <el-dialog v-model="mappingDialogVisible" title="物流配对" width="500px">
      <el-form :model="mappingForm" label-width="80px">
        <el-form-item label="产品">
          <el-input :value="mappingForm.productName" disabled />
        </el-form-item>
        <el-form-item label="目的国家">
          <el-select v-model="mappingForm.destinationCountry" placeholder="请选择国家" style="width: 100%">
            <el-option v-for="item in countries" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="物流渠道">
          <el-select v-model="mappingForm.channelId" placeholder="请选择物流渠道" style="width: 100%">
            <el-option v-for="item in channels" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="运费">
          <el-input-number v-model="mappingForm.shippingCost" :precision="2" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="预计时效">
          <el-input-number v-model="mappingForm.deliveryTime" :min="1" :max="60" style="width: 100%">
            <template #append>天</template>
          </el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="mappingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMapping">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getProductList } from '@/api/product'
import { getChannelList } from '@/api/channel'
import { getCountryList } from '@/api/country'
import { saveMapping as saveMappingApi, cancelMapping } from '@/api/mapping'

const loading = ref(false)
const mappingDialogVisible = ref(false)

const channelTypes = ref([
  { label: '空运', value: '空运' },
  { label: '海运', value: '海运' },
  { label: '快递', value: '快递' },
  { label: '陆运', value: '陆运' }
])

const countries = ref([])
const channels = ref([])
const tableData = ref([])

const filters = reactive({
  keyword: '',
  channelType: null,
  status: null
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const mappingForm = reactive({
  productId: null,
  productName: '',
  destinationCountry: '',
  channelId: null,
  shippingCost: 0,
  deliveryTime: 7
})

// 加载数据
const loadCountries = async () => {
  try {
    const res = await getCountryList()
    countries.value = res.data || []
  } catch (error) {
    console.error('加载国家失败', error)
  }
}

const loadChannels = async () => {
  try {
    const res = await getChannelList()
    channels.value = res.data || []
  } catch (error) {
    console.error('加载渠道失败', error)
  }
}

const loadProducts = async () => {
  loading.value = true
  try {
    const res = await getProductList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters
    })
    tableData.value = res.data?.records || []
    pagination.total = res.data?.total || 0
  } catch (error) {
    console.error('加载产品失败', error)
  } finally {
    loading.value = false
  }
}

// 获取国家名称
const getCountryName = (code) => {
  const country = countries.value.find(c => c.code === code)
  return country ? country.name : code
}

const handleSearch = () => {
  pagination.page = 1
  loadProducts()
}

const handleReset = () => {
  filters.keyword = ''
  filters.channelType = null
  filters.status = null
  pagination.page = 1
  loadProducts()
}

const handleMapping = (row) => {
  mappingForm.productId = row.id
  mappingForm.productName = row.name
  mappingForm.destinationCountry = row.destinationCountry || ''
  mappingForm.channelId = row.channelId || null
  mappingForm.shippingCost = row.shippingCost || 0
  mappingForm.deliveryTime = row.deliveryTime || 7
  mappingDialogVisible.value = true
}

const saveMapping = async () => {
  try {
    await saveMappingApi({
      productId: mappingForm.productId,
      destinationCountry: mappingForm.destinationCountry,
      channelId: mappingForm.channelId,
      shippingCost: mappingForm.shippingCost,
      deliveryTime: mappingForm.deliveryTime
    })
    mappingDialogVisible.value = false
    ElMessage.success('配对成功')
    loadProducts()
  } catch (error) {
    console.error('保存配对失败', error)
    ElMessage.error('保存失败')
  }
}

const handleCancel = (row) => {
  ElMessageBox.confirm('确定要取消该配对吗？', '提示', { type: 'warning' }).then(async () => {
    try {
      await cancelMapping(row.id)
      ElMessage.success('取消成功')
      loadProducts()
    } catch (error) {
      console.error('取消配对失败', error)
    }
  }).catch(() => {})
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadProducts()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  loadProducts()
}

onMounted(() => {
  loadCountries()
  loadChannels()
  loadProducts()
})
</script>

<style scoped>
.mapping-container {
  padding-bottom: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 22px;
  color: #303133;
}

.filter-area {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
