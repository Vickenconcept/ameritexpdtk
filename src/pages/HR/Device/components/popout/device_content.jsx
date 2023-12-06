import { useDevice } from "../../context/device"
import {getFormattedDate} from "helpers/functions"
import { memo, useMemo } from "react"

import './style.scss'

export default ({device}) => {

    const {
        consts,
        getDeviceType,
        deviceAction,
        loading: deviceLoading,
        setLoading: setDeviceLoading,
        reloadAll
    } = useDevice()

    const device_type = device?.type?.name || getDeviceType(device?.type)?.name || ""

    const entry_text = useMemo(() => {
        if (!device.createdAt) return null
        return getFormattedDate(device.createdAt)
        // let t = Date.parse(device.createdAt)
        // if (isNaN(t)) return null
        // let tobj = new Date(t)
        // return `${tobj.getFullYear()}-${tobj.getMonth()}-${tobj.getDate()}`
    },[device.createdAt])

    return (
        <>
            <div className='dropdown-item-body-item'>
                <div className='dropdown-item-body-item-title'>
                    <div className='dropdown-item-body-item-title-text'>
                        Device Type
                    </div>
                </div>
                <div className='drop down-item-body-item-value'>
                    {device_type}
                </div>
            </div>
            <div className='dropdown-item-body-item'>
                <div className='dropdown-item-body-item-title'>
                    <div className='dropdown-item-body-item-title-text'>
                        Name
                    </div>
                </div>
                <div className='drop down-item-body-item-value'>
                    {device?.name}
                </div>
            </div>
            <div className='dropdown-item-body-item'>
                <div className='dropdown-item-body-item-title'>
                    <div className='dropdown-item-body-item-title-text'>
                        Serial Number
                    </div>
                </div>
                <div className='drop down-item-body-item-value'>
                    {device?.sn}
                </div>
            </div>
            <div className='dropdown-item-body-item'>
                <div className='dropdown-item-body-item-title'>
                    <div className='dropdown-item-body-item-title-text'>
                        Date Added
                    </div>
                </div>
                <div className='drop down-item-body-item-value'>
                    {entry_text}
                </div>
            </div>
            <div className='dropdown-item-body-item'>
                <div className='dropdown-item-body-item-title'>
                    <div className='dropdown-item-body-item-title-text'>
                        Primary Location
                    </div>
                </div>
                <div className='drop down-item-body-item-value'>
                    {device?.city}
                </div>
            </div>
            <div className='dropdown-item-body-item'>
                <div className='dropdown-item-body-item-title'>
                    <div className='dropdown-item-body-item-title-text'>
                        Details
                    </div>
                </div>
                <div className='drop down-item-body-item-value'>
                    {device?.note}
                </div>
            </div>
        </>
    )
}