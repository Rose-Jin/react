import { Tag, Timeline, Card, Row, Col } from 'antd'
import { SwapOutlined, GithubOutlined, BookOutlined, BugOutlined, RocketOutlined } from '@ant-design/icons'

const versions = [
  { version: 'v2.1.0', date: '2026-06-15', type: 'major', items: ['Multi-currency consolidation support', 'Real-time merge progress WebSocket', 'Role-based access control for merge operations'] },
  { version: 'v2.0.1', date: '2026-05-02', type: 'patch', items: ['Fix: GL mapping rule validation error on edge cases', 'Improve timeline rendering performance for large datasets'] },
  { version: 'v2.0.0', date: '2026-03-10', type: 'major', items: ['Account merge engine rewrite', 'New client tree with drag & drop reorganization', 'Batch merge operations', 'Export merge reports to PDF/Excel'] },
  { version: 'v1.5.0', date: '2025-12-20', type: 'feature', items: ['Audit trail for all merge operations', 'Custom mapping rule templates', 'Dashboard with merge analytics'] },
  { version: 'v1.3.2', date: '2025-09-08', type: 'patch', items: ['Fix pagination issue on merge list', 'UI accessibility improvements'] },
  { version: 'v1.3.0', date: '2025-07-15', type: 'feature', items: ['Add IFRS conversion project support', 'Year-over-year comparison view'] },
  { version: 'v1.0.0', date: '2025-04-01', type: 'major', items: ['Initial release', 'Basic account merge CRUD', 'Client tree structure', 'Merge status tracking'] },
]

const tagColor = { major: 'red', feature: 'blue', patch: 'green' }

export default function VersionIntro() {
  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #1677ff, #69b1ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 28,
          }}>
            <SwapOutlined />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>Account Merge System</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <Tag color="blue">v2.1.0</Tag>
              <span style={{ color: '#888', fontSize: 13 }}>Latest release: 2026-06-15</span>
            </div>
          </div>
        </div>
        <p style={{ color: '#666', margin: 0, lineHeight: 1.6 }}>
          Enterprise-grade multi-entity account consolidation platform. Supports cross-company
          account mapping, merge execution with real-time progress tracking, compliance reporting,
          and full audit trail across jurisdictions.
        </p>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { icon: <RocketOutlined />, label: 'Merge Engine', desc: 'High-performance rule-based account consolidation' },
          { icon: <BookOutlined />, label: 'Audit Trail', desc: 'Full immutable log of all merge operations' },
          { icon: <GithubOutlined />, label: 'Version Control', desc: 'Snapshot & rollback capability for merges' },
          { icon: <BugOutlined />, label: 'Validation', desc: 'Pre-merge data integrity checks with error reporting' },
        ].map(item => (
          <Col xs={12} sm={6} key={item.label}>
            <Card size="small" hoverable>
              <div style={{ fontSize: 22, color: '#1677ff', marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{item.desc}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title={
        <span style={{ fontSize: 16, fontWeight: 600 }}>Changelog</span>
      }>
        <Timeline
          items={versions.map(v => ({
            color: tagColor[v.type] || 'gray',
            children: (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{v.version}</span>
                  <Tag color={tagColor[v.type]} style={{ fontSize: 11, lineHeight: '18px' }}>
                    {v.type.toUpperCase()}
                  </Tag>
                  <span style={{ color: '#999', fontSize: 12 }}>{v.date}</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, color: '#555', fontSize: 13, lineHeight: 1.8 }}>
                  {v.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ),
          }))}
        />
      </Card>
    </div>
  )
}
