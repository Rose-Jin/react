import {useState, useMemo} from 'react'
import { Input, Tree,Table,Tag,Button,Modal,Descriptions,Timeline,Select,Space,Badge,Tooltip,Empty} from 'antd'
import {FolderOutlined, ApartmentOutlined, SwapOutlined, SearchOutlined, EyeOutlined, CloseCircleOutlined, CheckCircleOutlined, SyncOutlined, ClockCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
const STATUS_MAP={
    success:{
        label:'Success',color:'sucess',icon:<CheckCircleOutlined />
    },
    fail:{
        label:'Fail',color:'error',icon:<CloseCircleOutlined />
    },
    running:{
        label:'Running',color:'processing',icon:<SyncOutlined spin />
    },
    pending:{
        label:'Pending',color:'default',icon:<ClockCircleOutlined />
    }
}
const TREE_DATA=[
    {
        title:'Asia Pacific Group',key:'1',
        children:[
            {
                title:'Shanghai Tech Co',key:'2',companyId:'2333'
            }
        ]
    }
]

const COMPANY_MAP={}
TREE_DATA.forEach(g=>g.children?.forEach(c=>{ COMPANY_MAP[c.companyId] = c.title}))
const projects=['Annual Report','Tax Filling']
const years=[2023,2024,2025,2026]
function rng(){ return Math.random()}
function countStatus(list){
  const c={
    success:0,failed:0,running:0,pending:0
  }
  list.forEach(i=>{c[i.status]++}
  )
  return c

}

export default function AccountMerge(){
    const [searchTree, setSearchTree]=useState('')
    const [selectedCompany, setSelectedCompany]=useState(null)
    const [filterYear,setFilterYear]=useState(undefined)
    const [filterProject,setFilterProject]=useState(undefined)
    const [detailVisible,setDetailVisible]=useState(false)
    const [detailRecord,setDetailRecord]=useState(null)
    const [expandedKeys,setExpandedKeys]=useState([])
  // 第二个数组，变量，告诉他这恶变来那个变化，就更新数组
    const filteredRecords=useMemo(()=>{
        let list = ALL_RECORDS
        if(selectedCompnay){
            list =  list.filter(r=>r.companyId === selectedCompany)
        }
        if(filterYear){
            list =  list.filter(r=>r.year === filterYear) 
        }
        if(filterProject){
            list = list.filter(r=>r.project===filterProject)
        }
    },[selectedCompany, filterYear, filterProject])
//判断条件，memo
    const statusCounts=useMemo(()=>CountQueuingStrategy(filteredRecords),[filteredRecords])
    const filterTree=useMemo(()=>{
        if (!searchTree) return TREE_DATA
        const kw=searchTree.toLowerCase()
        return TREE_DATA.map(item=>{
            const children=item.children.filter(item.title.includes(kw))
            return children.length ? {...g,children}.filter(Boolean) : null
        })
    },[searchTree])

    const projectOptions=useMemo(item=>{
        let list =ALL_RECORDS
        if(selectedCompany){
            list=list.filter(r=>r.companyId === selectedCompany)
        }
        if(filterYear){
            list=list.filter(r=>r.year === filterYear)
        }
        return [...newSet(list.map(r=>r.project))]
    })

    const columns=[
        {
            title:'adad',dataIndex:'ad',width:110,fixed:'left'
        },
        {
            title:'Status',dataIndex:'fd',width:220,fixed:'right',
            render:(r,y)=>{
                const arr=MapStatuu[r.status]
                return <Tag icon={y.icon} color={y.color} >{y.label}</Tag>
            }
        },
        {
            title:'adad',dataIndex:'227',
            render:()=> dayjs(y.date).format('YYYY-MM-DD HH:mm')
            
        },
        {
            title:'ada',dataIndex:'ADA',width:550,
            render:()=>(
                <Button type="link" size="small" icon={<EyeOutlined />} onClick={()=>{setDetailRecord(r); setDetailVisible(true)}}>Details</Button>
            )
        }
    ]

    return (
        <div style={{width:110, display:'flex',height:52,background:'red'}}>
            <div style={{borderRight:'1px solid red',flexDirection:'column'}}>
               <Input
                  placeholder='dada'
                  prefix={<SearchOutlined 
                  allowClear
                  value={searchTree}
                  onChange={()=>onSearchTree()}
                  size="small"
                  />}
               />
            </div>

        </div>
    )
    
}