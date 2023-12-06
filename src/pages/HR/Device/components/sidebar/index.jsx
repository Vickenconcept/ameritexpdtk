import { useEffect, useState, useMemo } from "react"
import { useDevice } from '../../context/device.js'
import SidebarPane from './pane.js'
import CategoryMenu from './categoryMenu.jsx'

import Pane from "./pane.js";
import { SidebarContext } from "../../context/sidebar.js";

// This will have 8 different sub-parts

// CHECKED IN (Avaliable devices)
// CHECKED OUT (Using devices)
// PENDING CHECK IN (In request)
// PENDING CHECK OUT (Out request)
// DEVICE HISTORY (History of devices)
// USER HISTORY (History of user)
// DEVICE TYPE (Type of devices)
// DEVICE (Devices)

export default ({user}) => {
    
    const [now, setNow] = useState(0);
    const [items, setItems] = useState([])

    const {
        device_types,
        devices,
        requests,
        consts,
        canEdit,
    } = useDevice ()

    const out_devices = useMemo (() => {
        console.log ({canEdit})
        if (devices && consts && consts['DEVICE_STATUS_USING'] !== undefined) {
            let options = devices.filter(
                item => item.status == consts['DEVICE_STATUS_USING']
                // && item.user?._id != user?._id
            )
            return options
        }
        return []
    },[devices, consts['DEVICE_STATUS_USING'], user])

    const in_devices = useMemo (() => {
        if (devices && consts && consts['DEVICE_STATUS_IDLE'] !== undefined) {
            let options = devices.filter(
                item => item.status == consts['DEVICE_STATUS_IDLE']
                // && item.user?._id != user?._id
            )
            return options
        }
        return []
    },[devices, consts, user])

    const out_requests = useMemo (() => {
        return requests?.out || []
    },[requests])

    const in_requests = useMemo (() => {
        return requests?.in || []
    },[requests])

    const [tab, setTab] = useState()
    const [showPending, setShowPending] = useState(false)

    const tabs = useMemo(()=> {
        let tmp = [
            {
                id: 0, 
                name: 'CHECKED-OUT', 
                title: 'DEVICES CHECKED OUT',
                subtitle: 'Listed devices that are checked out, message the user to request access to the checked out device.',
                pending: out_requests?.length
            },
            {
                id: 1, 
                name: 'CHECKED-IN', 
                title: 'DEVICES CHECKED IN', 
                subtitle: 'Listed devices that are checked in and available for use. Please be sure to check if the device is in working condition',
                pending: in_requests?.length
            },
            {
                id: 2, 
                name: 'SYSTEM LOG', 
                subtitle: 'This log sectino keeps track of when the device is checked in and checked out including when the device is approved for checkout and approved for checkin. this can solve the issue later on when devices were handled.',
                title: 'Devices Global Log',
            },
        ]
        if (canEdit) {
            tmp.push(
            {
                id: 3, 
                name: 'DEVICES', 
                subtitle: 'Manage the device that is displayed to the company members.',
                title: 'Devices Management',
            })
        }
        return tmp;
    },[in_requests, out_requests])

    useEffect (()=>{
        if (tab?.name == 'CHECKED-OUT') {
            setShowPending (false)
            setItems(out_devices)
        } else if (tab?.name == 'CHECKED-IN') {
            setShowPending (false)
            setItems(in_devices)
        } else if (tab?.name == 'LOG') {
            setShowPending (false)
            setItems(requests)
        } else {
            setShowPending (false)
            setItems([])
        }
    },[tab, requests])

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date().getTime());
        }, 1000);
        return () => clearInterval(interval);
    },[])

    useEffect(()=>{setTab(prev=>{
        if (!prev?.id) return tabs[0]
        else return tabs.find(item=>item.id==prev.id)
    })},[tabs])

    return (
        <SidebarContext.Provider value={{
            tab, 
            setTab, 
            tabs, 
            showPending, 
            setShowPending, 
            now, 
            canEdit,
            items,
            setItems,
            in_devices,
            out_devices,
            in_requests,
            out_requests,
            consts,
        }}>
            <CategoryMenu tab={tab} setTab={setTab} tabs={tabs} />
            <div className={"pane-container "+`pane-position-${tab?.id}`}>
                <Pane tab={tabs[0]} item_type={"device"} items={out_devices} requests={out_requests} showPending={true} active={tab?.id == 0} />
                <Pane tab={tabs[1]} item_type={"device"} items={in_devices} requests={in_requests} showPending={true} active={tab?.id == 1} />
                <Pane tab={tabs[2]} item_type={"history"} items={requests} showPending={false} active={tab?.id == 2} />
                {canEdit && (
                    <Pane tab={tabs[3]} item_type={"device_manage"} items={devices} showPending={false} active={tab?.id == 3} manage={true} />
                )}
            </div>
        </SidebarContext.Provider>
    )
}