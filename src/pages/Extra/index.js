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
const Extra = (props) => {

  return <div className="page-content production-tracker">
    <MetaTags>
      <title>Timer Page</title>
    </MetaTags>
    <Container fluid>
      <div className="jobslist-page-container mt-5 w-100">
        <div className="p-0 m-0 w-100">
          <div className="d-flex justify-content-between production-tracker-page-header">

          </div>
        </div>
      </div>
    </Container>
  </div>

}

export default Extra