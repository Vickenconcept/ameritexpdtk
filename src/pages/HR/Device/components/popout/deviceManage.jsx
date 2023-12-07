import { useDevice } from "../../context/device.js"
import {getFormattedDate} from "../../../helpers/functions"
import { memo, useEffect, useMemo, useState } from "react"
import moment from "moment"
import { Row, Col } from "reactstrap"

import DeviceContent from './device_content.jsx'

import './style.scss'

export default ({item}) => {

    const {
        consts,
        getDeviceType,
        deviceAction,
        loading: deviceLoading,
        setLoading: setDeviceLoading,
        reloadAll,
        openEditModal,
    } = useDevice()

    const [loading, setLoading] = useState(false)

    let device = {...item}
    const device_type = getDeviceType(item?.type)

    const onDecommission = async () => {
        setDeviceLoading(true)
        await deviceAction.decommissionDevice(device?._id)
        reloadAll()
        setLoading (true)
        await getLogs()
        setLoading(false)
    }

    const onRecommission = async () => {
        setDeviceLoading(true)
        await deviceAction.recommissionDevice(device?._id)
        reloadAll()
        setLoading (true)
        await getLogs()
        setLoading(false)
    }

    const onDeleteDevice = async () => {
        setDeviceLoading(true)
        await deviceAction.deleteDevice(device?._id)
        reloadAll()
        setLoading (true)
        await getLogs()
        setLoading(false)
    }

    const [page, setPage] = useState(0)
    const [pageOption, setPageOption] = useState(7)
    const [search, setSearch] = useState('')

    // const logs = useMemo(() => {
    //     let logs = []
    //     for (let i = 0; i < 50; i++) {
    //         logs.push({
    //             date: '06/05/23',
    //             time: '12:03:43',
    //             action: i + 'VR Headset 2 is Checked out by Dylan Lorenz'
    //         })
    //     }
    //     return logs
    // },[])

    const [logs, setLogs] = useState([])

    const getLogs = async () => {
        let res = await deviceAction.getDeviceLogs(device?._id)
        setLogs(res?.data || [])
    }

    useEffect(async () => {
        setLoading (true)
        await getLogs()
        setLoading(false)
    },[device?._id])

    // useEffect(() => {
    //     setPage(0)
    // },[logs])

    const filteredLogs = useMemo(() => {
        let res = logs.filter(log => {
            return log?.note?.toLowerCase().includes(search.toLowerCase())
        })
        return res?.slice(page * pageOption, (page + 1) * pageOption)
    },[logs, page, pageOption, search])

    const totalPages = useMemo(() => {
        const tmp = Math.ceil(logs.length / pageOption)
        if (page > tmp) setPage(tmp)
        return tmp
    },[logs, pageOption])

    const onPagePrev = () => {
        if (page > 0) {
            setPage(page - 1)
        }
    }

    const onPageNext = () => {
        if (page < totalPages - 1) {
            setPage(page + 1)
        }
    }

    const openEdit = () => {
        openEditModal(device)
    }

    return (
        <div className="popout-request device-manage">
            <div className='dropdown-item'>
                <div className='dropdown-item-title'>
                    <div className='dropdown-item-title-text'>
                        {device?.name}
                    </div>
                </div>
                <div className='dropdown-item-body'>
                    <div className="dropdown-item-body-section">
                        <div className="dropdown-item-body-item">
                            <div className="dropdown-item-body-item-image">
                                <img src={device?.type?.image} />
                            </div>
                        </div>
                    </div>
                    <div className="dropdown-item-body-section">
                        <div className="dropdown-item-body-item">
                            <span className="dropdown-item-body-item-title">
                                Device Added:
                            </span>
                            {device?.createdAt ? moment(device?.createdAt)?.format('MM/DD/YY HH:mm:ss') : 'N/A'}
                        </div>
                        <div className="dropdown-item-body-item">
                            <span className="dropdown-item-body-item-title">
                                Type:
                            </span>
                            {device?.type?.name}
                        </div>
                        <div className="dropdown-item-body-item">
                            <span className="dropdown-item-body-item-title">
                                Name:
                            </span>
                            {device?.name}
                        </div>
                        <div className="dropdown-item-body-item">
                            <span className="dropdown-item-body-item-title">
                                Serial:
                            </span>
                            {device?.sn}
                        </div>
                        <div className="dropdown-item-body-item">
                            <span className="dropdown-item-body-item-title">
                                Last Updated:
                            </span>
                            {device?.lastUpdate ? moment(device?.lastUpdate)?.format('MM/DD/YY HH:mm:ss') : 'N/A'}
                        </div>
                        <div className="dropdown-item-body-item">
                            <span className="dropdown-item-body-item-title">
                                Added By:
                            </span>
                            {device?.created_by ? device?.created_by?.firstName + ' ' + device?.created_by?.lastName : 'N/A'}
                        </div>
                    </div>
                </div>
            </div>
            <div className="dropdown-item log-table-wrapper">
                <div className="dropdown-item-body log-list-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th width="*">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs?.map((log, index) => (
                                <tr key={index}>
                                    <td>{log?.createdAt ? moment(log?.createdAt)?.format('MM/DD/YY') : ''}</td>
                                    <td>{log?.createdAt ? moment(log?.createdAt)?.format('HH:mm:ss') : ''}</td>
                                    <td>{log?.note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="pagination">
                    <div className="pagination-item" onClick={onPagePrev}>
                        <i className="mdi mdi-chevron-left"></i>
                    </div>
                    {totalPages > 0 && 
                    <div className="pagination-info">
                        <div className="pagination-item active">
                            {page + 1}
                        </div>
                        of
                        <div className="pagination-item">
                            {totalPages}
                        </div>
                    </div>
                    }
                    <div className="pagination-item" onClick={onPageNext}>
                        <i className="mdi mdi-chevron-right"></i>
                    </div>
                </div>

                <div className="dropdown-item-action">
                    <div className="dropdown-item-action-item">
                        {device?.status == consts['DEVICE_STATUS_PENDING'] ? (
                            <button className="btn btn-error" disabled={deviceLoading} onClick={() => {onRecommission()}}>
                                Recommission
                            </button>
                        ) : (
                            <button className="btn btn-error" disabled={deviceLoading || device?.status !== consts['DEVICE_STATUS_IDLE']} onClick={() => {onDecommission()}} >
                                Decommission
                            </button>
                        )}
                    </div>
                    <div className="dropdown-item-action-item">
                        {!device?.history && 
                            <button className="btn btn-gray" disabled={deviceLoading} onClick={() => {onDeleteDevice()}}>
                                Delete Device
                            </button>
                        }
                    </div>
                    <div className="dropdown-item-action-item">
                        <button className="btn btn-primary" disabled={deviceLoading} onClick={() => {openEdit()}}>
                            Edit Device
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}