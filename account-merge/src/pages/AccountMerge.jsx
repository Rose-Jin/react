import { useState, useMemo } from 'react'
import { Input, Tree, Table, Tag, Button, Modal, Descriptions, Timeline, Select, Space, Badge, Tooltip, Empty } from 'antd'
import { FolderOutlined, ApartmentOutlined, SwapOutlined, SearchOutlined, EyeOutlined, CloseCircleOutlined, CheckCircleOutlined, SyncOutlined, ClockCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const STATUS_MAP = {
  success: { label: 'Success', color: 'success', icon: <CheckCircleOutlined /> },
  failed: { label: 'Failed', color: 'error', icon: <CloseCircleOutlined /> },
  running: { label: 'In Progress', color: 'processing', icon: <SyncOutlined spin /> },
  pending: { label: 'Pending', color: 'default', icon: <ClockCircleOutlined /> },
}

const TREE_DATA = [
  {
    title: 'Asia Pacific Group', key: '0-0',
    children: [
      { title: 'Shanghai Tech Co.', key: '0-0-0', isLeaf: true, companyId: 'C001' },
      { title: 'Tokyo Trading Ltd.', key: '0-0-1', isLeaf: true, companyId: 'C002' },
      { title: 'Singapore Holdings', key: '0-0-2', isLeaf: true, companyId: 'C003' },
    ],
  },
  {
    title: 'Europe Division', key: '0-1',
    children: [
      { title: 'London Financial', key: '0-1-0', isLeaf: true, companyId: 'C004' },
      { title: 'Berlin Auto Parts', key: '0-1-1', isLeaf: true, companyId: 'C005' },
    ],
  },
  {
    title: 'North America', key: '0-2',
    children: [
      { title: 'New York Digital', key: '0-2-0', isLeaf: true, companyId: 'C006' },
      { title: 'Silicon Valley AI', key: '0-2-1', isLeaf: true, companyId: 'C007' },
      { title: 'Toronto Resources', key: '0-2-2', isLeaf: true, companyId: 'C008' },
    ],
  },
  {
    title: 'Middle East & Africa', key: '0-3',
    children: [
      { title: 'Dubai Energy Corp', key: '0-3-0', isLeaf: true, companyId: 'C009' },
    ],
  },
]

const COMPANY_MAP = {}
TREE_DATA.forEach(g => g.children?.forEach(c => { COMPANY_MAP[c.companyId] = c.title }))

const PROJECTS = ['Annual Report', 'Tax Filing', 'Audit Preparation', 'IFRS Conversion', 'Internal Restructuring']
const YEARS = [2023, 2024, 2025, 2026]

function rng() { return Math.random() }

function generateRecords() {
  const ids = Object.keys(COMPANY_MAP)
  const records = []
  for (let i = 1; i <= 48; i++) {
    const cId = ids[i % ids.length]
    const st = rng()
    const status = st < 0.45 ? 'success' : st < 0.7 ? 'running' : st < 0.85 ? 'failed' : 'pending'
    const startedAt = dayjs().subtract(Math.floor(rng() * 60), 'day')
    const completedAt = (status === 'success' || status === 'failed')
      ? startedAt.add(Math.floor(rng() * 5) + 1, 'hour') : null
    const total = 4
    const merged = status === 'success' ? 4 : status === 'running' ? 2 : status === 'failed' ? 1 : 0
    const failFlag = status === 'failed'
    records.push({
      id: `MR-${String(i).padStart(4, '0')}`,
      companyId: cId,
      companyName: COMPANY_MAP[cId],
      project: PROJECTS[Math.floor(rng() * PROJECTS.length)],
      year: YEARS[Math.floor(rng() * YEARS.length)],
      status, startedAt: startedAt.toISOString(),
      completedAt: completedAt?.toISOString() ?? null,
      detail: {
        sourceAccounts: [
          { code: '1001', name: 'Cash & Bank' },
          { code: '2001', name: 'Accounts Receivable' },
          { code: '3001', name: 'Inventory' },
          { code: '4001', name: 'Fixed Assets' },
        ],
        targetAccount: `GL-${cId}-${startedAt.year()}`,
        rules: [
          { from: '1001', to: '1001', mapping: 'Direct Map' },
          { from: '2001', to: '1200', mapping: 'Receivables → Trade Receivables' },
          { from: '3001', to: '1400', mapping: failFlag ? 'ERROR: Schema mismatch' : 'Inventory → Stock' },
          { from: '4001', to: '1700', mapping: 'Assets → Fixed Assets' },
        ],
        totalAccounts: total,
        mergedAccounts: merged,
        log: [
          { time: dayjs(startedAt), msg: 'Merge started' },
          { time: dayjs(startedAt).add(30, 'minute'), msg: 'Validating source data...' },
          { time: dayjs(startedAt).add(50, 'minute'), msg: failFlag ? 'ERROR: Data mismatch in account 3001' : 'Mapping applied successfully' },
          { time: completedAt || dayjs(startedAt).add(80, 'minute'), msg: status === 'failed' ? 'Merge terminated' : status === 'success' ? 'Consolidation complete' : status === 'running' ? 'Processing...' : 'Queued' },
        ],
      },
    })
  }
  return records
}

const ALL_RECORDS = generateRecords()

function countStatuses(list) {
  const c = { success: 0, failed: 0, running: 0, pending: 0 }
  list.forEach(r => { c[r.status]++ })
  return c
}

export default function AccountMerge() {
  const [searchTree, setSearchTree] = useState('')
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [filterYear, setFilterYear] = useState(undefined)
  const [filterProject, setFilterProject] = useState(undefined)
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailRecord, setDetailRecord] = useState(null)
  const [expandedKeys, setExpandedKeys] = useState(['0-0', '0-1', '0-2', '0-3'])

  const filteredRecords = useMemo(() => {
    let list = ALL_RECORDS
    if (selectedCompany) list = list.filter(r => r.companyId === selectedCompany)
    if (filterYear) list = list.filter(r => r.year === filterYear)
    if (filterProject) list = list.filter(r => r.project === filterProject)
    return list
  }, [selectedCompany, filterYear, filterProject])

  const statusCounts = useMemo(() => countStatuses(filteredRecords), [filteredRecords])

  const filteredTree = useMemo(() => {
    if (!searchTree) return TREE_DATA
    const kw = searchTree.toLowerCase()
    return TREE_DATA.map(g => {
      const children = g.children?.filter(c => c.title.toLowerCase().includes(kw))
      return children?.length ? { ...g, children } : null
    }).filter(Boolean)
  }, [searchTree])

  const projectOptions = useMemo(() => {
    let list = ALL_RECORDS
    if (selectedCompany) list = list.filter(r => r.companyId === selectedCompany)
    if (filterYear) list = list.filter(r => r.year === filterYear)
    return [...new Set(list.map(r => r.project))]
  }, [selectedCompany, filterYear])

  const columns = [
    { title: 'Merge ID', dataIndex: 'id', width: 110, fixed: 'left' },
    { title: 'Company', dataIndex: 'companyName', width: 170 },
    { title: 'Project', dataIndex: 'project', width: 160 },
    { title: 'Year', dataIndex: 'year', width: 80, align: 'center' },
    {
      title: 'Status', dataIndex: 'status', width: 130, align: 'center',
      render: (_, r) => {
        const s = STATUS_MAP[r.status]
        return <Tag icon={s.icon} color={s.color}>{s.label}</Tag>
      },
    },
    {
      title: 'Started', dataIndex: 'startedAt', width: 170,
      render: v => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Action', key: 'action', width: 120, align: 'center', fixed: 'right',
      render: (_, r) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setDetailRecord(r); setDetailVisible(true) }}>
          Details
        </Button>
      ),
    },
  ]

  const detail = detailRecord?.detail

  return (
    <div style={{ display: 'flex', height: '100%', background: '#f5f5f5' }}>
      <div style={{ width: 280, minWidth: 280, background: '#fff', borderRight: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 16px 8px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ApartmentOutlined /> Client Tree
          </h3>
          <Input
            placeholder="Search clients..."
            prefix={<SearchOutlined />}
            allowClear
            value={searchTree}
            onChange={e => setSearchTree(e.target.value)}
            size="small"
          />
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
          {filteredTree.length === 0 ? (
            <Empty description="No matches" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 40 }} />
          ) : (
            <Tree
              treeData={filteredTree}
              selectedKeys={selectedCompany
                ? TREE_DATA.flatMap(g => g.children).filter(c => c.companyId === selectedCompany).map(c => c.key)
                : []
              }
              expandedKeys={expandedKeys}
              onExpand={setExpandedKeys}
              onSelect={(keys, { node }) => {
                if (node.isLeaf) {
                  setSelectedCompany(node.companyId === selectedCompany ? null : node.companyId)
                }
              }}
              style={{ padding: '0 8px' }}
            />
          )}
        </div>
        {selectedCompany && (
          <div style={{ padding: '8px 16px', borderTop: '1px solid #e8e8e8', fontSize: 12, color: '#888' }}>
            Selected: <strong>{COMPANY_MAP[selectedCompany]}</strong>
            <Button type="link" size="small" style={{ float: 'right' }} onClick={() => setSelectedCompany(null)}>Clear</Button>
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Merge Records</h2>
            <Badge count={filteredRecords.length} style={{ backgroundColor: '#1677ff' }} overflowCount={999} />
          </div>
          <Space>
            <Select
              placeholder="All Years" allowClear style={{ width: 130 }}
              value={filterYear}onChange={setFilterYear} 
              options={YEARS.map(y => ({ label: `${y}`, value: y }))}
            />
            <Select
              placeholder="All Projects" allowClear style={{ width: 180 }}
              value={filterProject} onChange={setFilterProject}
              options={projectOptions.map(p => ({ label: p, value: p }))}
            />
          </Space>
        </div>

        <div style={{ padding: '12px 24px 0', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {['success', 'failed', 'running', 'pending'].map(s => (
            <Tooltip key={s} title={`${statusCounts[s]} records`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'default' }}>
                <Tag color={STATUS_MAP[s].color} style={{ margin: 0 }}>{STATUS_MAP[s].label}</Tag>
                <span style={{ fontWeight: 500 }}>{statusCounts[s]}</span>
              </div>
            </Tooltip>
          ))}
          {selectedCompany && (
            <Button size="small" type="dashed" onClick={() => { setSelectedCompany(null); setFilterProject(undefined) }}>
              Clear Filter
            </Button>
          )}
        </div>

        <div style={{ flex: 1, padding: '8px 16px 16px', overflow: 'auto' }}>
          <Table
            columns={columns}
            dataSource={filteredRecords}
            rowKey="id"
            size="middle"
            scroll={{ x: 940 }}
            pagination={{
              pageSize: 20, showSizeChanger: true,
              showTotal: t => `Total ${t} records`,
              pageSizeOptions: ['10', '20', '50'],
            }}
          />
        </div>
      </div>

      <Modal
        title={<Space><SwapOutlined style={{ color: '#1677ff' }} /> Merge Details - {detailRecord?.id}</Space>}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        {detail && (
          <>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Company" span={2}>{detailRecord.companyName}</Descriptions.Item>
              <Descriptions.Item label="Project">{detailRecord.project}</Descriptions.Item>
              <Descriptions.Item label="Year">{detailRecord.year}</Descriptions.Item>
              <Descriptions.Item label="Status" span={2}>
                <Tag icon={STATUS_MAP[detailRecord.status].icon} color={STATUS_MAP[detailRecord.status].color}>
                  {STATUS_MAP[detailRecord.status].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Started">{dayjs(detailRecord.startedAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="Completed">
                {detailRecord.completedAt ? dayjs(detailRecord.completedAt).format('YYYY-MM-DD HH:mm') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Target Account">{detail.targetAccount}</Descriptions.Item>
              <Descriptions.Item label="Progress">{detail.mergedAccounts} / {detail.totalAccounts} accounts</Descriptions.Item>
            </Descriptions>

            <h4 style={{ marginBottom: 8, fontSize: 14 }}>Account Mapping Rules</h4>
            <Table
              dataSource={detail.rules}
              columns={[
                { title: 'Source Code', dataIndex: 'from', width: 120 },
                { title: 'Target Code', dataIndex: 'to', width: 120 },
                { title: 'Mapping Rule', dataIndex: 'mapping' },
              ]}
              rowKey="from"
              size="small"
              pagination={false}
              style={{ marginBottom: 20 }}
            />

            <h4 style={{ marginBottom: 8, fontSize: 14 }}>Merge Timeline</h4>
            <Timeline
              items={detail.log.map((entry, i) => ({
                color: i === detail.log.length - 1
                  ? detailRecord.status === 'success' ? 'green'
                    : detailRecord.status === 'failed' ? 'red'
                    : detailRecord.status === 'running' ? 'blue' : 'gray'
                  : 'gray',
                children: (
                  <div style={{ fontSize: 13 }}>
                    <span style={{ color: '#999', marginRight: 8 }}>{entry.time.format('YYYY-MM-DD HH:mm:ss')}</span>
                    <span>{entry.msg}</span>
                  </div>
                ),
              }))}
            />
          </>
        )}
      </Modal>
    </div>
  )
}
