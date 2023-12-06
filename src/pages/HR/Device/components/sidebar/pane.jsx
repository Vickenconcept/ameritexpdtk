import DeviceItem from './item.jsx'
import Dropdown from './dropdown.jsx'
import { useSidebar } from '../../context/sidebar.js'
import { useDevice } from '../../context/device.js'
import { useRef, useEffect, useState } from 'react'
import LogTable from './logTable.jsx'

export default ({tab, items, showPending, active, requests, item_type}) => {

    const {
        now,
        consts,
    } = useSidebar()

    const {
        device_types,
        canEdit,
    } = useDevice()

    const itemsRef = useRef({})
    const typeContextRef = useRef({})
    const [expanded, setExpanded] = useState({})

    useEffect (() => {
        
    },[items])

    const onTypeClick = (type) => {
        // console.log (type)
        if (typeContextRef.current[type]) {
            typeContextRef.current[type].classList.toggle('active')
            // typeContextRef.current[type].scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"})
        }
    }

    const onTypeCollapseClick = (type) => {
        if (items && items.length > 0 && itemsRef.current)
            items.filter(item => item.type._id == type).map((device, index) => {
                if (itemsRef.current[device._id]) {
                    // console.log (device._id, itemsRef.current[device._id])
                    if (expanded[type])
                        itemsRef.current[device._id]?.collapse()
                    else
                        itemsRef.current[device._id]?.expand()
                }
            })

        if (expanded[type]) typeContextRef.current[type].classList.remove('active')
        else typeContextRef.current[type].classList.add('active')

        setExpanded({...expanded, [type]: expanded[type]?false:true})
    }

    return (
        <div className={`device-sidebar-pane ${active ? 'active' : ''} pane-order-${tab?.id} `}>
            <div className='sidebar-header'>
                <div className='sidebar-header-title'>
                    <h3 className='flex-1 d-flex align-items-center'>
                        {tab?.title}
                        {/* <Dropdown className='d-inline-block' tabs={tabs} tab={tab} setTab={setTab} /> */}
                    </h3>
                    {tab?.pending > 0 && (['CHECKED-IN', 'CHECKED-OUT'].includes(tab?.name)) && (
                    <a className="d-flex align-items-center justify-content-center" style={{userSelect:'none'}} >
                        {/* <h3 className='text-second' style={{fontSize:'2rem', lineHeight:'18px'}}>
                            <i className={`mdi mdi-chevron-${showPending?'up':'down'}`}></i>
                        </h3> */}
                        <h3 className='text-success'>{tab?.pending} pending</h3>
                    </a>
                    )}
                </div>
                <p>
                    {tab?.subtitle}
                </p>
            </div>
            <div className='sidebar-items-container'>
                {(canEdit && showPending && requests && requests.length > 0) && (
                <div className='sidebar-item active'>
                    <div className='subtitle text-second'>
                        Pending Requests
                    </div>
                    <div className='sidebar-item-context' style={{overflow:'visible'}}>
                        {requests.map((item, index) => (
                            <DeviceItem 
                                key={`device_request_${tab.id}_${index}`}
                                type={'request'} 
                                now={now} 
                                item={item} 
                                consts={consts} 
                                status={'pending'} 
                                entry={item.createdAt} 
                                user={item.user} 
                            />
                        ))}
                    </div>
                </div>
                )}
                {
                    ['CHECKED-IN', 'CHECKED-OUT', 'DEVICES'].includes(tab?.name) && (
                        device_types?.map((device_type, index) => (
                            <div className='sidebar-item' data-id={device_type?._id} ref={ref => typeContextRef.current[device_type._id] = ref} key={`device_section_${tab?.id}_${device_type._id}`}>
                                <div className='subtitle' onClick={()=>onTypeClick(device_type?._id)}>
                                    <div className='subtitle-action'>
                                        <i className={`mdi mdi-chevron-right`}></i>
                                    </div>
                                    <div className="flex-1">
                                        {' '}
                                        {device_type?.name}
                                        &nbsp;
                                        <span className='text-gray'>({items?.filter(item => item.type._id == device_type._id).length})</span>
                                    </div>
                                    {item_type == 'device_manage' && (
                                        <div className='subtitle-action-checkbox'>
                                            <div className='text-comment'>
                                                Show All
                                            </div>
                                            <input type='checkbox' value={expanded[device_type?._id]} onChange={()=>onTypeCollapseClick(device_type._id)} />
                                        </div>
                                    )}
                                </div>
                                <div className='sidebar-item-context'>
                                    {items?.filter(item => item.type._id == device_type._id).map((device, index) => (<>
                                        <DeviceItem
                                            key={`device_item_${device_type._id}_${device._id}`}
                                            type={item_type}
                                            now={now}
                                            item={device}
                                            consts={consts}
                                            status={'pending'}
                                            entry={device.start_at}
                                            user={device.user}
                                            ref={ref => itemsRef.current[device._id] = ref}
                                        />
                                        </>
                                    ))}
                                </div>
                            </div>
                        ))
                    )
                }
                {tab?.name == 'SYSTEM LOG' &&
                <div className='sidebar-item active'>
                    <div className='subtitle'>
                        {tab?.name}
                    </div>
                    <div className='sidebar-item-context'>
                        <LogTable />
                    </div>
                </div>
                }
            </div>
        </div>
    )
}