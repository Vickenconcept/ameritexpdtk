import { useEffect, useRef, useState } from 'react';
import { cities, factories } from 'helpers/globals';
import MetaTags from 'react-meta-tags';
import {
  Container, Modal, ModalHeader, ModalBody, ModalFooter, Button
} from "reactstrap"
import "./style.scss"

import { getReports as getUserReport } from "actions/auth"
import { connect } from "react-redux"
import { withRouter } from "react-router-dom"
import { useMemo } from 'react';
import ReportLookup from "../Production/SystemCheck/components/ReportLookup.jsx"

import Select from "react-dropdown-select";

const options = [
  {
    id: 1,
    name: "Leanne Graham"
  },
  {
    id: 2,
    name: "Ervin Howell"
  }
];


const ProfileHome = (props) => {

  const [user_report, setUserReport] = useState()

  const loadUserReport = async () => {
    try {
      const res = await getUserReport()
      setUserReport(res)
    } catch (error) {
      console.log(error)
      setUserReport(null)
    }
  }

  useEffect(async () => {
    await loadUserReport()
  }, [])

  return <div className="page-content profile-home">
    <MetaTags>
      <title>{props.user.firstName + ' ' + props.user.lastName + ' Profile Home Page'}</title>
    </MetaTags>
    <Container fluid>
      <div className="profile-home-page-container mt-5 w-100">
        <div className="p-0 m-0 w-100">
          <div className="page-content-header profile-home-page-header">
            <div>
              <h2>{props.user.firstName + ' ' + props.user.lastName + ' Portal'}</h2>
              <div className='sub-menu text-uppercase'>
                <span className="parent">OverView</span>
                <span className="mx-1"> &gt; </span>
                <span className='sub text-danger'>TEXAS</span>
              </div>
              <div className='divide-line d-flex align-items-center pt-5'>
                <div className='line'></div>
              </div>
            </div>
          </div>
          <div>

            {user_report && (
              <ReportLookup
                report={user_report}
                user_report={user_report}
                pinnable={false}
                loadUserReport={loadUserReport}
                editable={false}
              />
            )}
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

export default withRouter(connect(mapStatetoProps, {})(ProfileHome))