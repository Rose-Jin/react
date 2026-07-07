import { useState, useMemo } from 'react'
import { Card, Col, Row, Statistic, DatePicker, Radio } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, ShoppingCartOutlined, RiseOutlined, UserAddOutlined } from '@ant-design/icons'
import ReactEChartsCore from 'echarts-for-react'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

const iconStyle = { fontSize: 28, borderRadius: 12, padding: 8 }

const KPI_CARDS = [
  { key: 'gmv', title: 'GMV', icon: <DollarOutlined />, prefix: '$', color: '#1677ff', bg: '#e6f4ff' },
  { key: 'orders', title: 'Orders', icon: <ShoppingCartOutlined />, color: '#722ed1', bg: '#f9f0ff' },
  { key: 'conversion', title: 'Conversion Rate', icon: <RiseOutlined />, suffix: '%', color: '#13c2c2', bg: '#e6fffb', decimals: 2 },
  { key: 'users', title: 'User Growth', icon: <UserAddOutlined />, color: '#52c41a', bg: '#f6ffed' },
]

function generateData(days = 30) {
  const now = dayjs()
  const dates = []
  let gmv = 18200
  let orders = 320
  let users = 850
  for (let i = days - 1; i >= 0; i--) {
    gmv += Math.round((Math.random() - 0.42) * 3000)
    orders += Math.round((Math.random() - 0.4) * 40)
    users += Math.round((Math.random() - 0.38) * 60)
    dates.push({
      date: now.subtract(i, 'day').format('YYYY-MM-DD'),
      gmv: Math.max(gmv, 8000),
      orders: Math.max(orders, 100),
      users: Math.max(users, 400),
    })
  }
  return dates
}

function calcConversion(data) {
  return data.map(d => ({
    ...d,
    conversion: Math.round((d.orders / Math.max(d.users, 1)) * 10000) / 100,
  }))
}

export default function Dashboard() {
  const [allData] = useState(() => calcConversion(generateData(60)))
  const [dateRange, setDateRange] = useState([dayjs().subtract(29, 'day'), dayjs()])
  const [trendType, setTrendType] = useState('gmv')

  const data = useMemo(() => {
    const [start, end] = dateRange
    return allData.filter(d => {
      const t = dayjs(d.date)
      return t.isAfter(start.subtract(1, 'day')) && t.isBefore(end.add(1, 'day'))
    })
  }, [allData, dateRange])

  const kpis = useMemo(() => {
    if (!data.length) return { gmv: 0, orders: 0, conversion: 0, users: 0 }
    const first = data[0]
    const last = data[data.length - 1]
    const calc = (key, getVal) => {
      const cur = getVal(last)
      const prev = getVal(first)
      const pct = prev ? ((cur - prev) / prev * 100) : 0
      return { value: cur, change: Math.round(pct * 100) / 100, isUp: pct >= 0 }
    }
    return {
      gmv: calc('gmv', d => d.gmv),
      orders: calc('orders', d => d.orders),
      conversion: calc('conversion', d => d.conversion),
      users: calc('users', d => d.users),
    }
  }, [data])

  const dates = data.map(d => d.date)

  const trendOption = useMemo(() => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['GMV', 'Orders'], top: 0 },
    grid: { left: 50, right: 20, bottom: 30, top: 40 },
    xAxis: { type: 'category', data: dates, axisLabel: { rotate: 45, fontSize: 11 } },
    yAxis: [
      { type: 'value', name: 'GMV ($)', min: 0 },
      { type: 'value', name: 'Orders', min: 0 },
    ],
    series: [
      {
        name: 'GMV', type: 'line', smooth: true, data: data.map(d => d.gmv),
        itemStyle: { color: '#1677ff' }, areaStyle: { color: 'rgba(22,119,255,0.08)' },
        symbol: 'circle', symbolSize: 4,
      },
      {
        name: 'Orders', type: 'line', smooth: true, yAxisIndex: 1,
        data: data.map(d => d.orders), itemStyle: { color: '#722ed1' },
        areaStyle: { color: 'rgba(114,46,209,0.08)' },
        symbol: 'diamond', symbolSize: 4,
      },
    ],
  }), [data, dates])

  const conversionOption = useMemo(() => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Conversion Rate', 'User Growth'], top: 0 },
    grid: { left: 50, right: 50, bottom: 30, top: 40 },
    xAxis: { type: 'category', data: dates, axisLabel: { rotate: 45, fontSize: 11 } },
    yAxis: [
      { type: 'value', name: 'Rate (%)', min: 0, max: 20 },
      { type: 'value', name: 'Users', min: 0 },
    ],
    series: [
      {
        name: 'Conversion Rate', type: 'line', smooth: true, data: data.map(d => d.conversion),
        itemStyle: { color: '#13c2c2' }, areaStyle: { color: 'rgba(19,194,194,0.08)' },
        symbol: 'circle', symbolSize: 4,
      },
      {
        name: 'User Growth', type: 'bar', yAxisIndex: 1, barWidth: '40%',
        data: data.map(d => d.users), itemStyle: { color: 'rgba(82,196,26,0.6)', borderRadius: [4, 4, 0, 0] },
      },
    ],
  }), [data, dates])

  const barOption = useMemo(() => {
    const key = trendType
    const label = { gmv: 'GMV ($)', orders: 'Orders', conversion: 'Conversion (%)', users: 'Users' }[key]
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 50, right: 20, bottom: 30, top: 20 },
      xAxis: { type: 'category', data: dates, axisLabel: { rotate: 45, fontSize: 11 } },
      yAxis: { type: 'value', name: label },
      series: [{
        type: 'bar', barWidth: '50%', data: data.map(d => d[key]),
        itemStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: '#1677ff' }, { offset: 1, color: '#69b1ff' }],
          },
          borderRadius: [6, 6, 0, 0],
        },
      }],
    }
  }, [data, dates, trendType])

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>E-Commerce Dashboard</h2>
        <RangePicker
          value={dateRange}
          onChange={v => v && setDateRange(v)}
          allowClear={false}
          style={{ width: 260 }}
        />
      </div>

      <Row gutter={[16, 16]}>
        {KPI_CARDS.map(k => {
          const v = kpis[k.key]
          if (!v) return null
          return (
            <Col xs={12} sm={12} md={6} key={k.key}>
              <Card hoverable styles={{ body: { padding: 20 } }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Statistic
                    title={k.title}
                    value={v.value}
                    precision={k.decimals ?? 0}
                    prefix={k.prefix}
                    suffix={k.suffix}
                    valueStyle={{ fontSize: 26, fontWeight: 600 }}
                  />
                  <div style={{ background: k.bg, color: k.color, ...iconStyle }}>
                    {k.icon}
                  </div>
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: v.isUp ? '#52c41a' : '#ff4d4f' }}>
                  {v.isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  <span style={{ marginLeft: 4 }}>{Math.abs(v.change)}% vs last period</span>
                </div>
              </Card>
            </Col>
          )
        })}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="Revenue & Order Trend">
            <ReactEChartsCore option={trendOption} style={{ height: 320 }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Conversion & User Growth">
            <ReactEChartsCore option={conversionOption} style={{ height: 320 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title="Trend Analysis"
            extra={
              <Radio.Group value={trendType} onChange={e => setTrendType(e.target.value)} size="small">
                <Radio.Button value="gmv">GMV</Radio.Button>
                <Radio.Button value="orders">Orders</Radio.Button>
                <Radio.Button value="conversion">Conversion</Radio.Button>
                <Radio.Button value="users">Users</Radio.Button>
              </Radio.Group>
            }
          >
            <ReactEChartsCore option={barOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
