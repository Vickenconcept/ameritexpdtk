import { useEffect, useState, useMemo } from "react"
import { TimeDiffText } from "../util/index.js"
import { useDevice } from "../../context/device.js";
import moment from 'moment'
import DevicePostList from "./posts.js"

export default ({device}) => {

    const [now, setNow] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date().getTime());
        }, 1000);
        return () => clearInterval(interval);
    },[])

    const {
        deviceAction,
        loading: deviceLoading,
        setLoading: setDeviceLoading,
        consts,
        getDeviceType,
        reloadAll
    } = useDevice()

    const onCheckInClick = async (e) => {
        e.preventDefault()
        try {
            setDeviceLoading(true)
            await deviceAction.checkinDeviceRequest(device._id)
        } catch (error) {
            console.log(error)
        } finally {
            setDeviceLoading(false)
            await reloadAll()
        }
    }

    const onCancelClick = async (e) => {
        e.preventDefault()
        try {
            setDeviceLoading(true)
            await deviceAction.checkinDeviceCancel(device._id)
        } catch (error) {
            console.log(error)
        } finally {
            setDeviceLoading(false)
            await reloadAll()
        }
    }

    const [show, setShow] = useState(false)

    return (
        <>
        <div className='device-detail-container'>
            <div className='section left'>
                <div className='subtitle'>{device?.type?.name}</div>
                <div style={{marginLeft: '10px', flex: 1}}>
                    <h1 className='mb-0'>{device?.name}</h1>
                    <div className='divider-line' style={{opacity: 0}}></div>
                    <div style={{marginLeft: '10px'}}>
                    <div className='device-info-item'>
                        <span className='subtitle'>Date Checked Out :</span>
                        <span className='text-gray ms-1'>{device?.start_at ? moment(device?.start_at)?.format('YYYY-MM-DD') : ''}</span>
                    </div>
                    <div className='device-info-item'>
                        <span className='subtitle'>Headset Serial Number :</span>
                        <span className='text-gray ms-1'>{device?.sn}</span>
                    </div>
                    <div className='device-info-item'>
                        <span className='subtitle'>Approved By :</span>
                        <span className='text-gray ms-1'>{`${device?.history?.approved_by?.firstName || 'UNKNOWN'} ${device?.history?.approved_by?.lastName || ''}`}</span>
                    </div>
                    </div>
                </div>
            </div>
            <div className='section right'>
                <div className='subtitle text-gray text-right'>Total Time Checked Out</div>
                <div style={{marginLeft: '10px', flexGrow: 1}}>
                    <h1 className='text-right mb-0'>
                    <TimeDiffText now={now} entry={device?.start_at} />
                    </h1>
                    <div className='divider-line'></div>
                    <div className='device-info-container'>
                    <div className='device-info-item'>
                        <span className='subtitle'>Time Checked Out :</span>
                        <span className='text-gray ms-1'>{device?.start_at ? moment(device?.start_at)?.format('HH:mm:ss') : ''}</span>
                    </div>
                    <div className='device-info-item'>
                        <span className='subtitle'>Location :</span>
                        <span className='text-gray ms-1'>{device?.history?.city}</span>
                    </div>
                    <div className='device-info-item'>
                        <span className='subtitle'>Last Updated :</span>
                        <span className='text-gray ms-1'>Software update {device?.lastUpdate ? moment(device?.lastUpdate)?.format('MM/DD/YY') : 'N/A'}</span>
                    </div>
                    </div>
                </div>
                <div className='action-container'>
                    {device?.history?.status === consts['DEVICE_HISTORY_STATUS_APPROVED'] && (
                        <button className='btn btn-second' onClick={onCheckInClick} disabled={deviceLoading}>
                        Check-In
                        </button>
                    )}
                    {device?.history?.status === consts['DEVICE_HISTORY_STATUS_IN_PENDING'] && (
                        <button className='btn btn-second' onClick={onCancelClick} disabled={deviceLoading}>
                        Cancel Check-In
                        </button>
                    )}
                </div>
            </div>
        </div>
        <DevicePostList comments = {[1,2]} show={show} setShow={setShow} />
        </>
    )
}