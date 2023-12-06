import { useEffect, useRef, useState, useMemo } from "react"
import { cities, factories } from "../../../helpers/globals"
import MetaTags from "react-meta-tags"
import {
  Container,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle
} from "reactstrap"
import "./style.scss"
import { getReports as getUserReport } from "../../../actions/auth"

import "./style.scss"
import { connect } from "react-redux"
import { withRouter } from "react-router-dom"

// import apexChart
import LineApexChart from "./AllCharts/apex/chartapex"
import BarApexChart from "./AllCharts/apex/barchart"
import AreaChart from "./AllCharts/apex/areachart"
import DonutChart from "./AllCharts/apex/dountchart"
import StackedBarChart from "./AllCharts/apex/stackedbarchart"

import ReportLookup from "./components/ReportLookup"

const SystemCheck = props => {
  // authUser loading

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

  return (
    <div className="page-content system-check">
      <MetaTags>
        <title>System Check</title>
      </MetaTags>
      <Container fluid>
        <div className="system-check-page-container mt-5 w-100">
          <div className="p-0 m-0 w-100">
            <div className="page-content-header system-check-page-header">
              <div>
                <h2>System Check</h2>
                <div className="sub-menu text-uppercase">
                  <span className="parent">Production</span>
                  <span className="mx-1"> &gt; </span>
                  <span className="sub text-danger">TEXAS</span>
                </div>
                <div className="divide-line d-flex align-items-center pt-5">
                  <div className="line"></div>
                </div>
              </div>
            </div>
          </div>
          <ReportLookup
            report={null}
            user_report={user_report}
            pinnable={true}
            loadUserReport={loadUserReport}
            editable={true}
          />
          <Row style={{ marginTop: 2 }}>

            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 className="card-title mb-4">Production time per machine...</h4>
                    <a>
                      <i className='mdi mdi-pin-off-outline'></i>
                    </a>
                  </CardTitle>
                  <BarApexChart />
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 className="card-title mb-4">Coming Soon...</h4>
                    <a>
                      <i className='mdi mdi-pin-outline'></i>
                    </a>
                  </CardTitle>

                  <StackedBarChart />
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 className="card-title mb-4">Coming Soon...</h4>
                    <a>
                      <i className='mdi mdi-pin-outline'></i>
                    </a>
                  </CardTitle>
                  <LineApexChart />
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 className="card-title mb-4">Coming Soon...</h4>
                    <a>
                      <i className='mdi mdi-pin-outline'></i>
                    </a>
                  </CardTitle>
                  <AreaChart />
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 className="card-title mb-4">Coming Soon...</h4>
                    <a>
                      <i className='mdi mdi-pin-outline'></i>
                    </a>
                  </CardTitle>

                  <DonutChart />
                </CardBody>
              </Card>
            </Col>
          </Row>

        </div>
      </Container>
    </div>
  )
}

const mapStatetoProps = state => {
  const { error, success } = state.Profile
  const user = state.Login.user
  return { error, success, user }
}
export default withRouter(connect(mapStatetoProps, {})(SystemCheck))
