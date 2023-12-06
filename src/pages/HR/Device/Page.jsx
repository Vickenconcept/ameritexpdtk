import SidebarContext from "./components/sidebar"
import DeviceItem from "./components/device"
import DeviceDetail from "./components/device/detail"
import { forwardRef } from "react"
import { useLoading } from "context/loading"
import { useMemo, useRef, useEffect, useState } from 'react';

import {useDevice, DeviceContext} from './context/device';

export default forwardRef((props, ref) => {
    const { loading, setLoading } = useLoading()
    const sidebarRef = useRef(null)

    const {
      device, 
      devices,
      device_types, 
      deviceAction, 
      reloadAll, 
      setDevice,
      user_devices,
      user_history,

      openNewModal,
      openAlert,
    } = useDevice()

    const user = props.user
    const canEdit = useMemo(() => (user ? (user?.role === "Admin" || (user?.role === "HR" && user.admin)) :  false ), [user])

    const onToggleSidebar = (e) => {
        e.preventDefault()
        if (sidebarRef.current) {
        sidebarRef.current.classList.toggle('visible')
        }
    }

    return (
        <div ref={ref} className="hr-dashboard-page-container mt-5 w-100">
          <div className="p-0 m-0 w-100">
            <div className="d-flex justify-content-between page-content-header adt-page-header">
              <div>
                <h2>Device Checkout</h2>
                <div className="sub-menu text-uppercase">
                  <span className="parent">Human Resources</span>
                  <span className="mx-1"> &gt; </span>
                  <span className="sub text-danger">TEXAS</span>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <div className="d-flex flex-column align-items-center border-left-right px-4">
                  <h3 className="mb-0">
                    {devices?.length || "0"}
                  </h3>
                  <div className="text-black-50">Device{devices?.length > 1 && `s`}</div>
                </div>
                {canEdit && (<>
                  <button
                    className="btn btn-new ms-3 btn-new-error"
                    onClick={openNewModal}
                  >
                    NEW DEVICE
                  </button>
                  {/* <button
                    className="btn btn-new ms-3 btn-new-error"
                    onClick={() => {
                      openDevTypeModal()
                    }}
                  >
                    ADD DEVICE TYPE
                  </button> */}
                  </>
                )}
              </div>
            </div>
            <div className="divide-line d-flex align-items-center pt-5">
              <div className="line"></div>
            </div>
          </div>
          <div className="mt-4">
            <div className='device-page-container'>
                <div className='float-sidebar-toggler'>
                  <button className='btn-toggle' onClick={onToggleSidebar}>
                    <i className='fa fa-book'></i>
                  </button>
                </div>
                <div className='container-main'>
                  <DeviceItem canEdit={canEdit} openAlert = {openAlert} user={user} />
                  <div className='row mt-3'>
                    {(user_devices && user_devices.length > 0) &&
                    <div className='col-12'>
                      <h3 className='text-uppercase ml-1'>DEVICES checked out - <span className='text-second'>{user_devices?.length || "0"}</span></h3>
                      {user_devices.length > 0 &&
                      <div className='paragraph-container'>
                        <p>
                          Listed devices you have checked out. Monitor your use term and get an admin or 
                          <br />
                          HR Director to check your device back in.
                        </p>
                        {user_devices.map((item, index) => {
                          return (<>
                            <DeviceDetail device={item} key={`user_device_${item?._id}`} />
                            
                          </>)
                        })}
                      </div>
                      }
                    </div>
                    }
                  </div>
                </div>
                <div className='container-sidebar' ref={sidebarRef}>
                  <button className='toggler' onClick={onToggleSidebar}>
                    <i className='mdi mdi-arrow-right'></i>
                  </button>
                  <SidebarContext user={user} canEdit={canEdit} />
                </div>
            </div>
          </div>
        </div>
    )
})