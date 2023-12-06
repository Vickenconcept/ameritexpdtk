import { TimeDiffText } from "../util/index.js"
import ItemUser from './user.js'
import Dropdown from './dropdown.jsx'
import RequestPopout from '../popout/request.js'
import DevicePopout from '../popout/device.js'
import DeviceManagePopout from '../popout/deviceManage.js'
import { useMemo, useState, forwardRef, useImperativeHandle } from "react"
import { useDevice } from "../../context/device.js"

export default forwardRef(({now, item, status, entry, user, type}, ref) => {

    const entry_date = useMemo(() => {
        let t = Date.parse(entry)
        if (isNaN(t)) return null
        let tobj = new Date(t)
        return {
            year: tobj.getFullYear(),
            month: tobj.getMonth(),
            day: tobj.getDate(),
            hour: tobj.getHours(),
            minute: tobj.getMinutes(),
            second: tobj.getSeconds()
        }
    },[entry])

    const {
        device_types,
        deviceAction,
        reloadAll,
        loading: deviceLoading,
        setLoading: setDeviceLoading,
        consts,
    } = useDevice()

    const onClickApprove = async (e) => {
        console.log ({
            status: item.device?.status,
            consts
        })
        e.preventDefault()
        try {
            setDeviceLoading(true)
            if (item.device?.status == consts['DEVICE_STATUS_USING'])
                await deviceAction.checkinDeviceAllow(item.device._id, item._id)
            else if (item.device?.status == consts['DEVICE_STATUS_IDLE'])
                await deviceAction.checkoutDeviceAllow(item.device._id, item._id)
            else
                throw new Error('Unknown device action type')
        } catch (error) {
            console.log(error)
        } finally {
            setDeviceLoading(false)
            reloadAll()
        }
    }
    const onClickDeny = async (e) => {
        e.preventDefault()
        try {
            setDeviceLoading(true)
            if (item.device?.status == consts['DEVICE_STATUS_USING'])
                await deviceAction.checkinDeviceDeny(item.device._id, item._id)
            else if (item.device?.status == consts['DEVICE_STATUS_IDLE'])
                await deviceAction.checkoutDeviceDeny(item.device._id, item._id)
            else
                throw new Error('Unknown device action type')
        } catch (error) {
            console.log(error)
        } finally {
            setDeviceLoading(false)
            reloadAll()
        }
    }

    const [menu, setMenu] = useState(false)

    const collapse = () => {
        setMenu(false)
    }

    const expand = () => {
        setMenu(true)
    }

    // expose the function through ref
    useImperativeHandle(ref, () => ({
        expand,
        collapse,
    }));

    return (
        <>
        <div className={`sidebar-item-context-item ${
            type=='device_manage' ? (
            (item?.status === consts['DEVICE_STATUS_PENDING']) ? 'pending':
            (item?.status === consts['DEVICE_STATUS_USING']) ? 'using':
            (item?.status === consts['DEVICE_STATUS_IDLE']) ? 'idle':
            (item?.status === consts['DEVICE_STATUS_BROKEN']) ? 'broken':
            (item?.status === consts['DEVICE_STATUS_LOST']) ? 'lost':
            ''
            ) : ('')
        }`} ref={ref}>
            <Dropdown 
            disabled={ type === 'device_manage'}
            toggler={
                (user && type !== 'device_manage')?
                <ItemUser user={user} name={item?.status==consts['DEVICE_STATUS_USING'] ? item.name : null}/>
                :
                <div className='device-user' onClick={()=>setMenu(!menu)}>
                    <div className='avatar d-flex justify-content-center align-items-center'>
                        <i className={`fas fa-chevron-${menu?'down':'right'}`} style={{opacity: type !== 'device_manage' ? 0 : 1}}></i>
                    </div>
                    <div className='name'>
                        {item?.name}
                    </div>
                </div>
            }>
                {type=='device' && (
                    <DevicePopout item={item} />
                )}
                {type=='request' && (
                    <RequestPopout item={item} />
                )}
            </Dropdown>
            
            {type=='device' && (
                (user && item.status == consts['DEVICE_STATUS_USING']) ?
                <div className='info'>
                    <div className='info-status'>
                        <div className=''>0</div>
                        <div className='me-1'>
                            <i className='fas fa-comments'></i>
                        </div>
                    </div>
                    <div className='info-timer'>
                        <TimeDiffText now={now} entry={entry} />
                    </div>
                </div>
                :
                <div className='info'>
                    <div className='info-status'>
                        {item?.sn}
                    </div>
                </div>
            )}
            
            {type=='device_manage' && (
                <div className='info'>
                    <div className='info-status'>
                        {item?.sn}
                    </div>
                </div>
            )}
            {type=='request' && (
                <div className='info'>
                    <div className='info-timer'>
                        <a onClick={onClickApprove}>Approve</a>
                        <span style={{margin: '0 5px'}}>||</span>
                        <a onClick={onClickDeny}>Deny</a>
                    </div>
                </div>
            )}
        </div>
        {type=='device_manage' && (
            <div className={`dropdown-menu dropdown-menu-lg p-0 sidebar-header-dropdown device-manage-popup ${menu?'show':''}`}
                
            >
                <a className="close-popout" onClick={() => {setMenu(false)}}>
                    &times;
                </a>
                {menu &&
                <DeviceManagePopout item={item} />
                }
            </div>
        )}
        </>
    )
})