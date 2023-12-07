import { useEffect, useContext } from "react"
// import { cities, factories } from "helpers/globals"
import { useState } from "react"
import MetaTags from "react-meta-tags"
import {
  Container,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Alert,
} from "reactstrap"
import Timer from "../components/Timer"
import {
  createTimerAction,
  endTimerAction,
  getProducts,
  startTimerAction,
  updateTimerAction,
} from "../../../actions/timer"
import { useMemo } from "react"
import "./style.scss"
import AutoCompleteSelect from "../../../components/Common/AutoCompleteSelect"
import { getCurrentTime } from "../../../helpers/functions"
import { CitySelect, FactoryList } from "../../../components/Common/Select"

import { LoadingContext } from "../../../context/loading"
import { control } from "leaflet"
const ControlTimer = props => {
  const [timers, setTimers] = useState([])
  const { loading, setLoading } = useContext(LoadingContext)
  const [filteredControllerTimers, setFilteredControllerTimers] = useState([])
  const [alert, setAlert] = useState({
    color: "success",
    text: "",
    visible: false,
  })
  useEffect(async () => {
    setLoading(true)
    const _timers = await getProducts("TimerContent", -1)

    setTimers(_timers.products)
    // console.log("TIMERS", _timers.products)
    setLoading(false)
  }, [])

  const [controlFilter, setControlFilter] = useState({
    city: "",
    factory: "",
  })
  const [controlTimer, setControlTimer] = useState("")
  const filterChanged = (field, e) => {
    setControlFilter({
      ...controlFilter,
      [field]: e.target.value,
    })
  }
  useEffect(() => {
    if (timers == undefined) return timers
    const _timers = timers.filter(
      timer =>
        timer.city == controlFilter.city &&
        timer.factory == controlFilter.factory
    );
    setFilteredControllerTimers(
      _timers
    )
    if(_timers[0]) setControlTimer(_timers[0]._id);
  }, [controlFilter, timers])
  const startTimerInController = async () => {
    setLoading(true)
    const res = await startTimerAction(controlTimer, controlFilter.city)
    if (res.status == 200)
      if(res.data.success == false)
        setAlert({
          color: "danger",
          text: res.data.msg,
          visible: true,
        })
      else setAlert({
        color: "info",
        text:
          filteredControllerTimers.find(element => element._id == controlTimer)
            .machine.name +
          " in " +
          controlFilter.city +
          " started successfully.",
        visible: true,
      })
    else
      setAlert({
        color: "danger",
        text:
          filteredControllerTimers.find(element => element._id == controlTimer)
            .machine.name +
          " in " +
          controlFilter.city +
          " starting failed.",
        visible: true,
      })
    setLoading(false)
  }
  const stopTimerInController = async () => {
    setLoading(true)
    const res = await endTimerAction(controlTimer)
    if (res.status == 200)
      setAlert({
        color: "info",
        text:
          filteredControllerTimers.find(element => element._id == controlTimer)
            .machine.name +
          " in " +
          controlFilter.city +
          " stopped successfully.",
        visible: true,
      })
    else
      setAlert({
        color: "danger",
        text:
          filteredControllerTimers.find(element => element._id == controlTimer)
            .machine.name +
          " in " +
          controlFilter.city +
          " stopping failed.",
        visible: true,
      })

    setLoading(false)
  }

  const startAllTimers = async () => {
    setLoading(true)
    const res = await startTimerAction(-1, controlFilter.city)
    if (res.status == 200)
      setAlert({
        color: "info",
        text: cnt + " timers in " + controlFilter.city + " started successfully.",
        visible: true,
      })
    else
      setAlert({
        color: "danger",
        text: "The timers in " + controlFilter.city + " starting fails.",
        visible: true,
      })
    setLoading(false)
  }

  const stopAllTimers = async () => {
    setLoading(true)
    const res = await endTimerAction(-1, controlFilter.city)
    if (res.status == 200)
      setAlert({
        color: "info",
        text: "The timers in " + controlFilter.city + " stopped successfully.",
        visible: true,
      })
    else
      setAlert({
        color: "danger",
        text: "The timers in " + controlFilter.city + " stopping failed.",
        visible: true,
      })
    setLoading(false)
  }

  return (
    <div className="page-content">
      <MetaTags>
        <title>Timer Page</title>
      </MetaTags>
      <Container fluid>
        <div className="timer-controller-page-container mt-5">
          <div className="row p-0 m-0">
            <div className="p-0">
              <div className="page-content-header ">
                <div>
                  <h2>Timer Controller</h2>
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

              <div className="mt-5 col-lg-4 col-md-6 col-sm-8 card shadow-lg p-3 py-5">
                <CitySelect
                  onChange={e => filterChanged("city", e)}
                  value={controlFilter.city}
                />
                <FactoryList
                  className="mt-3"
                  onChange={e => filterChanged("factory", e)}
                  value={controlFilter.factory}
                />
                <div className="mt-3">
                  {/* <AutoCompleteSelect options={filteredControllerTimers} onChange={(v) => setControlTimer(v)} className="mt-3" /> */}
                  <select
                    className="form-select"
                    name="machine"
                    onChange={v => {
                      setControlTimer(v.target.value)
                    }}
                  >
                    {filteredControllerTimers
                      ? filteredControllerTimers.map(timer => (
                          <option
                            className="text-uppercase"
                            key={
                              "" +
                              timer.machine._id +
                              timer.part._id +
                              timer._id
                            }
                            value={timer._id}
                          >
                            {timer.machine.machineClass +
                              " " +
                              timer.machine.name}
                          </option>
                        ))
                      : ""}
                  </select>
                  {/* <AutoCompleteSelect
                    options={[
                      { label: "aa", value: "aa" },
                      { label: "bb", value: "bb" },
                    ]}
                    onChange={v => setControlTimer(v)}
                    className="mt-3"
                  /> */}
                </div>
                <div className="mt-3 d-flex justify-content-between">
                  <Button
                    className="btn btn-success"
                    onClick={() => startTimerInController()}
                  >
                    Start
                  </Button>
                  <Button
                    className="btn btn-danger ms-2"
                    onClick={() => stopTimerInController()}
                  >
                    Stop
                  </Button>
                </div>

                <div className="mt-3 d-flex justify-content-between mt-3">
                  <Button
                    className="btn btn-success"
                    onClick={() => startAllTimers()}
                  >
                    Start All City
                  </Button>
                  <Button
                    className="btn btn-danger ms-2"
                    onClick={() => stopAllTimers()}
                  >
                    Stop All City
                  </Button>
                </div>

                <div className="mt-3 d-flex justify-content-between mt-3">
                  <Alert color={alert.color} isOpen={alert.visible}>
                    {alert.text}
                  </Alert>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default ControlTimer
