<template>
  <div class="pricing-container">
    <div class="page-header">
      <h2>报价管理</h2>
    </div>

    <el-card>
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleBatchPricing">
            <el-icon><PriceTag /></el-icon>
            批量报价
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出Excel
          </el-button>
        </div>
      </div>

      <div class="filter-area">
        <el-select v-model="filters.product" placeholder="选择产品" clearable filterable style="width: 250px">
          <el-option v-for="item in products" :key="item.id" :label="`${item.name} (${item.code})`" :value="item.id" />
        </el-select>
        <el-select v-model="filters.region" placeholder="选择区域" clearable style="width: 120px">
          <el-option v-for="item in regions" :key="item" :label="item" :value="item" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button @click="toggleCountrySelector">
          <el-icon><Setting /></el-icon>
          选择国家 ({{ selectedCountries.length }})
        </el-button>
      </div>

      <el-collapse-transition>
        <div v-show="showCountrySelector" class="country-selector">
          <div class="country-group" v-for="region in regionGroups" :key="region.name">
            <div class="region-title">{{ region.name }}</div>
            <el-checkbox-group v-model="selectedCountries">
              <el-checkbox v-for="country in region.countries" :key="country.code" :label="country.code">
                {{ country.name }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </el-collapse-transition>

      <el-table :data="tableData" stripe v-loading="loading" border style="margin-top: 16px">
        <el-table-column prop="productName" label="产品名称" width="180" fixed>
          <template #default="{ row }">
            <div class="product-info">
              <span class="product-name">{{ row.name }}</span>
              <span class="product-sku">{{ row.code }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="purchasePrice" label="采购价(¥)" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.purchasePrice ? row.purchasePrice.toFixed(2) : '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="重量(kg)" width="90" align="right">
          <template #default="{ row }">
            {{ row.weight ? row.weight.toFixed(2) : '0.00' }}
          </template>
        </el-table-column>
        <el-table-column
          v-for="country in displayCountries"
          :key="country.code"
          :label="country.name"
          min-width="100"
          align="center"
        >
          <template #default="{ row }">
            <div class="price-cell" @click="editPrice(row, country)">
              <template v-if="getPrice(row, country.id)">
                <span class="price-value">{{ getPrice(row, country.id).toFixed(2) }}</span>
                <span class="price-currency">{{ country.currency }}</span>
              </template>
              <template v-else>
                <el-button type="primary" link size="small">设置</el-button>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewHistory(row)">历史</el-button>
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

    <el-dialog v-model="priceDialogVisible" title="编辑报价" width="400px">
      <el-form :model="priceForm" label-width="80px">
        <el-form-item label="产品">
          <el-input :value="priceForm.productName" disabled />
        </el-form-item>
        <el-form-item label="国家">
          <el-input :value="priceForm.countryName" disabled />
        </el-form-item>
        <el-form-item label="报价">
          <el-input-number v-model="priceForm.price" :precision="2" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="priceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePrice">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="batchDialogVisible" title="批量报价" width="700px">
      <el-table :data="batchProducts" max-height="400">
        <el-table-column prop="name" label="产品名称" width="180" />
        <el-table-column prop="code" label="SKU" width="120" />
        <el-table-column prop="purchasePrice" label="采购价" width="100">
          <template #default="{ row }">
            ¥{{ row.purchasePrice ? row.purchasePrice.toFixed(2) : '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="报价" min-width="150">
          <template #default="{ row }">
            <el-input-number v-model="row.price" :precision="2" :min="0" size="small" style="width: 130px" />
          </template>
        </el-table-column>
      </el-table>
      <div class="batch-country-select" style="margin-top: 16px">
        <span style="margin-right: 10px">应用到国家：</span>
        <el-checkbox-group v-model="batchCountries">
          <el-checkbox v-for="country in countries" :key="country.id" :label="country.id">
            {{ country.name }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBatchPricing">确认报价</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="historyDialogVisible" title="报价历史" width="700px">
      <el-table :data="priceHistory" max-height="400">
        <el-table-column prop="country" label="国家" width="100" />
        <el-table-column prop="price" label="报价" width="120" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="createTime" label="操作时间" width="180" />
        <el-table-column prop="remark" label="备注" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { PriceTag, Download, Setting } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import { getProductList } from '@/api/product'
import { getCountryList } from '@/api/country'
import { getPricingByProductId, savePricing, batchSavePricing } from '@/api/pricing'

const loading = ref(false)
const priceDialogVisible = ref(false)
const batchDialogVisible = ref(false)
const historyDialogVisible = ref(false)
const showCountrySelector = ref(false)

const countries = ref([])
const products = ref([])
const pricings = ref([])

const filters = reactive({
  product: null,
  region: null
})

const selectedCountries = ref([])

const regionGroups = computed(() => {
  const groups = {}
  countries.value.forEach(c => {
    if (!groups[c.region]) {
      groups[c.region] = { name: c.region, countries: [] }
    }
    groups[c.region].countries.push(c)
  })
  return Object.values(groups)
})

const regions = computed(() => {
  return [...new Set(countries.value.map(c => c.region))]
})

const displayCountries = computed(() => {
  if (filters.region) {
    return countries.value.filter(c => selectedCountries.value.includes(c.code) && c.region === filters.region)
  }
  return countries.value.filter(c => selectedCountries.value.includes(c.code))
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])

const priceForm = reactive({
  productId: null,
  productName: '',
  countryId: null,
  countryName: '',
  price: 0
})

const batchProducts = ref([])
const batchCountries = ref([])

const priceHistory = ref([])

// 加载数据
const loadCountries = async () => {
  try {
    const res = await getCountryList()
    countries.value = res.data || []
    // 默认选中前6个国家
    selectedCountries.value = countries.value.slice(0, 6).map(c => c.code)
  } catch (error) {
    console.error('加载国家失败', error)
  }
}

const loadProducts = async () => {
  loading.value = true
  try {
    const res = await getProductList({ page: pagination.page, pageSize: pagination.pageSize })
    tableData.value = res.data?.records || []
    pagination.total = res.data?.total || 0
    products.value = tableData.value
  } catch (error) {
    console.error('加载产品失败', error)
  } finally {
    loading.value = false
  }
}

const loadPricings = async () => {
  try {
    // 加载所有产品的报价
    for (const product of tableData.value) {
      const res = await getPricingByProductId(product.id)
      if (res.data) {
        product.pricingList = res.data
      }
    }
  } catch (error) {
    console.error('加载报价失败', error)
  }
}

// 获取产品在某国家的报价
const getPrice = (product, countryId) => {
  if (!product.pricingList) return null
  const pricing = product.pricingList.find(p => p.countryId === countryId)
  return pricing ? pricing.price : null
}

const toggleCountrySelector = () => {
  showCountrySelector.value = !showCountrySelector.value
}

const editPrice = (row, country) => {
  priceForm.productId = row.id
  priceForm.productName = row.name
  priceForm.countryId = country.id
  priceForm.countryName = country.name
  priceForm.price = getPrice(row, country.id) || 0
  priceDialogVisible.value = true
}

const savePrice = async () => {
  try {
    await savePricing({
      productId: priceForm.productId,
      countryId: priceForm.countryId,
      price: priceForm.price
    })
    // 更新本地数据
    const product = tableData.value.find(p => p.id === priceForm.productId)
    if (product) {
      if (!product.pricingList) product.pricingList = []
      const existing = product.pricingList.find(p => p.countryId === priceForm.countryId)
      if (existing) {
        existing.price = priceForm.price
      } else {
        product.pricingList.push({
          productId: priceForm.productId,
          countryId: priceForm.countryId,
          price: priceForm.price
        })
      }
    }
    priceDialogVisible.value = false
    ElMessage.success('报价保存成功')
  } catch (error) {
    console.error('保存报价失败', error)
    ElMessage.error('保存失败')
  }
}

const handleBatchPricing = () => {
  batchProducts.value = products.value.map(p => ({ ...p, price: 0 }))
  batchCountries.value = []
  batchDialogVisible.value = true
}

const saveBatchPricing = async () => {
  if (batchCountries.value.length === 0) {
    ElMessage.warning('请选择至少一个国家')
    return
  }
  try {
    const pricingData = []
    batchProducts.value.forEach(product => {
      if (product.price > 0) {
        batchCountries.value.forEach(countryId => {
          pricingData.push({
            productId: product.id,
            countryId,
            price: product.price
          })
        })
      }
    })
    if (pricingData.length > 0) {
      await batchSavePricing(pricingData)
    }
    batchDialogVisible.value = false
    ElMessage.success('批量报价成功')
    loadPricings()
  } catch (error) {
    console.error('批量报价失败', error)
    ElMessage.error('批量报价失败')
  }
}

const handleViewHistory = (row) => {
  priceHistory.value = [
    { country: '英国', price: '£16.32', operator: 'admin', createTime: '2026-03-08 10:30:00', remark: '调整价格' }
  ]
  historyDialogVisible.value = true
}

const handleSearch = () => {
  pagination.page = 1
  loadProducts()
}

const handleReset = () => {
  filters.product = null
  filters.region = null
  pagination.page = 1
  loadProducts()
}

const handleExport = () => {
  // 准备导出数据
  const exportData = []
  
  tableData.value.forEach(product => {
    displayCountries.value.forEach(country => {
      const price = getPrice(product, country.id)
      exportData.push({
        'SKU': product.code,
        '产品名称': product.name,
        '国家': country.name,
        '国家代码': country.code,
        '区域': country.region,
        '货币': country.currency,
        '报价': price || '-',
        '采购价(¥)': product.purchasePrice,
        '重量': product.weight
      })
    })
  })
  
  if (exportData.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  
  // 创建工作簿
  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '报价数据')
  
  // 设置列宽
  worksheet['!cols'] = [
    { wch: 18 },  // SKU
    { wch: 30 },  // 产品名称
    { wch: 12 },  // 国家
    { wch: 10 },  // 国家代码
    { wch: 10 },  // 区域
    { wch: 8 },   // 货币
    { wch: 10 },  // 报价
    { wch: 12 },  // 采购价
    { wch: 10 }   // 重量
  ]
  
  // 导出文件
  const fileName = `报价数据_${new Date().toLocaleDateString()}.xlsx`
  XLSX.writeFile(workbook, fileName)
  
  ElMessage.success(`成功导出 ${exportData.length} 条数据`)
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadProducts()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  loadProducts()
}

onMounted(async () => {
  await loadCountries()
  await loadProducts()
  await loadPricings()
})
</script>

<style scoped>
.pricing-container {
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

.toolbar {
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  gap: 10px;
}

.filter-area {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.country-selector {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.country-group {
  margin-bottom: 12px;
}

.country-group:last-child {
  margin-bottom: 0;
}

.region-title {
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #e4e7ed;
}

.product-info {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-weight: 500;
  color: #303133;
}

.product-sku {
  font-size: 12px;
  color: #909399;
}

.price-cell {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.price-cell:hover {
  background-color: #f5f7fa;
}

.price-value {
  font-weight: 500;
  color: #409EFF;
}

.price-currency {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
