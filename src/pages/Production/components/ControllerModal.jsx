import { useEffect, useContext } from "react"
import { cities, factories } from "helpers/globals"
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
  Label,
  Input,
  Progress,
} from "reactstrap"
import Timer from "./Timer"
import {
  createTimerAction,
  endTimerAction,
  getProducts,
  startTimerAction,
  updateTimerAction,
} from "actions/timer"
import { useMemo } from "react"
import "./style.scss"
import AutoCompleteSelect from "components/Common/AutoCompleteSelect"
import { getCurrentTime, lbsToTons } from "helpers/functions"
import { CitySelect, FactoryList } from "components/Common/Select"

import { LoadingContext } from "context/loading"
// import logodarkImg from "../../../assets/images/logo-dark.png"
import logoLightImg from "../../../assets/images/logo-light.png"
import { control } from "leaflet"

import { formatMSeconds } from "../../../helpers/functions"
const ControlTimer = props => {
  const [timers, setTimers] = useState([])
  const { loading, setLoading } = useContext(LoadingContext)
  const [filteredControllerTimers, setFilteredControllerTimers] = useState([])
  const [alert, setAlert] = useState({
    color: "success",
    text: "",
    visible: false,
  })
  const [operator, setOperator] = useState("")
  const [selectedTimer, setSelectedTimer] = useState("")
  const [controlTimer, setControlTimer] = useState("")
  const [time, setTime] = useState(0)
  const [timerId, setTimerId] = useState(0)

  useEffect(async () => {
    setControlFilter({
      ...controlFilter,
      city: props.city,
      machineClass: props.selectedMachineClass,
    })
    // setLoading(true)
    // const _timers = await getProducts("TimerContent", -1)

    // setTimers(_timers.products)
    // console.log("TIMERS", _timers.products)
    // setLoading(false)
  }, [props.show])

  const [controlFilter, setControlFilter] = useState({
    city: "",
    machineClass: 0,
  });

  useEffect(() => {
    setTime(0)
    if (selectedTimer && selectedTimer._id)
      setSelectedTimer(props.timers.filter(elem => elem._id == selectedTimer._id)[0])
    console.log(selectedTimer)
    if (selectedTimer && selectedTimer.status == "Started") {
      clearInterval(timerId)
      setTime(
        new Date() -
        new Date(
          selectedTimer.times[selectedTimer.times.length - 1].startTime
        )
      )
    }
  }, [selectedTimer, props.show, props.timers])

  useEffect(() => {
    if (selectedTimer.status == "Started") {
      const _timerId = setInterval(() => {
        const _time = time + 50
        setTime(_time)
      }, 50)
      setTimerId(_timerId)
      return () => {
        clearInterval(_timerId)
      }
    }
  }, [time])

  const filterChanged = (field, e) => {
    setControlFilter({
      ...controlFilter,
      [field]: e.target.value,
    })
  }
  useEffect(() => {
    if (timers == undefined) return timers
    const _timers = props.timers
      .filter(
        timer =>
          classify[controlFilter.machineClass].indexOf(
            timer.machine[0]
              ? timer.machine[0].machineClass
              : timer.machine.machineClass
          ) != -1 && timer.city == controlFilter.city
      )
      .sort((a, b) => {
        return a.machine.name < b.machine.name
          ? -1
          : a.machine.name > b.machine.name
            ? 1
            : 0
      })
    setFilteredControllerTimers(_timers)
    if (_timers[0]) setControlTimer(_timers[0]._id)
  }, [controlFilter, timers])

  useEffect(() => {
    if (timers == undefined) return timers
    const _timers = props.timers.filter(timer => timer._id == controlTimer)
    if (_timers[0])
      setOperator(
        _timers[0].operator ? _timers[0].operator : "Operator Not Found!"
      )

    const _timers2 = props.timers.filter(timer => timer._id == controlTimer)
    if (_timers2[0]) setSelectedTimer(_timers2[0])
  }, [controlTimer])

  const startTimerInController = async () => {
    setLoading(true)
    const res = await startTimerAction(selectedTimer._id)
    if (res.status == 200)
      if (res.data.success == false)
        setAlert({
          color: "danger",
          text: res.data.msg,
          visible: true,
        })
      else {
        setAlert({
          color: "info",
          text:
            filteredControllerTimers.find(
              element => element._id == selectedTimer._id
            ).machine[0].name +
            " in " +
            controlFilter.city +
            " started successfully.",
          visible: true,
        })
        props.updateTimers()
      }
    else
      setAlert({
        color: "danger",
        text:
          filteredControllerTimers.find(
            element => element._id == selectedTimer._id
          ).machine[0].name +
          " in " +
          controlFilter.city +
          " starting failed.",
        visible: true,
      })
    setLoading(false)
  }
  const stopTimerInController = async () => {
    setLoading(true)
    const res = await endTimerAction(selectedTimer._id)
    if (res.status == 200) {
      setAlert({
        color: "info",
        text:
          filteredControllerTimers.find(
            element => element._id == selectedTimer._id
          ).machine[0].name +
          " in " +
          controlFilter.city +
          " stopped successfully.",
        visible: true,
      })
      props.updateTimers()
    } else
      setAlert({
        color: "danger",
        text:
          filteredControllerTimers.find(
            element => element._id == selectedTimer._id
          ).machine[0].name +
          " in " +
          controlFilter.city +
          " stopping failed.",
        visible: true,
      })

    setLoading(false)
  }

  // const startAllTimers = async () => {
  //   setLoading(true)
  //   const res = await startTimerAction(-1, controlFilter.city)
  //   if (res.status == 200)
  //     setAlert({
  //       color: "info",
  //       text:
  //         cnt + " timers in " + controlFilter.city + " started successfully.",
  //       visible: true,
  //     })
  //   else
  //     setAlert({
  //       color: "danger",
  //       text: "The timers in " + controlFilter.city + " starting fails.",
  //       visible: true,
  //     })
  //   setLoading(false)
  // }

  // const stopAllTimers = async () => {
  //   setLoading(true)
  //   const res = await endTimerAction(-1, controlFilter.city)
  //   if (res.status == 200)
  //     setAlert({
  //       color: "info",
  //       text: "The timers in " + controlFilter.city + " stopped successfully.",
  //       visible: true,
  //     })
  //   else
  //     setAlert({
  //       color: "danger",
  //       text: "The timers in " + controlFilter.city + " stopping failed.",
  //       visible: true,
  //     })
  //   setLoading(false)
  // }
  const classify = [
    ["Radial Press"],
    ["MISC"],
    ["Variant", "Variant Perfect"],
    ["Blizzard", "Tornado", "Perfect System"],
  ]
  return (
    <Modal
      isOpen={props.show}
      toggle={props.toggleModal}
      className="modal-fullscreen"
    >
      <ModalBody
        style={{
          backgroundImage:
            selectedTimer &&
              selectedTimer.status == "Started" &&
              time / 1000 > selectedTimer.part[0].avgTime
              ? 'url("/images/REDBacking_web.png")'
              : 'url("/images/GreenBacking_web.png")',

          backgroundSize: "100% 100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            color: "white",
            fontSize: "1%",
          }}
        >
          TEMP CONTROLLER
        </div>
        <div style={{ position: "relative", top: "3%", paddingLeft: "3vw" }}>
          <div className="row w-100">
            <div className="col-4">
              <Label style={{ fontSize: "1.5vw" }}>CITY</Label>
              <CitySelect
                onChange={e => filterChanged("city", e)}
                value={controlFilter.city}
                style={{ padding: "0.5vh", fontSize: "1.8vw" }}
                disabled
              />
              <Label style={{ fontSize: "1.5vw", paddingTop: "2vh" }}>
                MACHINE CLASS
              </Label>
              <div>
                <select
                  className="form-select"
                  name="machineClass"
                  onChange={e => {
                    filterChanged("machineClass", e)
                  }}
                  style={{ padding: "5px", fontSize: "1.8vw" }}
                  value={controlFilter.machineClass}
                >
                  {props.classifiedTimers.map((cTimers, index) => {
                    return (
                      <option
                        className="text-uppercase"
                        key={index}
                        value={index}
                      >
                        {index != 3 ? classify[index][0] : "Precast"}
                      </option>
                    )
                  })}
                </select>
              </div>
              {/* <FactoryList
                onChange={e => filterChanged("factory", e)}
                value={controlFilter.factory}
                style={{ padding: "0.5vh", fontSize: "1.8vw" }}
              /> */}
              <Label style={{ fontSize: "1.5vw", paddingTop: "2vh" }}>
                SELECT TIMER
              </Label>
              <div>
                {/* <AutoCompleteSelect options={filteredControllerTimers} onChange={(v) => setControlTimer(v)} className="mt-3" /> */}
                <select
                  className="form-select"
                  name="machine"
                  onChange={v => {
                    setControlTimer(v.target.value)
                  }}
                  style={{ padding: "5px", fontSize: "1.8vw" }}
                >
                  {filteredControllerTimers
                    ? filteredControllerTimers.map(timer => (
                      <option
                        className="text-uppercase"
                        key={
                          "" +
                          timer.machine[0]._id +
                          timer.part[0]._id +
                          timer._id
                        }
                        value={timer._id}
                      >
                        {timer.machine[0].machineClass +
                          " " +
                          timer.machine[0].name}
                      </option>
                    ))
                    : ""}
                </select>
              </div>
              <Label style={{ fontSize: "1.5vw", paddingTop: "2vh" }}>
                OPERATOR
              </Label>
              <Input
                disabled
                style={{
                  padding: "0.5vh",
                  fontSize: "1.8vw",
                  backgroundColor: "#F3F3F3",
                }}
                value={operator ? operator : ""}
              ></Input>
              <Label className="mt-4" style={{ fontSize: "1.5vw" }}>
                DETAILS
              </Label>
            </div>
            <div className="col-8">
              <div
                style={{
                  float: "right",
                  marginRight: "5vw",
                  fontSize: "1.5vw",
                }}
              >
                CYCLE CLOCK
              </div>
              <div style={{ fontSize: "7vw", marginLeft: "15vw" }}>
                {formatMSeconds(time)}
              </div>
              <div
                style={{
                  fontSize: "5vw",
                  color: "#887E54",
                  textAlign: "center",
                }}
              >
                <a
                  href="#"
                  onClick={
                    selectedTimer && selectedTimer.status == "Started"
                      ? stopTimerInController
                      : startTimerInController
                  }
                >
                  {selectedTimer && selectedTimer.status == "Pending"
                    ? "START"
                    : "STOP"}
                </a>
                <Alert
                  color={alert.color}
                  isOpen={alert.visible}
                  style={{ fontSize: "1vw", width: "50%", margin: "auto" }}
                >
                  {alert.text}
                </Alert>
              </div>
            </div>
          </div>
          <div className="row" style={{ width: "80%", fontSize: "1.5vh" }}>
            <div className="col-5">
              <b>Machine:</b>
              {selectedTimer
                ? selectedTimer.machine[0].name
                : "MACHINE ASSIGNED TO TIMER"}
              <br />
              <b>PART/PRODUCT:</b>{" "}
              {selectedTimer
                ? selectedTimer.part[0].name
                : "PART ASSIGNED TO TIMER"}
            </div>
            <div className="col-4">
              <b>AVERAGE TIME:</b>{" "}
              {selectedTimer
                ? selectedTimer.part[0].avgTime
                : "AVERAGE TIME FROM PART"}
              <br />
              <b>WEIGHT:</b>{" "}
              {selectedTimer
                ? selectedTimer.weight
                : "WEIGHT IN TONS FROM PART"}
            </div>
            <div className="col-3">
              <b>UNITS PER HR:</b>{" "}
              {selectedTimer
                ? lbsToTons(
                  selectedTimer.dailyTon /
                  (Math.round(selectedTimer.totalTime / 3600) || 1)
                )
                : "UPH"}
              <br />
              <b>TONS PER HOUR:</b>{" "}
              {selectedTimer
                ? lbsToTons(
                  selectedTimer.dailyUnit /
                  (Math.round(selectedTimer.totalTime / 3600) || 1)
                )
                : "TPH"}
            </div>
          </div>
        </div>

        <Progress
          color={
            selectedTimer &&
              selectedTimer.status == "Started" &&
              time / 1000 > selectedTimer.part[0].avgTime
              ? "danger"
              : "success"
          }
          value={selectedTimer ? Math.min(100, time * 1000 / selectedTimer.part[0].avgTime) : 100}
          style={{ height: "2vw", marginTop: "8%" }}
        />

        <div style={{ position: "absolute", bottom: "12%", right: "5%" }}>
          <div
            style={{
              float: "right",
              marginRight: "2vw",
              color: "#959797",
              fontSize: "1vw",
            }}
          >
            UNITS CREATED
          </div>
          <div style={{ fontSize: "9vw" }}>
            {selectedTimer ? selectedTimer.dailyUnit : ""}
          </div>
        </div>
        <div>
          <img
            src={
              selectedTimer &&
                selectedTimer.status == "Started" &&
                time / 1000 > selectedTimer.part[0].avgTime
                ? "/images/endproduction_Red.png"
                : "/images/endproduction_Green.png"
            }
            style={{
              position: "absolute",
              bottom: "15%",
              right: "-23vw",
              width: "25vw",
            }}
          />
        </div>
        <div
          className="mt-4"
          style={{ textAlign: "center", color: "#959797", fontSize: "1vw" }}
        >
          DEVELOPED BY IEKOMEDIA
        </div>
      </ModalBody>
    </Modal>
  )
}

export default ControlTimer
