<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue'

const sColorMap = { active: 'success', inactive: 'warning', disabled: 'error' }
const sTextMap = { active: 'Active', inactive: 'Inactive', disabled: 'Disabled' }
const rColorMap = { admin: 'red', editor: 'blue', viewer: 'default' }
const rTextMap = { admin: 'Admin', editor: 'Editor', viewer: 'Viewer' }

const searchKeyword = ref('')
const filterStatus = ref(undefined)
const filterRole = ref(undefined)
const filterDate = ref(undefined)
const selectedRowKeys = ref([])
const modalVisible = ref(false)
const modalTitle = ref('')
const editingUserId = ref(null)
const loading = ref(false)
const tableLoading = ref(false)

const pagination = reactive({ current: 1, pageSize: 10, total: 0 })

const formState = reactive({ username: '', email: '', phone: '', role: 'viewer', status: 'active' })
const formRules = {
  username: [
    { required: true, message: 'Please input username' },
    { min: 2, max: 20, message: '2-20 characters' },
  ],
  email: [
    { required: true, message: 'Please input email' },
    { type: 'email', message: 'Invalid email address' },
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: 'Invalid phone number (e.g. 13812345678)' },
  ],
  role: [{ required: true, message: 'Please select a role' }],
  status: [{ required: true, message: 'Please select a status' }],
}

const columns = [
  { title: 'User', dataIndex: 'username', width: 200 },
  { title: 'Role', dataIndex: 'role', width: 100, align: 'center' },
  { title: 'Status', dataIndex: 'status', width: 110, align: 'center' },
  { title: 'Created', dataIndex: 'createdAt', width: 170 },
  { title: 'Action', key: 'action', width: 160, align: 'center' },
]

const allUsers = ref([])
const userList = computed(() => {
  let list = [...allUsers.value]
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter(
      u => u.username.toLowerCase().includes(kw) || u.email.toLowerCase().includes(kw)
    )
  }
  if (filterStatus.value) list = list.filter(u => u.status === filterStatus.value)
  if (filterRole.value) list = list.filter(u => u.role === filterRole.value)
  if (filterDate.value && filterDate.value.length === 2) {
    const [start, end] = filterDate.value
    list = list.filter(u => {
      const t = new Date(u.createdAt).getTime()
      return t >= start.valueOf() && t <= end.valueOf()
    })
  }
  pagination.total = list.length
  const start = (pagination.current - 1) * pagination.pageSize
  return list.slice(start, start + pagination.pageSize)
})

const avatars = [
  'Felix', 'Aneka', 'Salem', 'Mia', 'Leo', 'Jack', 'Chloe', 'Max',
  'Luna', 'Sage', 'Ollie', 'Raven', 'Blake', 'Quinn', 'Skyler',
  'Rowan', 'Ash', 'Bailey', 'Cameron', 'Drew',
]
const firstNames = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
  'Ivy', 'Jack', 'Kate', 'Leo', 'Mia', 'Noah', 'Olivia', 'Peter',
  'Quinn', 'Rose', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier', 'Yuki', 'Zoe',
]
const lastNames = [
  'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lee', 'Gonzalez', 'Wilson',
  'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'White',
]

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateMockUsers() {
  const users = []
  for (let i = 0; i < 86; i++) {
    const first = randomItem(firstNames)
    const last = randomItem(lastNames)
    const name = `${first} ${last}`
    users.push({
      id: i + 1,
      username: name,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      phone: `1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${first}`,
      role: randomItem(['admin', 'editor', 'viewer']),
      status: randomItem(['active', 'inactive', 'disabled']),
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 90 * 86400000)
      ).toISOString(),
    })
  }
  return users
}

onMounted(() => {
  tableLoading.value = true
  setTimeout(() => {
    allUsers.value = generateMockUsers()
    tableLoading.value = false
  }, 500)
})

function handleTableChange(pag) {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

function handleSearch() {
  pagination.current = 1
  selectedRowKeys.value = []
}

function handleReset() {
  searchKeyword.value = ''
  filterStatus.value = undefined
  filterRole.value = undefined
  filterDate.value = undefined
  pagination.current = 1
  selectedRowKeys.value = []
}

function openAddModal() {
  modalTitle.value = 'Add User'
  editingUserId.value = null
  Object.assign(formState, {
    username: '', email: '', phone: '', role: 'viewer', status: 'active',
  })
  modalVisible.value = true
}

function handleEdit(record) {
  modalTitle.value = 'Edit User'
  editingUserId.value = record.id
  Object.assign(formState, {
    username: record.username,
    email: record.email,
    phone: record.phone,
    role: record.role,
    status: record.status,
  })
  modalVisible.value = true
}

function handleDelete(record) {
  loading.value = true
  setTimeout(() => {
    allUsers.value = allUsers.value.filter(u => u.id !== record.id)
    loading.value = false
    message.success('User deleted')
  }, 300)
}

function handleBatchDelete() {
  const keys = [...selectedRowKeys.value]
  if (!keys.length) return
  loading.value = true
  setTimeout(() => {
    allUsers.value = allUsers.value.filter(u => !keys.includes(u.id))
    selectedRowKeys.value = []
    loading.value = false
    message.success(`Deleted ${keys.length} users`)
  }, 400)
}

function handleBatchStatus(status) {
  const keys = [...selectedRowKeys.value]
  if (!keys.length) return
  loading.value = true
  setTimeout(() => {
    allUsers.value = allUsers.value.map(u =>
      keys.includes(u.id) ? { ...u, status } : u
    )
    selectedRowKeys.value = []
    loading.value = false
    message.success(`Updated ${keys.length} users to ${status}`)
  }, 400)
}

function handleModalOk() {
  return new Promise(resolve => {
    setTimeout(() => {
      if (editingUserId.value) {
        const idx = allUsers.value.findIndex(u => u.id === editingUserId.value)
        if (idx !== -1) {
          allUsers.value[idx] = { ...allUsers.value[idx], ...formState }
        }
        message.success('User updated')
      } else {
        allUsers.value.unshift({
          id: Date.now(),
          ...formState,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formState.username.split(' ')[0] || 'User'}`,
          createdAt: new Date().toISOString(),
        })
        message.success('User created')
      }
      modalVisible.value = false
      resolve(true)
    }, 300)
  })
}

function formatDate(iso) {
  return new Date(iso).toLocaleString()
}
</script>

<template>
  <div class="user-mgmt">
    <div class="header">
      <h2 class="title">User Management</h2>
      <a-button type="primary" @click="openAddModal">
        <template #icon><PlusOutlined /></template>
        Add User
      </a-button>
    </div>

    <div class="filter-bar">
      <a-input
        v-model:value="searchKeyword"
        placeholder="Search name or email..."
        allow-clear
        style="width: 260px"
        @press-enter="handleSearch"
      >
        <template #prefix><SearchOutlined /></template>
      </a-input>

      <a-select
        v-model:value="filterStatus"
        placeholder="All Status"
        allow-clear
        style="width: 140px"
        @change="handleSearch"
      >
        <a-select-option value="active">Active</a-select-option>
        <a-select-option value="inactive">Inactive</a-select-option>
        <a-select-option value="disabled">Disabled</a-select-option>
      </a-select>

      <a-select
        v-model:value="filterRole"
        placeholder="All Roles"
        allow-clear
        style="width: 140px"
        @change="handleSearch"
      >
        <a-select-option value="admin">Admin</a-select-option>
        <a-select-option value="editor">Editor</a-select-option>
        <a-select-option value="viewer">Viewer</a-select-option>
      </a-select>

      <a-range-picker
        v-model:value="filterDate"
        style="width: 240px"
        @change="handleSearch"
      />

      <a-button @click="handleReset">
        <template #icon><ReloadOutlined /></template>
        Reset
      </a-button>
    </div>

    <div v-if="selectedRowKeys.length" class="batch-bar">
      <a-space>
        <span class="selected-count">{{ selectedRowKeys.length }} selected</span>
        <a-button size="small" @click="handleBatchStatus('active')">Activate</a-button>
        <a-button size="small" @click="handleBatchStatus('inactive')">Deactivate</a-button>
        <a-popconfirm
          title="Delete selected users?"
          ok-text="Delete"
          cancel-text="Cancel"
          @confirm="handleBatchDelete"
        >
          <a-button size="small" danger>
            <template #icon><DeleteOutlined /></template>
            Delete All
          </a-button>
        </a-popconfirm>
        <a-button size="small" @click="selectedRowKeys = []">Clear</a-button>
      </a-space>
    </div>

    <a-table
      :columns="columns"
      :data-source="userList"
      :row-key="record => record.id"
      :loading="tableLoading"
      :pagination="{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
        showTotal: total => `Total ${total} users`,
      }"
      :row-selection="{
        selectedRowKeys,
        onChange: keys => (selectedRowKeys = keys),
      }"
      size="middle"
      bordered
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, text, record }">
        <div v-if="column.dataIndex === 'username'" class="user-cell">
          <img :src="record.avatar" class="avatar" />
          <div>
            <div class="user-name">{{ record.username }}</div>
            <div class="user-email">{{ record.email }}</div>
          </div>
        </div>
        <div v-else-if="column.dataIndex === 'role'">
          <a-tag :color="rColorMap[text] || 'default'">
            {{ rTextMap[text] || text }}
          </a-tag>
        </div>
        <div v-else-if="column.dataIndex === 'status'">
          <a-badge :status="sColorMap[text] || 'default'" :text="sTextMap[text] || text" />
        </div>
        <span v-else-if="column.dataIndex === 'createdAt'">{{ formatDate(text) }}</span>
        <a-space v-else-if="column.key === 'action'">
          <a-button type="link" size="small" @click="handleEdit(record)">
            <template #icon><EditOutlined /></template>
            Edit
          </a-button>
          <a-popconfirm
            title="Delete this user?"
            ok-text="Delete"
            cancel-text="Cancel"
            @confirm="handleDelete(record)"
          >
            <a-button type="link" size="small" danger>
              <template #icon><DeleteOutlined /></template>
              Delete
            </a-button>
          </a-popconfirm>
        </a-space>
      </template>

      <template #emptyText>
        <a-empty description="No users found" />
      </template>
    </a-table>

    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      :confirm-loading="loading"
      :mask-closable="false"
      @ok="handleModalOk"
    >
      <a-form
        :model="formState"
        :rules="formRules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 19 }"
      >
        <a-form-item label="Username" name="username">
          <a-input v-model:value="formState.username" placeholder="Enter username" />
        </a-form-item>
        <a-form-item label="Email" name="email">
          <a-input v-model:value="formState.email" placeholder="Enter email" />
        </a-form-item>
        <a-form-item label="Phone" name="phone">
          <a-input v-model:value="formState.phone" placeholder="Enter phone number" />
        </a-form-item>
        <a-form-item label="Role" name="role">
          <a-select v-model:value="formState.role">
            <a-select-option value="admin">Admin</a-select-option>
            <a-select-option value="editor">Editor</a-select-option>
            <a-select-option value="viewer">Viewer</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Status" name="status">
          <a-select v-model:value="formState.status">
            <a-select-option value="active">Active</a-select-option>
            <a-select-option value="inactive">Inactive</a-select-option>
            <a-select-option value="disabled">Disabled</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.user-mgmt {
  padding: 24px;
  max-width: 1280px;
  margin: 0 auto;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.batch-bar {
  background: #e6f4ff;
  border: 1px solid #91caff;
  border-radius: 6px;
  padding: 8px 16px;
  margin-bottom: 12px;
}
.selected-count {
  font-weight: 500;
  color: #1677ff;
}
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.user-name {
  font-weight: 500;
  line-height: 1.3;
}
.user-email {
  font-size: 12px;
  color: #999;
  line-height: 1.3;
}
</style>
