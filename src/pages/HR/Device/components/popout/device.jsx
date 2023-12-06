import { useDevice } from "../../context/device.js"
import {getFormattedDate} from "helpers/functions"
import { memo, useEffect, useMemo } from "react"

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
        reloadAll
    } = useDevice()

    const device = item
    const device_type = getDeviceType(item?.type)

    return (
        <div className="popout-request">
            <div className='dropdown-item'>
                <div className='dropdown-item-title'>
                    <div className='dropdown-item-title-text'>
                        DEVICE INFORMATION
                    </div>
                </div>
                <div className='dropdown-item-body'>
                    <Row>
                        <Col xs={12} md={6} className="dropdown-item-body-item">
                            <span className="dropdown-item-body-item-title">
                                Device Type:
                            </span>
                            {device?.type?.name}
                        </Col>
                        
                        <Col xs={12} md={6} className="dropdown-item-body-item">
                            <span className="dropdown-item-body-item-title">
                                Device Serial:
                            </span>
                            {device?.sn}
                        </Col>
                        
                        <Col xs={12} md={6} className="dropdown-item-body-item">
                            <span className="dropdown-item-body-item-title">
                                Device Name:
                            </span>
                            {device?.name}
                        </Col>
                        
                        <Col xs={12} md={6} className="dropdown-item-body-item">
                            <span className="dropdown-item-body-item-title">
                                Last Updated:
                            </span>
                            {device?.updatedAt?.substring(0,10) || ""}
                        </Col>
                        
                        <Col xs={12} md={6} className="dropdown-item-body-item">
                            <div className="dropdown-item-body-item-title text-second">
                                Last Known User:
                            </div>
                            <div className="dropdown-item-body-item-title">
                                {device?.history?.user?.firstName || "UNKOWN"}
                                {` `}
                                {device?.history?.user?.lastName || ""}
                            </div>
                            <div className="dropdown-item-body-item-content text-gray">
                                {device?.history?.status == consts['DEVICE_HISTORY_STATUS_ENDED'] && (
                                    <>CHECKED-IN</>
                                )}
                                {device?.history?.status == consts['DEVICE_HISTORY_STATUS_APPROVED'] && (
                                    <>CHECKED-OUT</>
                                )}
                                {device?.history?.status == consts['DEVICE_HISTORY_STATUS_IN_PENDING'] && (
                                    <>CHECK-IN REQUESTED</>
                                )}
                                {` `}
                                {device?.history?.createdAt?.substring(0,10) || ""}
                            </div>
                        </Col>
                        
                        <Col xs={12} md={6} className="dropdown-item-body-item">
                            <div className="dropdown-item-body-item-image">
                                <img src={device?.type?.image} />
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    )
}