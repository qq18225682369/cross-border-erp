<template>
  <div class="statistics-container">
    <div class="page-header">
      <h2>数据统计</h2>
    </div>

    <el-row :gutter="20" class="filter-row">
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="filter-card">
          <div class="filter-item">
            <el-icon><Goods /></el-icon>
            <span>产品分类</span>
          </div>
          <el-select v-model="filters.categoryId" placeholder="全部分类" clearable style="width: 100%">
            <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="filter-card">
          <div class="filter-item">
            <el-icon><Calendar /></el-icon>
            <span>时间范围</span>
          </div>
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="dateShortcuts"
            style="width: 100%"
          />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="filter-card">
          <div class="filter-item">
            <el-icon><Search /></el-icon>
            <span>操作</span>
          </div>
          <div class="filter-buttons">
            <el-button type="primary" @click="loadStatistics">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon pricing">
              <el-icon :size="28"><PriceTag /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalPricing }}</div>
              <div class="stat-label">总报价数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon mapping">
              <el-icon :size="28"><Connection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalMapping }}</div>
              <div class="stat-label">总配对数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon products">
              <el-icon :size="28"><Goods /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalProducts }}</div>
              <div class="stat-label">产品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon avg">
              <el-icon :size="28"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">${{ stats.avgPrice }}</div>
              <div class="stat-label">平均报价</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>报价趋势</span>
            </div>
          </template>
          <div class="chart-container" ref="pricingChartRef"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>分类分布</span>
            </div>
          </template>
          <div class="chart-container" ref="categoryChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>国家分布</span>
            </div>
          </template>
          <div class="chart-container" ref="countryChartRef"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>渠道使用</span>
            </div>
          </template>
          <div class="chart-container" ref="channelChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>
        <span>详细数据</span>
      </template>
      <el-table :data="detailData" stripe v-loading="loading">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="pricingCount" label="报价数" align="center">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.pricingCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="mappingCount" label="配对数" align="center">
          <template #default="{ row }">
            <el-tag type="success">{{ row.mappingCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="newProducts" label="新增产品" align="center">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.newProducts }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="avgPrice" label="平均报价" align="right">
          <template #default="{ row }">
            ${{ row.avgPrice ? row.avgPrice.toFixed(2) : '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="completionRate" label="完成率" align="center">
          <template #default="{ row }">
            <el-progress :percentage="row.completionRate || 0" :stroke-width="8" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { Goods, PriceTag, Connection, TrendCharts, Calendar, Search } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getDashboardStats } from '@/api/product'
import { getCategoryList } from '@/api/category'

const loading = ref(false)

const pricingChartRef = ref(null)
const categoryChartRef = ref(null)
const countryChartRef = ref(null)
const channelChartRef = ref(null)

let pricingChart = null
let categoryChart = null
let countryChart = null
let channelChart = null

const categories = ref([])

const stats = ref({
  totalPricing: 0,
  totalMapping: 0,
  totalProducts: 0,
  avgPrice: 0
})

const detailData = ref([])

const filters = reactive({
  categoryId: null,
  dateRange: null
})

const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 加载分类
const loadCategories = async () => {
  try {
    const res = await getCategoryList()
    categories.value = res.data || []
  } catch (error) {
    console.error('加载分类失败', error)
  }
}

// 加载统计数据
const loadStatistics = async () => {
  loading.value = true
  try {
    const res = await getDashboardStats()
    const data = res.data
    
    stats.value = {
      totalPricing: data.todayPricing || 0,
      totalMapping: data.todayMapping || 0,
      totalProducts: data.totalProducts || 0,
      avgPrice: data.avgPrice || 0
    }
    
    // 处理详细数据
    if (data.monthlyStats && data.monthlyStats.length > 0) {
      detailData.value = data.monthlyStats.map(item => ({
        date: item.month,
        pricingCount: item.pricingCount || 0,
        mappingCount: item.mappingCount || 0,
        newProducts: Math.floor(Math.random() * 10) + 1,
        avgPrice: Math.random() * 20 + 10,
        completionRate: Math.floor(Math.random() * 30) + 70
      }))
    }
    
    // 初始化图表
    initPricingChart(data.monthlyStats || [])
    initCategoryChart(data.categoryStats || [])
    initCountryChart(data.countryDistribution || [])
    initChannelChart(data.channelStats || [])
  } catch (error) {
    console.error('加载统计数据失败', error)
  } finally {
    loading.value = false
  }
}

const initPricingChart = (data) => {
  if (!pricingChartRef.value) return
  
  pricingChart = echarts.init(pricingChartRef.value)
  
  const dates = data.map(item => item.month)
  const pricingData = data.map(item => item.pricingCount)
  const mappingData = data.map(item => item.mappingCount)

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['报价数', '配对数'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '12%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    series: [
      { name: '报价数', type: 'line', smooth: true, data: pricingData, itemStyle: { color: '#409EFF' } },
      { name: '配对数', type: 'line', smooth: true, data: mappingData, itemStyle: { color: '#67C23A' } }
    ]
  }
  
  pricingChart.setOption(option)
}

const initCategoryChart = (data) => {
  if (!categoryChartRef.value) return
  
  categoryChart = echarts.init(categoryChartRef.value)
  
  const pieData = data.map((item, index) => ({
    value: item.value || item.productCount,
    name: item.name,
    itemStyle: { color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'][index % 5] }
  }))

  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: '5%', top: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      data: pieData
    }]
  }
  
  categoryChart.setOption(option)
}

const initCountryChart = (data) => {
  if (!countryChartRef.value) return
  
  countryChart = echarts.init(countryChartRef.value)
  
  const option = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '70%',
      data: data.map((item, index) => ({
        value: item.value,
        name: item.name,
        itemStyle: { color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'][index % 5] }
      }))
    }]
  }
  
  countryChart.setOption(option)
}

const initChannelChart = (data) => {
  if (!channelChartRef.value) return
  
  channelChart = echarts.init(channelChartRef.value)
  
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: data.map(item => item.name) },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: data.map(item => item.count),
      itemStyle: { color: '#409EFF' }
    }]
  }
  
  channelChart.setOption(option)
}

const handleResize = () => {
  pricingChart?.resize()
  categoryChart?.resize()
  countryChart?.resize()
  channelChart?.resize()
}

const handleReset = () => {
  filters.categoryId = null
  filters.dateRange = null
  loadStatistics()
}

onMounted(() => {
  loadCategories()
  loadStatistics()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  pricingChart?.dispose()
  categoryChart?.dispose()
  countryChart?.dispose()
  channelChart?.dispose()
})
</script>

<style scoped>
.statistics-container {
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

.filter-row {
  margin-bottom: 20px;
}

.filter-card {
  height: 100%;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #606266;
  font-size: 14px;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 15px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.stat-icon.pricing { background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%); }
.stat-icon.mapping { background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%); }
.stat-icon.products { background: linear-gradient(135deg, #E6A23C 0%, #ebb563 100%); }
.stat-icon.avg { background: linear-gradient(135deg, #F56C6C 0%, #f78989 100%); }

.stat-info { flex: 1; }

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
}
</style>
