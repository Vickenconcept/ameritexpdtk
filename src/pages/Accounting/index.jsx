import { useEffect, useRef, useState } from 'react';
import { cities, factories } from 'helpers/globals';
import MetaTags from 'react-meta-tags';
import {
  Container, Modal, ModalHeader, ModalBody, ModalFooter, Button
} from "reactstrap"
import "./style.scss"
import { getProducts } from 'actions/timer';
import { getUsers } from 'actions/auth';

import { connect } from "react-redux"
import { withRouter } from "react-router-dom"

import { useMemo } from 'react';

const Accounting = (props) => {
  // authUser loading
  const user = props.user;

  return <div className="page-content accounting">
    <MetaTags>
      <title>Accounting Dashboard</title>
    </MetaTags>
    <Container fluid>
      <div className="accounting-page-container mt-5 w-100">
        <div className="p-0 m-0 w-100">
          <div className="page-content-header accounting-page-header">
            <div>
              <h2>Accounting Dashboard</h2>
              <div className='sub-menu text-uppercase'>
                <span className="parent">Accounting</span>
                <span className="mx-1"> &gt; </span>
                <span className='sub text-danger'>TEXAS</span>
              </div>
              <div className='divide-line d-flex align-items-center pt-5'>
                <div className='line'></div>
              </div>
            </div>
          </div>
          <div>
            {user.role == 'Personnel' || user.role == 'Sales' || user.role == 'HR' ?
              <h4 className='mt-5'>Not authorized to see content</h4> : ""}
          </div>

        </div>
      </div>
    </Container>
  </div>

}

const mapStatetoProps = state => {
  const { error, success } = state.Profile
  const user = state.Login.user
  return { error, success, user }
}

export default withRouter(connect(mapStatetoProps,{})(Accounting))