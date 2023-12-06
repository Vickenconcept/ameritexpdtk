import { createContext, useEffect, useRef, useState, useMemo } from 'react';
import { cities, factories } from 'helpers/globals';
import MetaTags from 'react-meta-tags';
import {
  Container, Modal, ModalHeader, ModalBody, ModalFooter, Button
} from "reactstrap"
import "./style.scss"

import { connect } from "react-redux"
import { withRouter } from "react-router-dom"

import { DeviceProvider } from './context/device';

import Page from './Page.js'

// import {devices, device_types} from './seed';

const DevicePage = (props) => {
  const user = props.user
  
  const canEdit = useMemo(() => (user ? (user?.role === "Admin" || (user?.role === "HR" && user.admin)) :  false ), [user])

  // authUser loading
  return <div className="page-content hr-dashboard">
    <MetaTags>
      <title>Device Checkout</title>
    </MetaTags>
    <Container fluid>
      <DeviceProvider user={props.user} canEdit={canEdit}>
        <Page user={props.user} />
      </DeviceProvider>
    </Container>
  </div>

}

const mapStatetoProps = state => {
  const user = state.Login.user
  return { user }
}

export default withRouter(connect(mapStatetoProps, {})(DevicePage))