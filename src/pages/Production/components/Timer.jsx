import "./style.scss"
import { formatSeconds } from "../../../helpers/functions"
import { Fragment, useState } from "react"
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
} from "reactstrap"
import {
  endTimerAction,
  startTimerAction,
  updateTimerAction,
  deleteProductAction,
} from "actions/timer"
import { useEffect, useMemo, useCallback, useRef, forwardRef } from "react"

import { createPortal } from "react-dom"

import { connect } from "react-redux"
import { withRouter } from "react-router-dom"

import { lbsToTons } from "../../../helpers/functions"
import Editable from "react-bootstrap-editable"

import AutoCompleteSelect from "components/Common/AutoCompleteSelect"
// import { NewWindow } from "react-window-open"

import TimerController from "./TimerController"
import { BACKEND } from "./helpers/axiosConfig"

import "./timer.scss"
import { useNetStatus } from "context/net"
import { useTimerUser } from "context/timer"
import { canChangeJob, canChangePart } from "helpers/user_role"
import { useTimerContext } from "../Timer/context"

const NewWindow = props => {
  const { links } = props
  const [container, setContainer] = useState(null)
  const [shouldUpdate, setShouldUpdate] = useState(0)
  const newWindow = useRef(window)
  const linkcss = () => {
    for (var i = 0; i < links.length; i++) {
      var fileref = document.createElement("link")
      fileref.setAttribute("rel", "stylesheet")
      fileref.setAttribute("type", "text/css")
      fileref.setAttribute("href", BACKEND + links[i])
      newWindow.current.document.head.appendChild(fileref)
    }
  }

  useEffect(() => {
    const div = document.createElement("div")
    setContainer(div)
  }, [])

  useEffect(() => {
    if (container && newWindow.current) {
      newWindow.current = window.open(
        "",
        "",
        `width=${props.width},height=${props.height},left=${props.left},right=${props.right},top=${props.top},bottom=${props.bottom}`
      )
      newWindow.current.document.body.appendChild(container)

      newWindow.current.addEventListener("beforeunload", () => {
        props.onClose()
      })
      newWindow.current.addEventListener("resize", () => {
        props.onResize(
          newWindow.current.innerWidth,
          newWindow.current.innerHeight
        )
      })

      const curWindow = newWindow.current
      linkcss()
      return () => curWindow.close()
    }
  }, [container])

  return (
    container &&
    createPortal(
      <>
        <title>{props.title}</title>
        {props.children}
      </>,
      container
    )
  )
}

const Timer = props => {

  const {startTimer, stopTimer, deleteTimer} = useTimerContext()

  const [isControllerOpen, setIsControllerOpen] = useState(false)
  const [width, setWidth] = useState(1000)
  const [height, setHeight] = useState(600)

  const navToStock = () => {
    props.history.push("/orderflow/production-tracker?stockmodal=true")
  }

  const { 
    timerRequest, 
    TIMER_USER, 
    TIMER_TICK_UNIT,
    getTimerValueCtx,
    setTimerValueCtx,
  } = useTimerUser()
  const [canOpen, setCanOpen] = useState(false)

  useEffect(() => {
    const res = timerRequest({
      city: props.city,
      tid: props._id,
      uid: props.user._id,
    })
    if (res) setCanOpen(true)
    else setCanOpen(false)
  }, [TIMER_USER])

  useEffect(() => {
    setWidth(1000)
    setHeight(600)
  }, [isControllerOpen])

  const ratio = 22.0 / 13.0

  const onResize = (ww, hh) => {
    const w = hh * ratio
    const h = ww / ratio
    if (w < ww) {
      // console.log("here w", w)
      setWidth(w)
    } else if (h < hh) {
      // console.log("here h", h)
      setHeight(h)
    }
  }

  const { user } = props

  const getCanChangePart = useMemo (()=>{
    return canChangePart(user)
  }, [user])

  const getCanChangeJob = useMemo (()=>{
    return canChangeJob(user)
  },[user])

  const [moreMenu, setMoreMenu] = useState(false)
  // const [isExpired, setIsExpired] = useState(false)
  const [time, setTime] = useState(0)
  const { isOnline } = useNetStatus()
  const toggle = () => {
    setMoreMenu(!moreMenu)
  }

  const prevRef = useRef(props.status)
  useEffect(() => {
    ;(async () => {
      if (props.status == "Started" && prevRef.current == null) {
        // setTimeout(() => {
        //   setTime(time + 0.12)
        // }, 120)
        let res = await startTimerAction(props._id, props.city)
        if (res?.success) {
          startTimer()
        }
      }

      prevRef.current = props.status
    })()
  }, [props.status])

  const calculateCurrentTime = useCallback(() => {
    if (props.times.length == 0) return 0
    else if (props.status == "Started") {
      return (
        (new Date() - new Date(props.times[props.times.length - 1].startTime)) /
        1000
      )
    }
    else if (props.times.length == 1 && !props.times[0].endTime) {
      return 0
    }
    else return (
      (new Date(props.times[props.times.length - 1].endTime) -
        new Date(props.times[props.times.length - 1].startTime)) /
      1000
    )
  }, [props.status, props.times])

  const calcTimeValue = ()=>{
    return (props.status == "Started" || props.times.length==0)
                  ? time
                  : (new Date(props.times[props.times.length - 1].endTime) -
                      new Date(props.times[props.times.length - 1].startTime)) /
                      1000
  }

  const timeText = useMemo (()=>{
    return formatSeconds(calcTimeValue())
  },[props.status, props.times, time])

  let _timerId = null

  useEffect(() => {
    // if (props.status != "Started" || time == -1) return

    // const _timerId = setTimeout(() => {
    //   setTime(time + 0.83)
    // }, 830)
    // // setTimerId(_timerId)

    // return () => {
    //   // console.log("timer---");
    //   clearTimeout(_timerId)
    // }
    if (props.status == "Started") 
      _timerId = setInterval (()=>{
        setTime (calculateCurrentTime())
      }, TIMER_TICK_UNIT)
    else if (_timerId)
      clearInterval(_timerId)
    return () => {
      clearInterval(_timerId)
    }
  }, [props.status])

  const isExpired = useMemo(() => {
    return (props.status == "Started" || !props.times.length
        ? time
        : (new Date(props.times[props.times.length - 1].endTime) -
            new Date(props.times[props.times.length - 1].startTime)) /
          1000) <=
    (props.part.length ? props.part[0].avgTime : props.part.avgTime)
  },[props.status, props.times, props.part, time])

  const editTimer = () => {
    props.editTimer(props._id)
  }

  const productTime = Math.round(props.totalTime / 3600) || 1

  const updateOperatorName = v => {
    updateTimerAction(props._id, props.city, { operator: v })
  }

  const partChanged = async v => {
    if (!getCanChangePart) return
    if (!isOnline) {
      alert("Check the network status")
      return
    }
    props.setLoading(true)
    // const idx = props.parts.findIndex(p => v == p._id)
    try {
      const res = await updateTimerAction(props._id, props.city, {
        part: v?._id,
        weight: v?.pounds,
        productTime: v?.avgTime,
      })
      // if (res.status == 200) {
      //   // alert("success")
      //   props.setLoading(false)
      //   return true
      // }
      console.log (res)
      // const error = "" + res
      // if (error.includes("403"))
        // alert(
        //   "Timer is already started. Please stop it and then change the Part again."
        // )
      // else if (error.includes("500"))
      //   alert("Unknown error, please report to the support team.")
      // props.setLoading(false)
      // return false
    } catch (e) {
      console.log (e)
    } finally {
      props.setLoading(false)
    }
  }

  const getDailyUnit = useMemo(() => {
    let v = props.dailyUnit
    v -= (props.status == "Started")
    if (!v) return <span className="inactive">000</span>
    else if (v < 10)
      return (
        <>
          <span className="inactive">00</span>
          <span className="active">{v}</span>
        </>
      )
    else if (v < 100)
      return (
        <>
          <span className="inactive">0</span>
          <span className="active">{v}</span>
        </>
      )
    else
      return (
        <>
          <span className="active">{v}</span>
        </>
      )
  }, [props.dailyUnit])

  useEffect(() => {
    setTimerValueCtx (
      props.city, 
      props._id, 
      props.status,
      calcTimeValue(), 
      {
        isExpired, 
        timeText,
        dailyUnit: (props.dailyUnit - (props.status == "Started")),
        operator: props.operator,
      }
    )
  }, [props.status, props.city, props._id, time, isExpired, props.dailyUnit])

  return (
    // style={{marginLeft:props.idx % 3 == 0?"-100px":"100px", marginRight:props.idx % 3 == 2? "-100px":""}}
    <div className="col-lg-4 col-md-4 col-sm-6 d-flex justify-content-center p-2">
      <div className="product p-0">
        <div className="product-header">
          {/* <select className="form-select">
            <option>{props.part && props.part.name}</option>
          </select> */}
          <div style={{ width: "100%" }}>
            <AutoCompleteSelect
              disabled = {!getCanChangePart}
              timerChangePart="true"
              option={props.part[0] && props.part[0]._id}
              placeholder = {props.part[0] && props.part[0].name}
              options={props.parts}
              onChange={v => {
                partChanged(v)
              }}
              loading={props.partsLoading}
              // placeholder={
              //   props.part.length
              //     ? props.part[0] && props.part[0].name
              //     : props.part && props.part.name
              // }
              // value={"default"}
            />
          </div>

          <Dropdown isOpen={moreMenu} toggle={toggle}>
            <DropdownToggle caret>
              <span className="mdi mdi-dots-horizontal text-black-50"></span>
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={editTimer}>Details</DropdownItem>
              {user.role == "Personnel" || user.role == "Accounting" ? (
                ""
              ) : (
                <DropdownItem
                  onClick={() => {
                    deleteTimer(props._id)
                  }}
                >
                  Remove
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="timer-info text-center">
          <h3 className="part-name">
            {props.machine[0] && props.machine[0].name}
          </h3>
          <div className="timer-name">
            <div
              className={`time ${
                props.status == "Pending" && !props.times.length
                  ? "text-zero"
                  : isExpired
                  ? "text-success"
                  : "text-danger"
              }`}
            >
              {timeText}
            </div>
          </div>
          <div className="production-details">
            <div className="operator-name" style={{ textAlign: "center" }}>
              {props.operator == "" ||
              props.operator == null ||
              props.operator == undefined
                ? "Please set Operator"
                : props.operator}
              {/* <Editable
                onSubmit={updateOperatorName}
                alwaysEditing={false}
                disabled={false}
                editText="Operator"
                showText={true}
                id={null}
                isValueClickable={false}
                mode="popover"
                placement="top"
                type="textfield"
                initialValue={props.operator}
              /> */}
            </div>

            <div className="text-center daily-unit-container">
              <div className="daily-unit-digit">{getDailyUnit}</div>
              <h3 className="daily-unit-caption">Daily Units</h3>
            </div>
            <div className="info-container">
              <div className="row m-0">
                <div className="col-6 caption">Total Tons</div>
                <div className="col-6 info">
                  {lbsToTons(props.dailyTon ? props.dailyTon : 0)}
                </div>
              </div>
              <div className="row m-0">
                <div className="col-6 caption">Average Ton/hr</div>
                <div className="col-6 info">
                  {lbsToTons(
                    props.dailyTon / productTime
                      ? props.dailyTon / productTime
                      : 0
                  )}
                </div>
              </div>
              <div className="row m-0">
                <div className="col-6 caption">Average Unit/hr</div>
                <div className="col-6 info">
                  {(props.dailyUnit / productTime
                    ? props.dailyUnit / productTime
                    : 0
                  ).toFixed(3)}
                </div>
              </div>
            </div>

            <div className="product-detail"></div>
            {/* CONTROLLER BUTTON */}
            {isControllerOpen && (
              <NewWindow
                width={width}
                height={height}
                title={props.machine[0].name + " CONTROL"}
                onResize={onResize}
                onClose={() => {
                  setIsControllerOpen(false)
                }}
                links={["/css/timercontroller.css"]}
              >
                <TimerController
                  {...props}
                  machine={props.machine[0]}
                  productTime={productTime}
                  time={time}
                  isExpired={isExpired}
                  open={isControllerOpen}
                  canOperate={props.canOperate}
                  navToStock = {navToStock}
                  canChangeJob = {getCanChangeJob}
                  />
              </NewWindow>
            )}
            <div className="button-container">
              <Button
                className="button-controller"
                style={{
                  backgroundColor: props.btnColors[[props._id]]
                    ? props.btnColors[[props._id]]
                    : "#fefefe",
                }}
                disabled={!canOpen}
                onClick={() => {
                  setIsControllerOpen(true)
                }}
              >
                CONTROLLER
              </Button>
              <Button
                className="button-camera"
                style={{
                  backgroundColor: "#B2B2B2",
                }}
                onClick={() => {
                  alert("Coming Soon..")
                }}
              >
                LIVE CAMERA
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStatetoProps = state => {
  const { error, success } = state.Profile
  const user = state.Login.user
  return { error, success, user }
}

export default withRouter(connect(mapStatetoProps, {})(Timer))
