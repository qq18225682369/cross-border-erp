<template>
  <div class="product-container">
    <div class="page-header">
      <h2>产品管理</h2>
    </div>

    <el-card>
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加产品
          </el-button>
          <el-button type="success" @click="crawlDialogVisible = true">
            <el-icon><Link /></el-icon>
            1688智能导入
          </el-button>
          <el-button type="warning" :disabled="selectedRows.length === 0" @click="handleProfitAnalysis">
            <el-icon><TrendCharts /></el-icon>
            利润分析
          </el-button>
          <el-button type="info" :disabled="selectedRows.length === 0" @click="handleBatchEdit">
            <el-icon><Edit /></el-icon>
            批量修改
          </el-button>
          <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出Excel
          </el-button>
          <el-button @click="importDialogVisible = true">
            <el-icon><Upload /></el-icon>
            导入Excel
          </el-button>
          <el-button @click="handleStockWarning">
            <el-icon><Warning /></el-icon>
            库存预警
          </el-button>
        </div>
      </div>

      <div class="filter-area">
        <el-select v-model="filters.categoryId" placeholder="产品分类" clearable style="width: 160px">
          <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <el-input v-model="filters.keyword" placeholder="产品名称/SKU" clearable style="width: 200px" @keyup.enter="handleSearch" />
        <el-select v-model="filters.isElectric" placeholder="是否带电" clearable style="width: 100px">
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>
        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 100px">
          <el-option label="在售" :value="1" />
          <el-option label="下架" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table
        :data="tableData"
        stripe
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="code" label="SKU" width="150">
          <template #default="{ row }">
            <el-tooltip :content="row.code" placement="top">
              <span class="sku-text">{{ row.code }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="image" label="图片" width="80">
          <template #default="{ row }">
            <div class="product-image-wrapper">
              <img 
                v-if="row.image" 
                :src="row.image" 
                class="product-image" 
                @error="(e) => e.target.style.display = 'none'" 
              />
              <div v-if="!row.image" class="product-image-placeholder">
                <el-icon :size="20"><Picture /></el-icon>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="产品名称" min-width="200">
          <template #default="{ row }">
            <div class="product-name">
              <span>{{ row.name }}</span>
              <el-link v-if="row.productLink" :href="row.productLink" target="_blank" type="primary" :underline="false" class="product-link">
                <el-icon><Link /></el-icon>查看
              </el-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="分类" width="140">
          <template #default="{ row }">
            <el-tag size="small">{{ row.categoryName || '-' }}</el-tag>
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
        <el-table-column prop="availableSize" label="尺码" width="100">
          <template #default="{ row }">
            <el-tooltip v-if="row.availableSize" :content="row.availableSize" placement="top">
              <span class="size-text">{{ row.availableSize }}</span>
            </el-tooltip>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="isElectric" label="带电" width="60" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isElectric ? 'warning' : 'info'" size="small">
              {{ row.isElectric ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="(row.stock || 0) < 10 ? 'danger' : 'success'" size="small">
              {{ row.stock || 0 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '在售' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="handlePricing(row)">报价</el-button>
            <el-button v-if="row.purchaseLink" type="primary" link size="small" @click="handlePurchaseLink(row)">采购</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="SKU" prop="code">
              <el-input v-model="formData.code" placeholder="请输入SKU">
                <template #append>
                  <el-button @click="generateCode">自动生成</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入产品名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品分类" prop="categoryId">
              <el-select v-model="formData.categoryId" placeholder="请选择分类" style="width: 100%">
                <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio :label="1">在售</el-radio>
                <el-radio :label="0">下架</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="采购价(¥)" prop="purchasePrice">
              <el-input-number v-model="formData.purchasePrice" :precision="2" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重量(kg)" prop="weight">
              <el-input-number v-model="formData.weight" :precision="2" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="可用尺码">
              <el-input v-model="formData.availableSize" placeholder="如: S-3XL" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="可用颜色">
              <el-input v-model="formData.availableColors" placeholder="多个颜色用逗号分隔" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否带电">
              <el-radio-group v-model="formData.isElectric">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="产品链接">
              <el-input v-model="formData.productLink" placeholder="请输入产品链接" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="采购链接">
              <el-input v-model="formData.purchaseLink" placeholder="请输入采购链接" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="formData.note" type="textarea" :rows="3" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导入Excel对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入Excel"
      width="600px"
    >
      <div class="import-content">
        <el-upload
          ref="uploadRef"
          class="upload-area"
          drag
          :auto-upload="false"
          :limit="1"
          accept=".xlsx,.xls"
          :on-change="handleFileChange"
          :on-exceed="handleExceed"
        >
          <el-icon class="el-icon--upload"><Upload /></el-icon>
          <div class="el-upload__text">
            将Excel文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">只能上传 xlsx/xls 文件</div>
          </template>
        </el-upload>
        
        <div class="import-preview" v-if="importData.length > 0">
          <h4>预览数据 (共{{ importData.length }} 条)</h4>
          <el-table :data="importData.slice(0, 5)" max-height="200" size="small">
            <el-table-column prop="code" label="SKU" width="120" />
            <el-table-column prop="name" label="产品名称" min-width="150" />
            <el-table-column prop="purchasePrice" label="采购价" width="80" />
            <el-table-column prop="weight" label="重量" width="80" />
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" :disabled="!importFile" @click="handleImportConfirm">
          确认导入
        </el-button>
      </template>
    </el-dialog>

    <!-- 1688智能导入对话框 -->
    <el-dialog
      v-model="crawlDialogVisible"
      title="AI智能识别（支持截图上传）"
      width="700px"
    >
      <div class="crawl-content">
        <el-form label-width="100px">
          <el-form-item label="1688链接">
            <el-input 
              v-model="crawlUrl" 
              placeholder="请输入1688产品链接（可选）"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="产品截图">
            <el-upload
              ref="imageUploadRef"
              action="#"
              :auto-upload="false"
              :on-change="handleImageChange"
              :show-file-list="false"
              accept="image/*"
            >
              <el-button type="primary">
                <el-icon><Picture /></el-icon>
                选择截图
              </el-button>
            </el-upload>
            
            <div v-if="crawlImage" class="image-preview">
              <el-image 
                :src="crawlImage" 
                style="width: 300px; height: 200px; margin-top: 10px;"
                fit="contain"
              />
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="success" 
              :loading="crawlLoading" 
              :disabled="!crawlImage"
              @click="handleRecognizeImage"
            >
              <el-icon><Link /></el-icon>
              AI识别图片
            </el-button>
          </el-form-item>
        </el-form>

        <div v-if="crawlResult" class="crawl-result">
          <el-divider content-position="left">识别结果</el-divider>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="SKU">{{ crawlResult.code }}</el-descriptions-item>
            <el-descriptions-item label="产品名称">{{ crawlResult.name }}</el-descriptions-item>
            <el-descriptions-item label="采购价(¥)">{{ crawlResult.purchasePrice }}</el-descriptions-item>
            <el-descriptions-item label="重量">{{ crawlResult.weight }} kg</el-descriptions-item>
            <el-descriptions-item label="尺码">{{ crawlResult.availableSize }}</el-descriptions-item>
            <el-descriptions-item label="颜色">{{ crawlResult.availableColors }}</el-descriptions-item>
            <el-descriptions-item label="分类">{{ crawlResult.categoryName }}</el-descriptions-item>
            <el-descriptions-item label="采购链接">
              <el-link :href="crawlResult.purchaseLink" target="_blank" type="primary">查看</el-link>
            </el-descriptions-item>
          </el-descriptions>
          
          <div class="crawl-image" v-if="crawlResult.image">
            <el-divider content-position="left">产品图片</el-divider>
            <el-image 
              :src="crawlResult.image" 
              style="width: 200px; height: 200px"
              fit="cover"
              :preview-src-list="[crawlResult.image]"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="crawlDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="crawlLoading" :disabled="!crawlResult" @click="handleSaveCrawlResult">
          保存产品
        </el-button>
      </template>
    </el-dialog>

    <!-- 利润分析对话框 -->
    <el-dialog v-model="profitDialogVisible" title="利润分析" width="800px">
      <div v-if="profitResult">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="产品名称">{{ profitResult.productName }}</el-descriptions-item>
          <el-descriptions-item label="采购价">¥{{ profitResult.purchasePrice?.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="售价">¥{{ profitResult.sellingPrice?.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="运费">¥{{ profitResult.shippingCost?.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="平台费">¥{{ profitResult.platformFee?.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="其他费用">¥{{ profitResult.otherCost?.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="总成本">
            <span style="color: #E6A23C; font-weight: bold;">¥{{ profitResult.totalCost?.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="利润">
            <span :style="{ color: profitResult.profit > 0 ? '#67C23A' : '#F56C6C', fontWeight: 'bold' }">
              ¥{{ profitResult.profit?.toFixed(2) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="利润率" :span="2">
            <el-progress 
              :percentage="parseFloat(profitResult.profitRate) || 0" 
              :color="parseFloat(profitResult.profitRate) > 20 ? '#67C23A' : '#E6A23C'"
              :stroke-width="20"
              :format="(p) => p + '%'"
            />
          </el-descriptions-item>
        </el-descriptions>
        <div style="margin-top: 20px; text-align: center;">
          <el-tag :type="profitResult.isProfitable ? 'success' : 'danger'" size="large">
            {{ profitResult.isProfitable ? '盈利产品' : '亏损产品' }}
          </el-tag>
        </div>
      </div>
      <div v-else>
        <el-form :model="profitForm" label-width="100px">
          <el-form-item label="售价">
            <el-input-number v-model="profitForm.sellingPrice" :min="0" :precision="2" />
          </el-form-item>
          <el-form-item label="运费">
            <el-input-number v-model="profitForm.shippingCost" :min="0" :precision="2" />
          </el-form-item>
          <el-form-item label="平台费">
            <el-input-number v-model="profitForm.platformFee" :min="0" :precision="2" />
          </el-form-item>
          <el-form-item label="其他费用">
            <el-input-number v-model="profitForm.otherCost" :min="0" :precision="2" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="profitDialogVisible = false">关闭</el-button>
        <el-button v-if="!profitResult" type="primary" @click="calculateProfit">计算利润</el-button>
      </template>
    </el-dialog>

    <!-- 批量修改对话框 -->
    <el-dialog v-model="batchEditDialogVisible" title="批量修改" width="500px">
      <el-form :model="batchEditForm" label-width="100px">
        <el-form-item label="修改字段">
          <el-select v-model="batchEditForm.field" placeholder="请选择要修改的字段">
            <el-option label="状态" value="status" />
            <el-option label="分类" value="categoryId" />
            <el-option label="是否带电" value="isElectric" />
            <el-option label="采购价" value="purchasePrice" />
            <el-option label="库存" value="stock" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="batchEditForm.field === 'status'" label="状态">
          <el-radio-group v-model="batchEditForm.value">
            <el-radio :label="1">在售</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="batchEditForm.field === 'categoryId'" label="分类">
          <el-select v-model="batchEditForm.value" placeholder="请选择分类">
            <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="batchEditForm.field === 'isElectric'" label="是否带电">
          <el-radio-group v-model="batchEditForm.value">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="batchEditForm.field === 'purchasePrice'" label="采购价">
          <el-input-number v-model="batchEditForm.value" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item v-if="batchEditForm.field === 'stock'" label="库存">
          <el-input-number v-model="batchEditForm.value" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchEdit">确认修改</el-button>
      </template>
    </el-dialog>

    <!-- 库存预警对话框 -->
    <el-dialog v-model="stockWarningDialogVisible" title="库存预警" width="800px">
      <el-alert type="warning" :closable="false" style="margin-bottom: 20px;">
        <template #title>
          以下产品库存低于预警阈值（10件），请及时补货
        </template>
      </el-alert>
      <el-table :data="stockWarningList" stripe>
        <el-table-column prop="code" label="SKU" width="150" />
        <el-table-column prop="name" label="产品名称" />
        <el-table-column prop="stock" label="当前库存" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.stock === 0 ? 'danger' : 'warning'">
              {{ row.stock }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.stock === 0 ? 'danger' : 'warning'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="quickAddStock(row)">补货</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 快速补货对话框 -->
    <el-dialog v-model="quickStockDialogVisible" title="快速补货" width="400px">
      <el-form :model="quickStockForm" label-width="100px">
        <el-form-item label="产品">
          <el-input :value="quickStockForm.productName" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input :value="quickStockForm.currentStock" disabled />
        </el-form-item>
        <el-form-item label="补货数量">
          <el-input-number v-model="quickStockForm.quantity" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="quickStockDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmQuickStock">确认补货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Download, Upload, Search, Link, Picture } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import { getProductList, addProduct, updateProduct, deleteProduct, batchDeleteProducts, getProductById, generateProductCode, crawl1688, recognizeProductImage } from '@/api/product'
import { getCategoryList } from '@/api/category'

const router = useRouter()

const loading = ref(false)
const tableData = ref([])
const categories = ref([])
const selectedRows = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const importDialogVisible = ref(false)
const importLoading = ref(false)
const importFile = ref(null)
const importData = ref([])
const uploadRef = ref(null)
const crawlDialogVisible = ref(false)
const crawlLoading = ref(false)
const crawlUrl = ref('')
const crawlResult = ref(null)
const crawlImage = ref('')
const imageUploadRef = ref(null)

// 新增功能变量
const profitDialogVisible = ref(false)
const profitResult = ref(null)
const profitForm = reactive({
  productId: null,
  sellingPrice: 0,
  shippingCost: 0,
  platformFee: 0,
  otherCost: 0
})

const batchEditDialogVisible = ref(false)
const batchEditForm = reactive({
  field: '',
  value: null
})

const stockWarningDialogVisible = ref(false)
const stockWarningList = ref([])

const quickStockDialogVisible = ref(false)
const quickStockForm = reactive({
  productId: null,
  productName: '',
  currentStock: 0,
  quantity: 10
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const filters = reactive({
  categoryId: null,
  keyword: '',
  isElectric: null,
  status: null
})

const formData = reactive({
  id: null,
  code: '',
  name: '',
  categoryId: null,
  image: '',
  productLink: '',
  purchaseLink: '',
  purchasePrice: 0,
  weight: 0,
  availableSize: '',
  availableColors: '',
  isElectric: 0,
  note: '',
  status: 1
})

const formRules = {
  code: [{ required: true, message: '请输入SKU', trigger: 'blur' }],
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  purchasePrice: [{ required: true, message: '请输入采购价', trigger: 'blur' }],
  weight: [{ required: true, message: '请输入重量', trigger: 'blur' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑产品' : '添加产品')

const loadCategories = async () => {
  try {
    const res = await getCategoryList()
    categories.value = res.data || []
  } catch (error) {
    console.error('加载分类失败', error)
  }
}

const loadProducts = async () => {
  loading.value = true
  try {
    const res = await getProductList({
      page: pagination.current,
      pageSize: pagination.size,
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

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: null,
    code: '',
    name: '',
    categoryId: null,
    image: '',
    productLink: '',
    purchaseLink: '',
    purchasePrice: 0,
    weight: 0,
    availableSize: '',
    availableColors: '',
    isElectric: 0,
    note: '',
    status: 1
  })
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  isEdit.value = true
  try {
    const res = await getProductById(row.id)
    Object.assign(formData, res.data)
    dialogVisible.value = true
  } catch (error) {
    console.error('获取产品详情失败', error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          await updateProduct(formData.id, formData)
          ElMessage.success('编辑成功')
        } else {
          await addProduct(formData)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadProducts()
      } catch (error) {
        console.error('保存失败', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除产品"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteProduct(row.id)
      ElMessage.success('删除成功')
      loadProducts()
    } catch (error) {
      console.error('删除失败', error)
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的${selectedRows.value.length}个产品吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = selectedRows.value.map(item => item.id)
      await batchDeleteProducts(ids)
      ElMessage.success('批量删除成功')
      loadProducts()
    } catch (error) {
      console.error('批量删除失败', error)
    }
  }).catch(() => {})
}

const handlePricing = (row) => {
  router.push({ path: '/pricing', query: { productId: row.id } })
}

const handlePurchaseLink = (row) => {
  if (row.purchaseLink) {
    window.open(row.purchaseLink, '_blank')
  }
}

const generateCode = async () => {
  try {
    const res = await generateProductCode()
    formData.code = res.data
  } catch (error) {
    console.error('生成编号失败', error)
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadProducts()
}

const handleReset = () => {
  filters.categoryId = null
  filters.keyword = ''
  filters.isElectric = null
  filters.status = null
  pagination.current = 1
  loadProducts()
}

// 导出Excel
const handleExport = () => {
  const exportData = tableData.value.map(item => ({
    'SKU': item.code,
    '产品名称': item.name,
    '分类': item.categoryName,
    '采购价(¥)': item.purchasePrice,
    '重量(kg)': item.weight,
    '可用尺码': item.availableSize,
    '可用颜色': item.availableColors,
    '是否带电': item.isElectric ? '是' : '否',
    '产品链接': item.productLink,
    '采购链接': item.purchaseLink,
    '状态': item.status === 1 ? '在售' : '下架'
  }))
  
  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '产品数据')
  
  const fileName = `产品数据_${new Date().toLocaleDateString()}.xlsx`
  XLSX.writeFile(workbook, fileName)
  
  ElMessage.success(`成功导出 ${exportData.length} 条数据`)
}

// 文件选择处理
const handleFileChange = (uploadFile) => {
  console.log('文件选择:', uploadFile)
  if (!uploadFile || !uploadFile.raw) {
    ElMessage.error('文件选择失败')
    return
  }
  importFile.value = uploadFile.raw
  parseExcelFile(uploadFile.raw)
}

// 文件超出限制处理
const handleExceed = () => {
  ElMessage.warning('只能上传一个文件')
}

// 解析Excel文件
const parseExcelFile = (file) => {
  console.log('开始解析Excel文件:', file.name)
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      
      // 先获取原始数据，找到表头行
      const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
      console.log('原始数据行数:', rawData.length)
      
      // 查找表头行（包含"Product"的行）
      let headerRowIndex = -1
      for (let i = 0; i < Math.min(10, rawData.length); i++) {
        const row = rawData[i]
        if (row && row.some(cell => String(cell) === 'Product')) {
          headerRowIndex = i
          break
        }
      }
      
      console.log('找到表头行:', headerRowIndex)
      
      if (headerRowIndex < 0) {
        ElMessage.error('未找到表头行，请检查Excel格式')
        return
      }
      
      // 获取表头
      const headers = rawData[headerRowIndex]
      console.log('表头:', headers)
      
      // 解析数据行（表头行之后）
      const jsonData = []
      for (let i = headerRowIndex + 1; i < rawData.length; i++) {
        const row = rawData[i]
        if (!row || !row.some(cell => cell !== undefined && cell !== null && cell !== '')) continue
        
        const obj = {}
        headers.forEach((header, index) => {
          if (header) {
            obj[header] = row[index]
          }
        })
        jsonData.push(obj)
      }
      
      console.log('解析结果:', jsonData.length, '条数据')
      
      if (jsonData.length === 0) {
        ElMessage.error('Excel文件没有数据')
        return
      }
      
      // 打印第一条数据
      console.log('第一条数据:', jsonData[0])
      
      // 列名映射
      importData.value = jsonData.map((row, index) => {
        const item = {
          code: row['命名编号'] || row['SKU'] || row['code'] || '',
          name: row['Product'] || row['产品名称'] || row['name'] || '',
          purchasePrice: parseFloat(row['采购价'] || row['采购价\rmb'] || 0),
          weight: parseFloat(row['重量'] || row['重量\rkg'] || 0),
          availableSize: row['Available size'] || row['尺码'] || '',
          availableColors: row['Available colors'] || row['颜色'] || '',
          isElectric: String(row['是否带电']).includes('是') ? 1 : 0,
          productLink: row['Product Link'] || row['产品链接'] || '',
          purchaseLink: row['采购链接'] || '',
          categoryId: null,
          status: 1
        }
        // 只打印前3条
        if (index < 3) {
          console.log(`第${index + 1}条转换:`, item)
        }
        return item
      })
      
      const validCount = importData.value.filter(i => i.name).length
      console.log('转换后数据:', importData.value.length, '条')
      console.log('有名称的产品数:', validCount)
      
      if (validCount === 0) {
        ElMessage.error('没有有效的产品数据，请检查Excel格式')
        return
      }
      
      ElMessage.success(`解析成功，共 ${validCount} 条有效数据`)
    } catch (error) {
      console.error('解析Excel失败', error)
      ElMessage.error('解析Excel文件失败: ' + error.message)
    }
  }
  reader.readAsArrayBuffer(file)
}

// 确认导入
const handleImportConfirm = async () => {
  if (importData.value.length === 0) {
    ElMessage.warning('没有可导入的数据')
    return
  }
  
  importLoading.value = true
  let successCount = 0
  let errorCount = 0
  
  try {
    for (let i = 0; i < importData.value.length; i++) {
      const item = importData.value[i]
      try {
        // 只要产品名称不为空就导入
        if (!item.name) {
          errorCount++
          continue
        }
        // 如果没有SKU，自动生成一个
        if (!item.code) {
          item.code = 'HS-' + Date.now() + '-' + successCount
        }
        // 为每个产品分配图片（循环使用可用图片）
        const imageIndex = (i % 1465) + 1
        item.image = `/images/products/image${imageIndex}.jpeg`
        
        await addProduct(item)
        successCount++
      } catch (error) {
        errorCount++
        console.error('导入失败:', item, error)
      }
    }
    
    ElMessage.success(`导入完成：成功 ${successCount} 条，失败 ${errorCount} 条`)
    importDialogVisible.value = false
    importData.value = []
    importFile.value = null
    if (uploadRef.value) {
      uploadRef.value.clearFiles()
    }
    loadProducts()
  } catch (error) {
    console.error('导入失败', error)
    ElMessage.error('导入失败: ' + error.message)
  } finally {
    importLoading.value = false
  }
}

// 处理图片选择
const handleImageChange = (uploadFile) => {
  const file = uploadFile.raw
  if (!file) return
  
  // 转换为base64
  const reader = new FileReader()
  reader.onload = (e) => {
    crawlImage.value = e.target.result
    console.log('图片已加载:', crawlImage.value.substring(0, 100))
  }
  reader.readAsDataURL(file)
}

// AI识别图片
const handleRecognizeImage = async () => {
  if (!crawlImage.value) {
    ElMessage.warning('请先上传产品截图')
    return
  }
  
  crawlLoading.value = true
  crawlResult.value = null
  
  try {
    const res = await recognizeProductImage(crawlImage.value, crawlUrl.value)
    if (res.code === 200) {
      crawlResult.value = res.data
      ElMessage.success('AI识别成功')
    } else {
      ElMessage.error(res.message || '识别失败')
    }
  } catch (error) {
    console.error('识别失败', error)
    ElMessage.error('识别失败: ' + error.message)
  } finally {
    crawlLoading.value = false
  }
}

// 保存1688识别结果
const handleSaveCrawlResult = async () => {
  if (!crawlResult.value) {
    ElMessage.warning('没有可保存的数据')
    return
  }

  crawlLoading.value = true
  try {
    await addProduct(crawlResult.value)
    ElMessage.success('保存成功')
    crawlDialogVisible.value = false
    crawlUrl.value = ''
    crawlResult.value = null
    crawlImage.value = ''
    if (imageUploadRef.value) {
      imageUploadRef.value.clearFiles()
    }
    loadProducts()
  } catch (error) {
    console.error('保存失败', error)
    ElMessage.error('保存失败: ' + error.message)
  } finally {
    crawlLoading.value = false
  }
}

const handleSizeChange = (size) => {
  pagination.size = size
  loadProducts()
}

const handleCurrentChange = (page) => {
  pagination.current = page
  loadProducts()
}

// ========== 新增功能方法 ==========

// 利润分析
const handleProfitAnalysis = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要分析的产品')
    return
  }
  if (selectedRows.value.length > 1) {
    ElMessage.warning('利润分析只能选择一个产品')
    return
  }
  profitForm.productId = selectedRows.value[0].id
  profitForm.sellingPrice = 0
  profitForm.shippingCost = 0
  profitForm.platformFee = 0
  profitForm.otherCost = 0
  profitResult.value = null
  profitDialogVisible.value = true
}

const calculateProfit = async () => {
  try {
    const res = await fetch('/api/products/profit-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profitForm)
    })
    const data = await res.json()
    if (data.code === 200) {
      profitResult.value = data.data
    } else {
      ElMessage.error(data.message || '计算失败')
    }
  } catch (error) {
    ElMessage.error('计算失败: ' + error.message)
  }
}

// 批量修改
const handleBatchEdit = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要修改的产品')
    return
  }
  batchEditForm.field = ''
  batchEditForm.value = null
  batchEditDialogVisible.value = true
}

const confirmBatchEdit = async () => {
  if (!batchEditForm.field) {
    ElMessage.warning('请选择要修改的字段')
    return
  }
  
  try {
    const productIds = selectedRows.value.map(row => row.id)
    const res = await fetch('/api/products/batch-update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productIds,
        updates: { [batchEditForm.field]: batchEditForm.value }
      })
    })
    const data = await res.json()
    if (data.code === 200) {
      ElMessage.success(data.message)
      batchEditDialogVisible.value = false
      loadProducts()
    } else {
      ElMessage.error(data.message || '修改失败')
    }
  } catch (error) {
    ElMessage.error('修改失败: ' + error.message)
  }
}

// 库存预警
const handleStockWarning = async () => {
  try {
    const res = await fetch('/api/products/stock-warning?threshold=10')
    const data = await res.json()
    if (data.code === 200) {
      stockWarningList.value = data.data.products
      stockWarningDialogVisible.value = true
    } else {
      ElMessage.error(data.message || '获取库存预警失败')
    }
  } catch (error) {
    ElMessage.error('获取库存预警失败: ' + error.message)
  }
}

// 快速补货
const quickAddStock = (row) => {
  quickStockForm.productId = row.id
  quickStockForm.productName = row.name
  quickStockForm.currentStock = row.stock
  quickStockForm.quantity = 10
  quickStockDialogVisible.value = true
}

const confirmQuickStock = async () => {
  try {
    const res = await fetch('/api/products/stock', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: quickStockForm.productId,
        stock: quickStockForm.quantity,
        operation: 'add'
      })
    })
    const data = await res.json()
    if (data.code === 200) {
      ElMessage.success('补货成功')
      quickStockDialogVisible.value = false
      handleStockWarning()
      loadProducts()
    } else {
      ElMessage.error(data.message || '补货失败')
    }
  } catch (error) {
    ElMessage.error('补货失败: ' + error.message)
  }
}

onMounted(() => {
  loadCategories()
  loadProducts()
})
</script>

<style scoped>
.product-container {
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
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.product-image-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  background: #f5f7fa;
}

.product-name {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-link {
  font-size: 12px;
}

.sku-text {
  font-family: monospace;
  font-size: 12px;
}

.size-text, .color-text {
  font-size: 12px;
}

.import-content {
  padding: 20px 0;
}

.upload-area {
  width: 100%;
}

.import-preview {
  margin-top: 20px;
}

.import-preview h4 {
  margin-bottom: 10px;
  color: #606266;
}
</style>
