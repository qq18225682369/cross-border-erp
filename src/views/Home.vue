<template>
  <div class="home-container">
    <div class="page-header">
      <h2>首页仪表盘</h2>
      <p class="welcome-text">欢迎回来，{{ username }}！</p>
    </div>

    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="8" :md="8">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon pricing">
                <el-icon :size="32"><PriceTag /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.todayPricing }}</div>
                <div class="stat-label">今日报价数量</div>
                <div class="stat-change" :class="stats.pricingChange >= 0 ? 'up' : 'down'">
                  <el-icon v-if="stats.pricingChange >= 0"><Top /></el-icon>
                  <el-icon v-else><Bottom /></el-icon>
                  {{ Math.abs(stats.pricingChange || 0).toFixed(1) }}% 较昨日
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="8" :md="8">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon mapping">
                <el-icon :size="32"><Connection /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.todayMapping }}</div>
                <div class="stat-label">今日配对数量</div>
                <div class="stat-change" :class="stats.mappingChange >= 0 ? 'up' : 'down'">
                  <el-icon v-if="stats.mappingChange >= 0"><Top /></el-icon>
                  <el-icon v-else><Bottom /></el-icon>
                  {{ Math.abs(stats.mappingChange || 0).toFixed(1) }}% 较昨日
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="8" :md="8">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon products">
                <el-icon :size="32"><Goods /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalProducts }}</div>
                <div class="stat-label">产品总数</div>
                <div class="stat-change up">
                  <el-icon><Top /></el-icon>
                  {{ stats.newProducts }} 本周新增
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>每日任务趋势</span>
              <el-radio-group v-model="chartRange" size="small">
                <el-radio-button value="7">近7天</el-radio-button>
                <el-radio-button value="30">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" ref="lineChartRef"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <span>产品分类分布</span>
          </template>
          <div class="chart-container" ref="pieChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="task-card">
      <template #header>
        <div class="card-header">
          <span>近7天任务记录</span>
        </div>
      </template>
      <el-table :data="taskRecords" stripe v-loading="loading">
        <el-table-column prop="date" label="日期" width="150" />
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
        <el-table-column prop="totalTasks" label="总任务数" align="center">
          <template #default="{ row }">
            <el-tag type="info">{{ row.totalTasks }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { PriceTag, Connection, Goods, Top, Bottom } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getDashboardStats } from '@/api/product'

const username = computed(() => localStorage.getItem('username') || '用户')

const chartRange = ref('7')
const loading = ref(false)

const stats = ref({
  todayPricing: 0,
  todayMapping: 0,
  totalProducts: 0,
  newProducts: 0,
  pricingChange: 0,
  mappingChange: 0
})

const taskRecords = ref([])

const lineChartRef = ref(null)
const pieChartRef = ref(null)
let lineChart = null
let pieChart = null

// 加载仪表盘统计数据
const loadDashboardStats = async () => {
  loading.value = true
  try {
    const res = await getDashboardStats()
    const data = res.data
    stats.value = {
      todayPricing: data.todayPricing || 0,
      todayMapping: data.todayMapping || 0,
      totalProducts: data.totalProducts || 0,
      newProducts: data.newProducts || 0,
      pricingChange: data.pricingChange || 0,
      mappingChange: data.mappingChange || 0
    }
    
    // 处理趋势数据
    if (data.trendData && data.trendData.length > 0) {
      taskRecords.value = data.trendData.map(item => ({
        date: item.date,
        pricingCount: item.pricingCount,
        mappingCount: item.mappingCount,
        newProducts: item.productCount,
        totalTasks: (item.pricingCount || 0) + (item.mappingCount || 0)
      })).reverse()
    }
    
    // 初始化图表
    initLineChart(data.trendData || [])
    initPieChart(data.categoryStats || [])
  } catch (error) {
    console.error('加载统计数据失败', error)
  } finally {
    loading.value = false
  }
}

const initLineChart = (trendData) => {
  if (!lineChartRef.value) return
  
  lineChart = echarts.init(lineChartRef.value)
  
  const dates = trendData.map(item => item.date).reverse()
  const pricingData = trendData.map(item => item.pricingCount).reverse()
  const mappingData = trendData.map(item => item.mappingCount).reverse()

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['报价数', '配对数'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '报价数',
        type: 'line',
        smooth: true,
        data: pricingData,
        itemStyle: { color: '#1a1f36' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(26, 31, 54, 0.3)' },
            { offset: 1, color: 'rgba(26, 31, 54, 0.05)' }
          ])
        }
      },
      {
        name: '配对数',
        type: 'line',
        smooth: true,
        data: mappingData,
        itemStyle: { color: '#3a5a8c' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(58, 90, 140, 0.3)' },
            { offset: 1, color: 'rgba(58, 90, 140, 0.05)' }
          ])
        }
      }
    ]
  }

  lineChart.setOption(option)
}

const initPieChart = (categoryStats) => {
  if (!pieChartRef.value) return
  
  pieChart = echarts.init(pieChartRef.value)
  
  const pieData = categoryStats.map((item, index) => ({
    value: item.value,
    name: item.name,
    itemStyle: { 
      color: ['#1a1f36', '#2d3561', '#3a5a8c', '#4a7ab0', '#5a8ac0'][index % 5] 
    }
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: pieData
      }
    ]
  }

  pieChart.setOption(option)
}

const handleResize = () => {
  lineChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  loadDashboardStats()
  window.addEventListener('resize', handleResize)
})

watch(chartRange, () => {
  loadDashboardStats()
})
</script>

<style scoped>
.home-container {
  padding-bottom: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 22px;
  color: #303133;
}

.welcome-text {
  margin: 0;
  color: #909399;
  font-size: 14px;
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
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.stat-icon.pricing {
  background: linear-gradient(135deg, #1a1f36 0%, #2d3561 100%);
}

.stat-icon.mapping {
  background: linear-gradient(135deg, #3a5a8c 0%, #4a7ab0 100%);
}

.stat-icon.products {
  background: linear-gradient(135deg, #5a7a3c 0%, #7aa05c 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.stat-change {
  font-size: 12px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.stat-change.up {
  color: #67C23A;
}

.stat-change.down {
  color: #F56C6C;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 380px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 280px;
}

.task-card {
  margin-top: 20px;
}
</style>
