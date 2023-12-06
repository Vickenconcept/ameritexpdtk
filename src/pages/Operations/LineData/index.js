import { useEffect, useRef, useState } from 'react';
import { cities, factories } from 'helpers/globals';
import MetaTags from 'react-meta-tags';
import {
  Container, Modal, ModalHeader, ModalBody, ModalFooter, Button
} from "reactstrap"
import "./style.scss"
import { getProducts } from 'actions/timer';
import { getUsers } from 'actions/auth';

import { useMemo } from 'react';

const LineData = (props) => {
  // authUser loading
  return <div className="page-content line-data">
    <MetaTags>
      <title>Line Data</title>
    </MetaTags>
    <Container fluid>
      <div className="line-data-page-container mt-5 w-100">
        <div className="p-0 m-0 w-100">
          <div className="page-content-header line-data-page-header">
            <div>
              <h2>Line Data</h2>
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
          
        </div>
      </div>
    </Container>
  </div>

}

export default LineData