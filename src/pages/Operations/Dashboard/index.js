import { useEffect, useRef, useState } from 'react';
import { cities, factories } from 'helpers/globals';
import MetaTags from 'react-meta-tags';
import {
  Container, Modal, ModalHeader, ModalBody, ModalFooter, Button
} from "reactstrap"
import "./style.scss"

import { connect } from "react-redux"
import { withRouter } from "react-router-dom"

const OperationsDashboard = (props) => {
  // authUser loading
  return <div className="page-content operations-dashboard">
    <MetaTags>
      <title>Operations Dashboard</title>
    </MetaTags>
    <Container fluid>
      <div className="operations-dashboard-page-container mt-5 w-100">
        <div className="p-0 m-0 w-100">
          <div className="page-content-header operations-dashboard-page-header">
            <div>
              <h2>Operations Dashboard</h2>
              <div className='sub-menu text-uppercase'>
                <span className="parent">Operations</span>
                <span className="mx-1"> &gt; </span>
                <span className='sub text-danger'>TEXAS</span>
              </div>
              <div className='divide-line d-flex align-items-center pt-5'>
                <div className='line'></div>
              </div>
            </div>
          </div>
          <div>
            {props.user.role == 'Sales' || props.user.role == 'HR' ?
              <h4 className='mt-5'>Not authorized to see content</h4> : ""}
          </div>
        </div>
      </div>
    </Container>
  </div>

}

const mapStatetoProps = state => {
  const user = state.Login.user
  return { user }
}

export default withRouter(connect(mapStatetoProps,{})(OperationsDashboard))
