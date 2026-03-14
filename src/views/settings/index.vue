<template>
  <div class="settings-container">
    <div class="page-header">
      <h2>系统设置</h2>
    </div>

    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="用户管理" name="users">
        <div class="tab-toolbar">
          <el-button type="primary" @click="handleAddUser">
            <el-icon><Plus /></el-icon>
            添加用户
          </el-button>
        </div>
        <el-table :data="users" stripe v-loading="usersLoading">
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="nickname" label="昵称" width="120" />
          <el-table-column prop="role" label="角色" width="100">
            <template #default="{ row }">
              <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'">
                {{ row.role === 'admin' ? '管理员' : '普通用户' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="160" />
          <el-table-column prop="lastLoginTime" label="最后登录" width="160" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEditUser(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDeleteUser(row)" :disabled="row.role === 'admin'">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="渠道管理" name="channels">
        <div class="tab-toolbar">
          <el-button type="primary" @click="handleAddChannel">
            <el-icon><Plus /></el-icon>
            添加渠道
          </el-button>
        </div>
        <el-table :data="channels" stripe v-loading="channelsLoading">
          <el-table-column prop="name" label="渠道名称" width="150" />
          <el-table-column prop="code" label="渠道编码" width="120" />
          <el-table-column prop="type" label="渠道类型" width="100">
            <template #default="{ row }">
              <el-tag>{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="200" />
          <el-table-column prop="status" label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.status" :active-value="1" :inactive-value="0" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEditChannel(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDeleteChannel(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="分类管理" name="categories">
        <div class="tab-toolbar">
          <el-button type="primary" @click="handleAddCategory">
            <el-icon><Plus /></el-icon>
            添加分类
          </el-button>
        </div>
        <el-table :data="categories" stripe v-loading="categoriesLoading">
          <el-table-column prop="name" label="分类名称" width="180" />
          <el-table-column prop="code" label="分类编码" width="150" />
          <el-table-column prop="description" label="描述" min-width="200" />
          <el-table-column prop="sort" label="排序" width="80" align="center" />
          <el-table-column prop="productCount" label="产品数量" width="100" align="center">
            <template #default="{ row }">
              <el-tag type="info">{{ row.productCount || 0 }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEditCategory(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDeleteCategory(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="国家管理" name="countries">
        <div class="tab-toolbar">
          <el-button type="primary" @click="handleAddCountry">
            <el-icon><Plus /></el-icon>
            添加国家
          </el-button>
        </div>
        <el-table :data="countries" stripe v-loading="countriesLoading">
          <el-table-column prop="name" label="国家名称" width="120" />
          <el-table-column prop="code" label="国家编码" width="100" />
          <el-table-column prop="region" label="所属区域" width="100">
            <template #default="{ row }">
              <el-tag size="small">{{ row.region }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="currency" label="货币" width="80" />
          <el-table-column prop="exchangeRate" label="汇率" width="100" align="right">
            <template #default="{ row }">
              {{ row.exchangeRate ? row.exchangeRate.toFixed(4) : '0.0000' }}
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="80" align="center" />
          <el-table-column prop="status" label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.status" :active-value="1" :inactive-value="0" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEditCountry(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDeleteCountry(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="userDialogVisible" :title="userDialogTitle" width="500px">
      <el-form ref="userFormRef" :model="userForm" :rules="userRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="isEditUser" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEditUser">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="channelDialogVisible" :title="channelDialogTitle" width="500px">
      <el-form ref="channelFormRef" :model="channelForm" :rules="channelRules" label-width="80px">
        <el-form-item label="渠道名称" prop="name">
          <el-input v-model="channelForm.name" placeholder="请输入渠道名称" />
        </el-form-item>
        <el-form-item label="渠道编码" prop="code">
          <el-input v-model="channelForm.code" placeholder="请输入渠道编码" />
        </el-form-item>
        <el-form-item label="渠道类型" prop="type">
          <el-select v-model="channelForm.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="空运" value="空运" />
            <el-option label="海运" value="海运" />
            <el-option label="快递" value="快递" />
            <el-option label="陆运" value="陆运" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="channelForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="channelDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveChannel">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="categoryDialogVisible" :title="categoryDialogTitle" width="500px">
      <el-form ref="categoryFormRef" :model="categoryForm" :rules="categoryRules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类编码" prop="code">
          <el-input v-model="categoryForm.code" placeholder="请输入分类编码" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="categoryForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="1" :max="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="countryDialogVisible" :title="countryDialogTitle" width="500px">
      <el-form ref="countryFormRef" :model="countryForm" :rules="countryRules" label-width="80px">
        <el-form-item label="国家名称" prop="name">
          <el-input v-model="countryForm.name" placeholder="请输入国家名称" />
        </el-form-item>
        <el-form-item label="国家编码" prop="code">
          <el-input v-model="countryForm.code" placeholder="请输入国家编码" />
        </el-form-item>
        <el-form-item label="所属区域" prop="region">
          <el-select v-model="countryForm.region" placeholder="请选择区域" style="width: 100%">
            <el-option label="欧洲" value="欧洲" />
            <el-option label="北美" value="北美" />
            <el-option label="大洋洲" value="大洋洲" />
            <el-option label="亚太" value="亚太" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="货币" prop="currency">
          <el-input v-model="countryForm.currency" placeholder="请输入货币代码" />
        </el-form-item>
        <el-form-item label="汇率" prop="exchangeRate">
          <el-input-number v-model="countryForm.exchangeRate" :precision="4" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="countryForm.sort" :min="1" :max="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="countryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCountry">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getUserList, addUser, updateUser, deleteUser } from '@/api/user'
import { getChannelList, addChannel, updateChannel, deleteChannel } from '@/api/channel'
import { getCategoryList, addCategory, updateCategory, deleteCategory } from '@/api/category'
import { getCountryList, addCountry, updateCountry, deleteCountry } from '@/api/country'

const activeTab = ref('users')

const users = ref([])
const channels = ref([])
const categories = ref([])
const countries = ref([])

const usersLoading = ref(false)
const channelsLoading = ref(false)
const categoriesLoading = ref(false)
const countriesLoading = ref(false)

const userDialogVisible = ref(false)
const channelDialogVisible = ref(false)
const categoryDialogVisible = ref(false)
const countryDialogVisible = ref(false)
const isEditUser = ref(false)
const userFormRef = ref(null)
const channelFormRef = ref(null)
const categoryFormRef = ref(null)
const countryFormRef = ref(null)

const userForm = reactive({
  id: null,
  username: '',
  nickname: '',
  password: '',
  role: 'user',
  status: 1
})

const channelForm = reactive({
  id: null,
  name: '',
  code: '',
  type: '',
  description: '',
  status: 1
})

const categoryForm = reactive({
  id: null,
  name: '',
  code: '',
  description: '',
  sort: 1
})

const countryForm = reactive({
  id: null,
  name: '',
  code: '',
  region: '',
  currency: '',
  exchangeRate: 1,
  sort: 1,
  status: 1
})

const userRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const channelRules = {
  name: [{ required: true, message: '请输入渠道名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入渠道编码', trigger: 'blur' }],
  type: [{ required: true, message: '请选择渠道类型', trigger: 'change' }]
}

const categoryRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入分类编码', trigger: 'blur' }]
}

const countryRules = {
  name: [{ required: true, message: '请输入国家名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入国家编码', trigger: 'blur' }],
  region: [{ required: true, message: '请选择所属区域', trigger: 'change' }]
}

const userDialogTitle = computed(() => isEditUser.value ? '编辑用户' : '添加用户')
const channelDialogTitle = computed(() => channelForm.id ? '编辑渠道' : '添加渠道')
const categoryDialogTitle = computed(() => categoryForm.id ? '编辑分类' : '添加分类')
const countryDialogTitle = computed(() => countryForm.id ? '编辑国家' : '添加国家')

// 加载数据
const loadUsers = async () => {
  usersLoading.value = true
  try {
    const res = await getUserList()
    users.value = res.data || []
  } catch (error) {
    console.error('加载用户失败', error)
  } finally {
    usersLoading.value = false
  }
}

const loadChannels = async () => {
  channelsLoading.value = true
  try {
    const res = await getChannelList()
    channels.value = res.data || []
  } catch (error) {
    console.error('加载渠道失败', error)
  } finally {
    channelsLoading.value = false
  }
}

const loadCategories = async () => {
  categoriesLoading.value = true
  try {
    const res = await getCategoryList()
    categories.value = res.data || []
  } catch (error) {
    console.error('加载分类失败', error)
  } finally {
    categoriesLoading.value = false
  }
}

const loadCountries = async () => {
  countriesLoading.value = true
  try {
    const res = await getCountryList()
    countries.value = res.data || []
  } catch (error) {
    console.error('加载国家失败', error)
  } finally {
    countriesLoading.value = false
  }
}

// 监听tab切换，懒加载数据
watch(activeTab, (newTab) => {
  if (newTab === 'users' && users.value.length === 0) loadUsers()
  if (newTab === 'channels' && channels.value.length === 0) loadChannels()
  if (newTab === 'categories' && categories.value.length === 0) loadCategories()
  if (newTab === 'countries' && countries.value.length === 0) loadCountries()
})

// 用户操作
const handleStatusChange = (row) => {
  ElMessage.success(row.status === 1 ? '已启用' : '已禁用')
}

const handleAddUser = () => {
  isEditUser.value = false
  Object.assign(userForm, { id: null, username: '', nickname: '', password: '', role: 'user', status: 1 })
  userDialogVisible.value = true
}

const handleEditUser = (row) => {
  isEditUser.value = true
  Object.assign(userForm, { ...row, password: '' })
  userDialogVisible.value = true
}

const saveUser = async () => {
  await userFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        if (isEditUser.value) {
          await updateUser(userForm.id, userForm)
          ElMessage.success('编辑成功')
        } else {
          await addUser(userForm)
          ElMessage.success('添加成功')
        }
        userDialogVisible.value = false
        loadUsers()
      } catch (error) {
        console.error('保存失败', error)
      }
    }
  })
}

const handleDeleteUser = (row) => {
  ElMessageBox.confirm(`确定要删除用户"${row.username}"吗？`, '提示', { type: 'warning' }).then(async () => {
    try {
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      loadUsers()
    } catch (error) {
      console.error('删除失败', error)
    }
  }).catch(() => {})
}

// 渠道操作
const handleAddChannel = () => {
  Object.assign(channelForm, { id: null, name: '', code: '', type: '', description: '', status: 1 })
  channelDialogVisible.value = true
}

const handleEditChannel = (row) => {
  Object.assign(channelForm, { ...row })
  channelDialogVisible.value = true
}

const saveChannel = async () => {
  await channelFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        if (channelForm.id) {
          await updateChannel(channelForm.id, channelForm)
          ElMessage.success('编辑成功')
        } else {
          await addChannel(channelForm)
          ElMessage.success('添加成功')
        }
        channelDialogVisible.value = false
        loadChannels()
      } catch (error) {
        console.error('保存失败', error)
      }
    }
  })
}

const handleDeleteChannel = (row) => {
  ElMessageBox.confirm(`确定要删除渠道"${row.name}"吗？`, '提示', { type: 'warning' }).then(async () => {
    try {
      await deleteChannel(row.id)
      ElMessage.success('删除成功')
      loadChannels()
    } catch (error) {
      console.error('删除失败', error)
    }
  }).catch(() => {})
}

// 分类操作
const handleAddCategory = () => {
  Object.assign(categoryForm, { id: null, name: '', code: '', description: '', sort: 1 })
  categoryDialogVisible.value = true
}

const handleEditCategory = (row) => {
  Object.assign(categoryForm, { ...row })
  categoryDialogVisible.value = true
}

const saveCategory = async () => {
  await categoryFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        if (categoryForm.id) {
          await updateCategory(categoryForm.id, categoryForm)
          ElMessage.success('编辑成功')
        } else {
          await addCategory(categoryForm)
          ElMessage.success('添加成功')
        }
        categoryDialogVisible.value = false
        loadCategories()
      } catch (error) {
        console.error('保存失败', error)
      }
    }
  })
}

const handleDeleteCategory = (row) => {
  ElMessageBox.confirm(`确定要删除分类"${row.name}"吗？`, '提示', { type: 'warning' }).then(async () => {
    try {
      await deleteCategory(row.id)
      ElMessage.success('删除成功')
      loadCategories()
    } catch (error) {
      console.error('删除失败', error)
    }
  }).catch(() => {})
}

// 国家操作
const handleAddCountry = () => {
  Object.assign(countryForm, { id: null, name: '', code: '', region: '', currency: '', exchangeRate: 1, sort: 1, status: 1 })
  countryDialogVisible.value = true
}

const handleEditCountry = (row) => {
  Object.assign(countryForm, { ...row })
  countryDialogVisible.value = true
}

const saveCountry = async () => {
  await countryFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        if (countryForm.id) {
          await updateCountry(countryForm.id, countryForm)
          ElMessage.success('编辑成功')
        } else {
          await addCountry(countryForm)
          ElMessage.success('添加成功')
        }
        countryDialogVisible.value = false
        loadCountries()
      } catch (error) {
        console.error('保存失败', error)
      }
    }
  })
}

const handleDeleteCountry = (row) => {
  ElMessageBox.confirm(`确定要删除国家"${row.name}"吗？`, '提示', { type: 'warning' }).then(async () => {
    try {
      await deleteCountry(row.id)
      ElMessage.success('删除成功')
      loadCountries()
    } catch (error) {
      console.error('删除失败', error)
    }
  }).catch(() => {})
}

// 初始化加载用户数据
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.settings-container {
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

.tab-toolbar {
  margin-bottom: 16px;
}
</style>
