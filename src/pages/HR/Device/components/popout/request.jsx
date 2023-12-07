import { useDevice } from "../../context/device.js"
import {getFormattedDate} from "../../../helpers/functions"
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

    const device = item.device

    return (
        <div className="popout-request">
            <div className='dropdown-item'>
                <div className='dropdown-item-title'>
                    <div className='dropdown-item-title-text'>
                        {item.status == consts['DEVICE_HISTORY_STATUS_IN_PENDING'] && (
                            <>CHECK-IN INFORMATION</>
                        )}
                        {item.status == consts['DEVICE_HISTORY_STATUS_OUT_PENDING'] && (
                            <>CHECK-OUT INFORMATION</>
                        )}
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
                            <span className="dropdown-item-body-item-title">
                            Request Date:
                            </span>
                            {item?.createdAt?.substring(0,10) || ""}
                        </Col>

                    </Row>
                </div>
            </div>
        </div>
    )
}