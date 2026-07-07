import { Layout, Menu } from 'antd'
import { ApartmentOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'

const { Sider, Content } = Layout

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { key: '/', icon: <ApartmentOutlined />, label: 'Merge Management' },
    { key: '/version', icon: <InfoCircleOutlined />, label: 'Version Intro' },
  ]

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider width={220} theme="light" style={{ borderRight: '1px solid #e8e8e8' }}>
        <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 15, borderBottom: '1px solid #e8e8e8' }}>
          <ApartmentOutlined style={{ marginRight: 8, color: '#1677ff' }} />
          Account Merge
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderInlineEnd: 'none' }}
        />
      </Sider>
      <Content style={{ overflow: 'auto' }}>
        <Outlet />
      </Content>
    </Layout>
  )
}
