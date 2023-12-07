import { useCallback, useEffect, useMemo, useState } from "react";
import { connect } from "react-redux"

import { useDevice } from "../../context/device.jsx";
// import ActionDropdown from "./actions.jsx";
// import { set } from "lodash";
import moment from "moment";

const DeviceItem = ({ canEdit = false, openAlert, user }) => {

    const {
        device_types,
        device,
        device_type,
        device_options,
        onChangeDeviceType,
        onChangeDevice,
        reloadAll,
        loading: deviceLoading,
        setLoading: setDeviceLoading,
        consts,
        deviceAction,
    } = useDevice()

    // const [deviceHistory, setDeviceHistory] = useState()
    const [myStatus, setMyStatus] = useState()
    const [city, setCity] = useState("")

    useEffect(async () => {
        setCity("")
        // if (device) {
        //     try {
        //         setDeviceLoading (true)
        //         const res = await deviceAction.getDeviceHistory(device?._id)
        //         if (res?.history)
        //             setDeviceHistory(res.history)
        //         else
        //             setDeviceHistory ()
        //         if (res?.status)
        //             setMyStatus (res.status)
        //         else
        //             setMyStatus ()
        //     } catch (error) {
        //         console.log (error)
        //         setDeviceHistory ()
        //     } finally {
        //         setDeviceLoading (false)
        //     }
        // }
    }, [device])

    const deviceStatus = useMemo(() => {
        if (!device || !myStatus) return null;
        return myStatus
    }, [device, myStatus])

    useEffect(() => {
        console.log(deviceStatus)
    }, [deviceStatus])

    const historyType = useMemo(() => {
        if (device?.history) {
            switch (device?.history?.type) {
                case consts['DEVICE_ACTION_TYPE_OUT']:
                    return 'checked out'
                case consts['DEVICE_ACTION_TYPE_IN']:
                    return 'checked in'
                case consts['DEVICE_ACTION_TYPE_REGISTER']:
                    return 'registered'
                case consts['DEVICE_ACTION_TYPE_UPDATE']:
                    return 'updated'
            }
        }
        return 'UNKNOWN'
    }, [consts, device?.history])

    // const deviceLastActivity = useMemo(() => {
    //     if (device?.status != null && deviceHistory != null) {
    //         return {
    //             type: 'checked in',
    //             user: device?.history?.user,
    //             name: device?.history?.user?.firstName + ' ' + device?.history?.user?.lastName,
    //         }
    //     } else {
    //         return null
    //     }
    // },[
    //     device?.history?.type,
    //     device?.history?.status,
    //     device?.status,
    //     deviceHistory,
    // ])

    const deviceLastActivity = useMemo(() => {
        return {
            type: 'checked out',
            user,
            name: user?.firstName + ' ' + user?.lastName,
        }
    }, [user])

    const onRefresh = () => {
        reloadAll()
    }

    const onReset = () => {
        onChangeDeviceType({ target: { value: '' } })
        onChangeDevice({ target: { value: '' } })
    }

    const onCheckoutClick = async (e) => {
        try {
            setDeviceLoading(true)
            const res = await deviceAction.checkoutDeviceRequest(device._id, city)
            if (res.success) {
                openAlert('Success', 'Device checkout request sent successfully')
            }
        } catch (error) {
            openAlert('Error', error.response?.data?.error || error.message)
        } finally {
            setDeviceLoading(false)
            reloadAll()
        }
    }

    const onCancelClick = useCallback(async (e) => {
        try {
            setDeviceLoading(true)
            const res = await deviceAction.checkoutDeviceCancel(
                device._id,
                deviceStatus?.history?._id,
                {
                    _id: deviceStatus?.history?._id,
                }
            )
            if (res.success) {
                openAlert('Success', 'Device checkout cancelled successfully')
            }
        } catch (error) {
            openAlert('Error', error.response?.data?.error || error.message)
        } finally {
            setDeviceLoading(false)
            reloadAll()
        }
    }, [device, deviceStatus])

    const onCityChange = (e) => {
        setCity(e.target.value)
    }

    return (
        <div className='device-container'>
            <div className='device-header'>
                <div className='device-header-title'>
                    Check out an ameritex related device
                    {/* <h5>
                        <ActionDropdown />
                    </h5> */}
                </div>
                <div className='device-header-info'>
                    <select disabled={deviceLoading} onChange={onChangeDeviceType} className='device-info-item device-select device-type' name='device_type' value={device_type || ''}>
                        <option value='' disabled>Device Type</option>
                        {device_types.map((item, index) => (
                            <option key={`device_type_${index}`} value={item._id}>{item.name}</option>
                        ))}
                    </select>
                    <select disabled={deviceLoading} onChange={onChangeDevice} className='device-info-item device-select' name='device' value={device?._id || ''}>
                        <option value='' disabled>Select Device</option>
                        {device_options.map((item, index) => (
                            <option key={`device_${index}`} value={item._id}>{item.name}</option>
                        ))}
                    </select>
                    <div className="device-info-action">
                        <button onClick={onRefresh} className={`btn btn-icon ${deviceLoading ? 'loading' : ''}`}>
                            <i className='mdi mdi-refresh'></i>
                        </button>
                    </div>
                    <div className='device-info-item'>
                        <div className='device-info-item-title'>
                            Serial Number
                        </div>
                        <div className='device-info-item-value'>
                            {device?.sn || ''}
                        </div>
                    </div>
                    <div className='device-info-item'>
                        <div className='device-info-item-title text-second'>
                            Date Added
                        </div>
                        <div className='device-info-item-value'>
                            {device?.history?.createdAt ? moment(device?.history?.createdAt).format('YYYY-MM-DD') : ""}
                        </div>
                    </div>
                </div>
            </div>
            {(
                <div className={`device-body ${device ? 'show' : 'hide'}`}>
                    <div className='device-summary'>
                        {deviceLastActivity && (
                            <div className='device-summary-item'>
                                <div className='text-gray device-subtitle'>{deviceLastActivity?.type} by</div>
                                <div className='text-gray'>{deviceLastActivity?.user ? `${deviceLastActivity.user.firstName} ${deviceLastActivity.user.lastName}` : 'Unkown'}</div>
                            </div>
                        )}
                        <div className='device-summary-item' style={{ marginTop: '10px' }}>
                            <div className='text-second device-subtitle'>Primary Location</div>
                            <div className='text-uppercase'>
                                <a className="arrow-down text-second"></a>
                                {/* {device?.city?.toUpperCase() || 'UNKOWN'} */}
                                <select className="device-location-selector" value={city || ""} onChange={onCityChange} disabled={!device || deviceStatus?.status}>
                                    <option value="" disabled>Select City</option>
                                    <option value="Seguin">Seguin</option>
                                    <option value="Gunter">Gunter</option>
                                    <option value="Conroe">Conroe</option>
                                </select>
                            </div>
                        </div>
                        <div className='device-summary-item'>
                            <div className='text-second device-subtitle'>Last User</div>
                            <div className='text-uppercase'>
                                {device?.history?.user?.firstName || "NONE"}
                                {` `}
                                {device?.history?.user?.lastName || ""}
                            </div>
                            <div className='text-gray text-uppercase'>
                                {device?.history?.status == consts['DEVICE_HISTORY_STATUS_ENDED'] ? (
                                    <>CHECKED-IN</>
                                ) : device?.history?.status == consts['DEVICE_HISTORY_STATUS_APPROVED'] ? (
                                    <>CHECKED-OUT</>
                                ) : device?.history?.status == consts['DEVICE_HISTORY_STATUS_IN_PENDING'] ? (
                                    <>CHECK-IN REQUESTED</>
                                ) : (
                                    <span className='hidden'>{`NONE`}</span>
                                )}
                                {` `}
                                {device?.history?.createdAt ? moment(device?.history?.createdAt).format('MM/DD/YY') : ""}
                            </div>
                        </div>
                    </div>
                    <div className='device-context'>
                        <div className='device-context-title'>
                            <span className='device-subtitle'>inside look :&nbsp;</span>
                            <span style={{
                                // fontWeight: 'bold',
                                fontSize: '11px',
                            }}>
                                {device?.name || ''}
                            </span>
                        </div>
                        <div className='device-context-item'>
                            <div className='device-context-item-image'>
                                <img src={device?.type?.image} alt={device?.name} />
                            </div>
                        </div>
                        <div className='device-context-detail'>
                            <div className='device-context-detail-title'>
                                <span className='device-subtitle'>details</span>
                            </div>
                            <div className='device-context-detail-content'>
                                {device?.note || ''}
                            </div>
                            <div className='device-action-container'>
                                {/* {canEdit &&  
                            <button className='btn btn-second' disabled = {deviceLoading}>
                                Edit
                            </button>
                        } */}
                                {(deviceStatus?.status == 'out') ? (
                                    <button className='btn btn-second' disabled={deviceLoading} onClick={onCancelClick}>
                                        Cancel Check-out
                                    </button>
                                ) : (!deviceStatus?.status && (
                                    <button className='btn btn-second' disabled={deviceLoading || city == "" || !city || !device} onClick={onCheckoutClick}>
                                        Check-out
                                    </button>
                                ))}
                                <button onClick={onReset} className={`btn btn-icon`}>
                                    <i className='mdi mdi-refresh'></i>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
            {/* {(!device) && (
                <div className="d-flex justify-content-end">
                    <button onClick={onRefresh} className={`btn btn-icon ${deviceLoading?'loading':''}`}>
                        <i className='mdi mdi-refresh'></i>
                    </button>
                </div>
            )} */}
        </div>
    )
}

const mapStatetoProps = state => {
    const user = state.Login.user
    return { user }
}

export default connect(mapStatetoProps, {})(DeviceItem)