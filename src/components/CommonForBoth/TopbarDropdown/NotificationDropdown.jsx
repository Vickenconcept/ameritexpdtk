import React, { useState, useRef, useEffect, createRef } from "react"
import PropTypes from 'prop-types'
import { Link } from "react-router-dom"
import { Dropdown, DropdownToggle, DropdownMenu, Row, Col } from "reactstrap"
import SimpleBar from "simplebar-react"
import Notification from "./Notification"
//i18n
import { withTranslation } from "react-i18next"

import { useNotification } from "context/notification.js"
import 'simplebar-react/dist/simplebar.min.css';

const NotificationDropdown = props => {
  // Declare a new state variable, which we'll call "menu"
  const [menu, setMenu] = useState(false)
  const {notification, clearNotification} = useNotification()
  const ref = useRef();
  const scrollableNodeRef = React.createRef();

  useEffect(()=>{
    ref.current.recalculate()
    scrollableNodeRef.current.scrollBottom = 0
  },[notification])

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className="dropdown d-inline-block"
        tag="li"
        {...props}
        // style={{ left: "10%" }}
      >
        <DropdownToggle
          className="btn header-item noti-icon waves-effect"
          tag="button"
          id="page-header-notifications-dropdown"
          // disabled={true}
        >
          <i className="mdi mdi-bell-outline" style={{ fontSize: "40px" }}></i>
          {notification?.length > 0 && 
            <span className="badge bg-danger rounded-pill">{notification.length}</span>
          }
        </DropdownToggle>

        <DropdownMenu className="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0">
          <div className="p-3">
            <Row className="align-items-center">
              <Col>
                <h6 className="m-0 font-size-16"> {props.t("Notifications")} ({notification.length})</h6>
              </Col>
            </Row>
          </div>

          <SimpleBar ref={ref} scrollableNodeProps={{ ref: scrollableNodeRef }} style={{ height: "230px" }} autoHide={false}>
            {notification.map((item, idx)=>(
              <Notification item={item} idx={idx} key={"notification_"+idx} />
            ))
            }
          </SimpleBar>
          { notification?.length > 0 && 
          <div className="p-2 border-top d-grid">
            <button
              className="btn btn-sm btn-link font-size-14 btn-block text-center"
              onClick={clearNotification}
              // to="/production/timer"
            >
              <i className="mdi mdi-delete-circle me-1"></i>
              {" "}
              Remove all
            </button>
          </div>
          }
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  )
}

export default withTranslation()(NotificationDropdown)

NotificationDropdown.propTypes = {
  t: PropTypes.any
}