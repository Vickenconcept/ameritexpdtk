import {
  endTimerAction,
  startTimerAction,
  stopTimerAction,
  updateTimerAction,
} from "../../../../actions/timer"
import { BACKEND } from "./helpers/axiosConfig"
import { useState, useEffect, forwardRef, useRef, useMemo, useCallback } from "react"

import { formatMSeconds, formatSeconds } from "../../../../../../helpers/functions"
import { lbsToTons } from "../../../../../../helpers/functions"

import { getJobsForTimer } from "../../../actions/job"

import { useLocalDB } from "../../../context/localDB"
import { useNetStatus } from "../../../context/net"
import { useTimerUser } from '../../../context/timer'
import { useTimerContext } from "../Timer/context"
import { StoppingReason } from "../../../pages/Production/components/type"

const DivideElem = ({ status }) => (<span style={{ color: status ? "#102135" : "#fffae5" }}>:</span>)
const NoughElem = ({ status }) => (<span style={{ color: status ? "#102135" : "#fffae5" }}>0</span>)
const DigitElem = ({ digit, status }) => (<span style={{ color: status ? "#102135" : "#fffae5" }}>{digit}</span>)

const getTimeValue = (tt) => {
  let t = tt ? tt : 0
  let hour = Math.floor(t / 3600)
  t -= hour * 3600
  let minute = Math.floor(t / 60)
  t -= minute * 60
  let second = Math.floor(t)
  // t -= second * 1000
  return {
    hour,
    minute,
    second,
  }
}

const Clocker = props => {
  const { time, status } = props
  const [mm, setMM] = useState(0)
  let _timerId = null

  useEffect(() => {
    if (status == 'Started')
      _timerId = setInterval(() => {
        setMM(mm => {
          if (mm >= 999)
            return 0
          return mm + 130
        })
      }, 130)
    else {
      if (_timerId)
        clearInterval(_timerId)
      setMM(0)
    }
    return () => {
      clearInterval(_timerId)
    }
  }, [status])

  const timeText = useMemo(() => {
    let { hour, minute, second, millisecond } = getTimeValue(time)
    return <>
      {hour < 10 && <NoughElem status={status == 'Started'} />}
      {hour == 0 ?
        <NoughElem status={status == 'Started'} /> :
        <DigitElem status={status == 'Started'} digit={hour} />
      }
      <DivideElem status={status == 'Started'} />
      {minute < 10 && <NoughElem status={status == 'Started'} />}
      {minute == 0 ? <NoughElem status={status == 'Started'} /> :
        <DigitElem status={status == 'Started'} digit={minute} />
      }
      <DivideElem status={status == 'Started'} />
      {second < 10 && <NoughElem status={status == 'Started'} />}
      {second == 0 ? <NoughElem status={status == 'Started'} /> :
        <DigitElem status={status == 'Started'} digit={second} />
      }
    </>
  }, [time, status])

  const mmText = useMemo(() => {
    let millisecond = Math.floor((mm % 1000) / 10)
    return (
      <>
        <DivideElem status={status == 'Started'} />
        {millisecond < 10 && <NoughElem status={status == 'Started'} />}
        {millisecond == 0 ? <NoughElem status={status == 'Started'} /> :
          <DigitElem status={status == 'Started'} digit={millisecond} />
        }
      </>
    )
  }, [mm, status])

  return (
    <div className={props.isExpired ? "clock-item" : "clock-item expired"}>
      <div className="clock-inner">
        <h1 className="clock-digit">
          {timeText}
          {mmText}
        </h1>
      </div>
    </div>
  )
}

const Controller = props => {
  const { isOnline } = useNetStatus()
  const { isDBReady } = useLocalDB()
  const [now, setNow] = useState(new Date())
  const [stoppingReason, setStoppingReason] = useState('')

  const {
    getProductionTime: getProductionTimeCtx,
    productionTime: productionTimeCtx,
  } = useTimerUser()

  const { refreshTimer } = useTimerContext()

  const currentProductionTime = useMemo(() => {
    // const ctx = getProductionTimeCtx(props.city) //start, productionTime
    // console.log (props.city)
    // if (!ctx) return null;
    // const {productionTime} = ctx
    let startForTimer = null
    if (props.times?.length > 0) {
      startForTimer = props.times[0].startTime
    }
    if (startForTimer) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      if (new Date(startForTimer).getTime() < startOfDay.getTime()) {
        startForTimer = null
      }
    }
    return { productionTime: null, startForTimer }
  }, [productionTimeCtx, props.city, props.times])

  const isEndedProductionTime = useMemo(() => {
    if (props.endProductionTime) return true
    if (!now) return false
    if (!currentProductionTime) return false
    const { startForTimer, productionTime } = currentProductionTime
    if (!productionTime || !startForTimer) return false
    return (now.getTime() - new Date(startForTimer).getTime()) > (productionTime * 3600)
  }, [currentProductionTime, now, props.endProductionTime])

  const productionTimeText = useMemo(() => {
    if (!currentProductionTime || !now) return "00:00:00"
    const { startForTimer, productionTime } = currentProductionTime
    if (!startForTimer) return "00:00:00"
    const diff = (now.getTime() - new Date(startForTimer).getTime()) / 1000
    // const remain = productionTime * 3600 - diff
    const remainText = formatSeconds(diff)
    return `${remainText}`
  }, [now, currentProductionTime])

  const { navToStock, canChangeJob } = props
  const { machine } = props
  const [time, setTime] = useState(0)
  const [timerId, setTimerId] = useState(0)
  const [isHover, setIsHover] = useState(false)
  const [isHover1, setIsHover1] = useState(false)
  const [operator, setOperator] = useState("")
  const [progress, setProgress] = useState("100%")
  const [alert, setAlert] = useState({
    color: "success",
    text: "SUCCESS",
    visible: true,
    opacity: "0",
  })

  const [timeText, setTimeText] = useState("00:00 AM")
  const [dateText, setDateText] = useState("19/03/2023")

  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState([])

  const [endModal, setEndModal] = useState(false)

  const [stopColor, setStopColor] = useState("rgb(0,0,0)")

  const openEndModal = () => setEndModal(true)
  const closeEndModal = () => setEndModal(false)

  const readingPane = useRef(null)
  const [logText, setLogText] = useState(
    "Open the timer controller.\r\n------OPERATIONS-------"
  )

  const [is5Second, setIs5Second] = useState(false)

  useEffect(async () => {
    let timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])
  useEffect(async () => {
    const _jobs = await getJobsForTimer(
      props.city,
      props.factory,
      props.machine._id,
      props.part[0]._id,
      isOnline,
    )
    if (_jobs && _jobs.jobs && _jobs.jobs.length > 0)
      setJobs(_jobs.jobs)
    else if (_jobs && _jobs.stock_jobs && _jobs.stock_jobs.length > 0)
      setJobs(_jobs.stock_jobs)
    else
      setJobs([])
  }, [props.status, isOnline])

  const appendLog = v => {
    console.log('appendLog', v)
    setLogText(prev => prev + "\r\n" + timeText.split(" ").join("") + " ---- " + v)
  }

  useEffect(() => {
    readingPane.current.scrollTo({
      left: 0,
      top: readingPane.current.scrollHeight,
      behavior: "smooth",
    })
  }, [logText])

  const getTimeText = date => {
    let h = date.getHours()

    let isPM = h >= 12
    if (isPM) h -= 12

    if (!isPM && h == 0) {
      h = 12
    }

    if (h < 10) h = "0" + h

    let m = date.getMinutes()
    if (m < 10) m = "0" + m

    let s = date.getSeconds()
    if (s < 10) s = "0" + s

    return "" + h + " : " + m + " : " + s + " " + (isPM ? "PM" : "AM")
  }

  const getDateText = date => {
    let y = date.getFullYear()

    let m = date.getMonth() + 1
    if (m < 10) m = "0" + m

    let d = date.getDate()
    if (d < 10) d = "0" + d

    return "" + m + " / " + d + " / " + y
  }

  useEffect(() => {
    let timer_datetime = null
    timer_datetime = setInterval(() => {
      setTimeText(getTimeText(new Date()))
      setDateText(getDateText(new Date()))
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer_datetime)
  }, [])
  let timerId5 = 0;
  useEffect(() => {
    setTime(0)
    setProgress("100%")
    // if (props.status == "Started") {
    //   clearInterval(timerId)
    //   const _time =
    //     new Date() - new Date(props.times[props.times.length - 1].startTime)
    //   setTime(_time)
    // }
    setOperator(props.operator)
  }, [])
  useEffect(() => {
    if (props.status == "Pending") setTime(0)
  }, [props.open, props.status])
  useEffect(() => {
    setProgress(Math.min((props.time * 100) / props.part[0].avgTime, 100) + "%")
    const _delta = Math.min(props.time / props.part[0].avgTime, 1)
    setStopColor(`rgb(${204 * _delta}, ${200 * _delta}, ${17 * _delta})`)
  }, [props.time])
  const make5SecondDisable = () => {
    setIs5Second(true)
    try {
      clearTimeout(timerId5)
    } catch (e) {
      console.log(e);
    }
    console.log("5second started")
    timerId5 = setTimeout(() => {
      setIs5Second(false)
      console.log("5second finished")
    }, 5000)
  }
  const startTimerInController = async (controlTimer, needRefresh = true) => {
    console.log(props)
    if (!props.canOperate) return;
    make5SecondDisable()
    appendLog("checking the operator and updating...")
    if (props.operator == "") {
      appendLog("ERR: The operator is not selected")
      return
    }
    console.log("A")
    await updateTimerAction(
      controlTimer,
      props.city,
      { operator: operator },
      isOnline
    )
    console.log("B")
    appendLog("starting Timer...")
    if (needRefresh) {
      if (props.status == "Started") {
        appendLog("ERR: The timer is already started")
        return
      }
      if (isEndedProductionTime) {
        appendLog("ERR: The production time is ended")
        return
      }
    }
    const res = await startTimerAction(controlTimer, props.city, operator, isOnline)
    console.log(3, res)
    if (res.status == 200)
      if (!res.data.success) {
        appendLog(res.data.msg)
      } else {
        if (res.data.cnt == 0) appendLog("ERR: The timer is already started")
        else {
          appendLog(
            operator + " started " +
            props.machine.name + " in " + props.city + " successfully."
          )
          if (needRefresh) await
            refreshTimer([controlTimer], props.city)
        }
      }
    else {
      appendLog(props.machine.name + " in " + props.city + " starting failed.")
    }
  }
  const stopTimerInController = async (controlTimer, aParam = '') => {
    if (!props.canOperate) return;
    make5SecondDisable()
    appendLog("stopping Timer...")
    const res = await stopTimerAction(controlTimer, props.city, isOnline, aParam)
    if (res.status == 200) {
      appendLog(
        props.machine.name + " in " + props.city + " stopped successfully."
      )
      await refreshTimer([props._id], props.city, false)
    } else {
      appendLog(
        props.machine.name +
        " in " +
        props.city +
        " stopping failed. Please try again."
      )
    }
  }
  const restartTimerInController = async controlTimer => {
    if (!props.canOperate) return;
    await stopTimerInController(controlTimer)
    await startTimerInController(controlTimer, false)
  }
  const endTimerInController = async controlTimer => {
    if (!props.canOperate) return;
    make5SecondDisable()
    const res = await endTimerAction(controlTimer, props.city, isOnline)
    closeEndModal()
    if (res.status == 200) {
      appendLog(
        props.machine.name + " in " + props.city + " Ended successfully."
      )
    } else {
      appendLog(props.machine.name + " in " + props.city + " Ending failed.")
    }
    await refreshTimer([props._id], props.city)
  }

  const buttonStyle = {
    color: "white",
    backgroundColor: "red",
    fontFamily: "'Lato', san-serif",
    border: "none",
    fontSize: "3vw",
    padding: "1vw",
    margin: ".5vw",
    cursor: "pointer",
  }
  const getDailyUnit = useMemo(() => {
    let v = props.dailyUnit
    v -= (props.status == "Started")
    return v
  }, [props.dailyUnit])

  const disabled = useMemo(() => {
    if (jobs.length == 0) return true
    if (props.canOperate == false) return true
    if (!operator || operator == "") return true
    return false
  }, [jobs, props.canOperate, operator])

  return (
    <div className="body-container">
      {loading && (
        <div
          className="loading-container"
          style={{
            width: "100vw",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            backgroundColor: "white",
            alignSelf: "center",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            zIndex: 9999,
            display: "flex",
          }}
        >
          <h4>Loading...</h4>
        </div>
      )}
      {endModal && (
        <>
          <div
            style={{
              zIndex: 99999,
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backdropFilter: "blur(20px)",
              display: "flex",
              flexFlow: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div>
              <h1
                style={{
                  color: "#ad0606",
                  textAlign: "center",
                  marginBottom: "2vw",
                }}
              >
                BY CONFIRMING, PRODUCTION WILL END FOR THE DAY.
              </h1>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <button
                style={{ ...buttonStyle, backgroundColor: "#102135" }}
                onClick={() => {
                  endTimerInController(props._id)
                }}
              >
                Confirm
              </button>
              <button
                style={buttonStyle}
                onClick={() => {
                  closeEndModal()
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
      <div
        style={{
          position: "fixed",
          padding: "20px",
          backgroundColor: alert.color == "success" ? "#22ff22" : "red",
          color: "white",
          zIndex: "1",
          textAlign: "center",
          transition: "opacity 1s",
          opacity: alert.opacity,
          cursor: "pointer",
          left: "50%",
          top: "1%",
          transform: "translate(-50%, 0%)",
        }}
        onClick={() => {
          setAlert({ ...alert, opacity: "0" })
        }}
      >
        {alert.text}
      </div>
      <div className="header-container">
        <div className="logo-container">
          <img
            className="logo"
            src={
              BACKEND + (props.isExpired ? "/logo-green.png" : "/logo-red.png")
            }
          />
        </div>
        <div className="header-title-container">
          <h1 className="header-title-1">{props.city}</h1>
          <h2 className="header-title-2">CONTROLLER</h2>
        </div>
      </div>

      <div className="main-container">
        <div className="main-body-container">
          <h1 className="main-body-title">Details</h1>
          <div className="main-body-info-container">
            <div className="main-body-info-hub">
              <div className="main-body-info-subject">
                <p className="main-body-text">Factory</p>
                <p className="main-body-text">MACHINE</p>
                <p className="main-body-text">PART/PRODUCT</p>
                <p className="main-body-text">AVERAGE TIME</p>
                <p className="main-body-text">WEIGHT</p>
              </div>
              <div className="main-body-info-text">
                <p className="main-body-text">{props?.factory}</p>
                <p className="main-body-text">{props.machine?.name}</p>
                <p className="main-body-text">{props.part[0]?.name}</p>
                <p className="main-body-text">{props.part[0]?.avgTime}</p>
                <p className="main-body-text">
                  {lbsToTons(props.part[0].pounds)}
                </p>
              </div>
            </div>
            <div className="operator-container">
              <h6 className="operator-title">Operator</h6>
              <input
                className="operator-input"
                type="text"
                value={operator || ''}
                onChange={v => {
                  v = v.target.value
                  setOperator(v)
                }}
              />
            </div>
            <div className="operator-container">
              <h6 className="operator-title">JOB</h6>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
              >
                {jobs.length > 0 &&
                  <select
                    className="operator-input"
                    type="text"
                    style={{ color: jobs.length ? "black" : "lightgrey" }}
                    disabled={jobs.length == 0 || !props.canOperate || !canChangeJob}
                    defaultValue={"Select Stock Job"}
                  >
                    {canChangeJob && jobs.length == 0 && (
                      <option value="Select Stock Job" disabled>
                        Create Job
                      </option>
                    )}
                    {jobs.map(job => {
                      return <option key={"job_select_" + job._id}>{job.name}</option>
                    })}
                  </select>
                }
                {jobs.length == 0 && (
                  <button
                    className="stock-job-navigation"
                    style={{
                      backgroundColor: '#1eabaf',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      height: '30px',
                    }}
                    onClick={() => { navToStock() }}
                  >
                    Create Job
                  </button>
                )}
              </div>
            </div>
            <div className="main-body-reading-container">
              <p className="main-body-reading-title">READINGS</p>
              <hr className="main-body-reading-line" />
            </div>
            <div className="main-body-reading-pane" ref={readingPane}>
              {logText.split("\n").map((str, idx) => (
                <p
                  key={"paragraph_" + idx}
                  style={{
                    textTransform: "none",
                  }}
                >
                  {str}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="main-action-container">
          <div className="clock-container">
            <h3 className="clock-title">Time : {' '} {productionTimeText}</h3>
            <Clocker time={props.time} isExpired={props.isExpired} status={props.status} />
            <p className={"clock-start " + ((is5Second || disabled) && "disabled")}>
              <a
                style={{
                  color: (is5Second || disabled) ? "grey" : props.status == "Pending" ? "rgb(204,200,17)" : stopColor,
                }}
                onClick={() => {
                  {
                    if (is5Second || disabled) return;
                    props.status == "Pending"
                      ? startTimerInController(props._id, props.city)
                      : restartTimerInController(props._id, props.city)
                  }
                }}
              >
                {props.status == "Pending" ? "START" : "STOP"}
              </a>
            </p>
          </div>
          <div className="action-units-container">
            <div className="action-units-info-container">
              <div className="action-units-info-subject">
                <p className="action-units-info">UNITS PER HR</p>
                <p className="action-units-info">TONS PER HOUR</p>
                <p className="action-units-info">TOTAL TONS</p>
              </div>
              <div className="action-units-info-text">
                <p className="action-units-info">
                  {(getDailyUnit / props.productTime).toFixed(3)}
                </p>
                <p className="action-units-info">
                  {lbsToTons((props.dailyTon / props.productTime).toFixed(3))}
                </p>
                <p className="action-units-info">
                  {lbsToTons(props.dailyTon ? props.dailyTon.toFixed(3) : '')}
                </p>
              </div>
            </div>
            <div className="action-unit-counter-container">
              <p className="action-unit-counter-title">UNITS CREATED</p>
              <p className="action-unit-counter-digit">
                <span
                  style={{
                    color: getDailyUnit / 100 < 1 ? "#DBDBDB" : "#000000",
                  }}
                >
                  {Math.floor(getDailyUnit / 100) % 10}
                </span>
                <span
                  style={{
                    color: getDailyUnit / 10 < 1 ? "#DBDBDB" : "#000000",
                  }}
                >
                  {Math.floor(getDailyUnit / 10) % 10}
                </span>
                <span
                  style={{
                    color: getDailyUnit == 0 ? "#DBDBDB" : "#000000",
                  }}
                >
                  {getDailyUnit % 10}
                </span>
              </p>
            </div>
          </div>
          <a
            className="action-button"
            // onMouseEnter={() => {
            //   setIsHover(true)
            // }}
            // onMouseLeave={() => {
            //   setIsHover(false)
            // }}
            style={{ transform: isHover ? "translate(0,0)" : "" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.5vw"
              height="1.5vw"
              fill={props.isExpired ? "#0ccc19" : "#ff0000"}
              className="bi bi-caret-left-fill svg-zoom"
              viewBox="0 0 16 16"
              onClick={() => {
                setIsHover(!isHover)
              }}
              style={{ rotate: isHover ? "180deg" : "0deg" }}
            >
              {" "}
              <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />{" "}
            </svg>
            <span
              className="action-button-text"
              onClick={() => {
                // endTimerInController(props._id)
                openEndModal()
              }}
            >
              END PRODUCTION
            </span>
          </a>
          <div
            className="machine-error"
            style={{ transform: isHover1 ? "translate(-50%, 0%)" : "" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="2vw"
              height="2vw"
              fill={props.isExpired ? "#0ccc19" : "#ff0000"}
              className="bi bi-caret-left-fill svg-zoom"
              viewBox="0 0 16 16"
              onClick={() => {
                setIsHover1(!isHover1)
              }}
              style={{ rotate: isHover1 ? "-90deg" : "90deg" }}
            >
              {" "}
              <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />{" "}
            </svg>
            <div className="action-button-text">
              <a
                onClick={() => {
                  stopTimerInController(props._id, stoppingReason)
                }}
              >
                STOP
              </a>{" "}
              <br />
              <small style={{ lineHeight: "3vw" }}>
                {
                  Object.values(StoppingReason).map((reason) =>
                    <>
                      <input
                        type="checkbox"
                        checked={stoppingReason === reason}
                        onChange={() => { setStoppingReason(reason) }}
                      />
                      <label>{reason}</label><br />
                    </>
                  )
                }
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="progress-container">
        <div
          className={props.isExpired ? "progress-bar" : "progress-bar danger"}
          style={{
            width: progress,
          }}
        ></div>
      </div>

      <div className="footer-container">
        <h6 className="footer-title">DEVELOPED BY IEKOMEDIA</h6>
        <div className="footer-time-container">
          <p className="footer-time">{dateText + " - " + timeText}</p>
        </div>
      </div>
    </div>
  )
}

export default Controller
