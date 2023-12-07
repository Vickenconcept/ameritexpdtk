import React, { useState, useRef, useEffect, useMemo } from "react"
import PropTypes from 'prop-types'
import { Link } from "react-router-dom"
import { Dropdown, DropdownToggle, DropdownMenu, Row, Col, Tooltip } from "reactstrap"
import SimpleBar from "simplebar-react"
//i18n
import { withTranslation } from "react-i18next"

import { useNetStatus } from "../../../context/net"
import { useLocalDB } from "../../../context/localDB"

import 'simplebar-react/dist/simplebar.min.css';

const DBDropdown = props => {
  // Declare a new state variable, which we'll call "menu"
  const [menu, setMenu] = useState(false)
  const ref = useRef();
  const scrollableNodeRef = React.createRef();
  const {isOnline, isManualOffline, setIsManualOffline} = useNetStatus()
  const {isDBReady, initDBs, isDBLoading, dbStatus} = useLocalDB()
  const [tooltipOpen, setTooltipOpen] = useState({})
  const toggleTooltipOpen = (id) => {
    setTooltipOpen({...tooltipOpen, [id]: !tooltipOpen[id] })
  }

  useEffect(()=>{
    ref.current.recalculate()
    scrollableNodeRef.current.scrollBottom = 0
  },[])

  const dbIcon = useMemo(() => {
    switch (dbStatus) {
      case "Ready":
        return "mdi mdi-database-check-outline"
        break;
      case "Loading":
        return "mdi mdi-database-refresh-outline"
        break;
      case "Error":
        return "mdi mdi-database-remove-outline"
        break;
      case "Synced":
        return "mdi mdi-database-sync-outline"
        break;
      case "Uploading":
        return "mdi mdi-database-arrow-up-outline"
        break;
      case "Downloading":
        return "mdi mdi-database-arrow-down-outline"
        break;
      default:
        return "mdi mdi-database-outline"
    }
    console.log (dbStatus)
  }, [dbStatus])

  const dbColor = useMemo (()=>{
    const green = '#009e54';
    const red = 'rgb(236,69,97)';
    const gray = null;
    switch (dbStatus) {
      case "Ready":
        return green
        break;
      case "Loading":
        return gray
        break;
      case "Error":
        return red
        break;
      case "Synced":
        return gray
        break;
      case "Uploading":
        return green
        break;
      case "Downloading":
        return green
        break;
      default:
        return gray
    }
  }, [dbStatus])

  const tooltipText = useMemo (()=>{
    switch (dbStatus) {
      case "Ready":
        return "Ready"
        break;
      case "Loading":
        return "Loading"
        break;
      case "Error":
        return "Error"
        break;
      case "Synced":
        return "Synced"
        break;
      case "Uploading":
        return "Uploading"
        break;
      case "Downloading":
        return "Downloading"
        break;
      default:
        return "Offline"
    }
  },[dbStatus])

  const noteText = useMemo (()=>{
    switch (dbStatus) {
        case "Ready":
          return "Local database is ready to use"
          break;
        case "Loading":
          return "Fetching data from backend to local database"
          break;
        case "Error":
          return "Something went wrong while fetching data from backend to local database. Please click the reload button to try again."
          break;
        case "Synced":
          return "Local dabatase is syncronized with backend"
          break;
        case "Uploading":
          return "Uploading data from local database to backend"
          break;
        case "Downloading":
          return "Downloading data from backend to local database"
          break;
        default:
          return "Offline"
      }
  }, [dbStatus])

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
          className="btn header-item noti-icon waves-effect border-right"
          tag="button"
          id="page-header-db-dropdown"
          // disabled={true}
        >
            <Tooltip
            target="db-status"
            placement="bottom"
            isOpen={tooltipOpen?.db}
            toggle={() => {toggleTooltipOpen('db')} }
            >
            {tooltipText}
            </Tooltip>
            <i id="db-status" className={dbIcon} style={{color:dbColor}}></i>
        </DropdownToggle>

        <DropdownMenu className="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0">
          <div className="p-3">
            <Row className="align-items-center">
              <Col>
                <h6 className="m-0 font-size-16"> {props.t("Local Database")}</h6>
              </Col>
            </Row>
          </div>

          <SimpleBar ref={ref} scrollableNodeProps={{ ref: scrollableNodeRef }} style={{ height: "230px" }} autoHide={false}>
            <div style={{padding:'30px'}}>{noteText}</div>
          </SimpleBar>
          <div className="p-2 border-top d-grid">
            <button
              className="btn btn-sm btn-link font-size-14 btn-block text-center"
              onClick={initDBs}
              // to="/production/timer"
            >
              <i className="mdi mdi-reload me-1"></i>
              {" "}
              Reload
            </button>
          </div>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  )
}

export default withTranslation()(DBDropdown)

DBDropdown.propTypes = {
  t: PropTypes.any
}