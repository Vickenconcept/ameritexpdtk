import { getCityAction, updateCityAction } from "actions/city"
import { startProductionTimeAction } from "actions/timer"
import { formatSeconds, getCurrentTime } from "helpers/functions"
import { useEffect, useState } from "react"
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap"
import { useNetStatus } from "context/net"
import { useTimerUser } from "context/timer"

import {offset} from 'helpers/globals.js'

const ProductionClock = props => {
  const [now, setNow] = useState(new Date())
  const [time, setTime] = useState(0)
  const [start, setStart] = useState(null)
  const [productionTime, setProductionTime] = useState(0)
  const { city, lastUpdated } = props
  const [productionTimeModal, setProductionTimeModal] = useState(false)
  const [editedTime, setEditedTime] = useState(0)
  const { isOnline } = useNetStatus()

  const {
    setProductionTime: setProductionTimeCtx,
  } = useTimerUser()

  useEffect(() => {
    const timerId = setInterval(() => {
      setNow(getCurrentTime(offset[city]))
      if (start) {
        let t = Math.min(
          (new Date().getTime() - new Date(start).getTime()) / 1000,
          productionTime * 3600
        )
        setTime(t)
        if (
          (new Date().getTime() - new Date(start).getTime()) / 1000 >=
          productionTime * 3600
        ) {
          props.setCanOperate(false)
        }
      } else {
        setTime(0)
        props.setCanOperate(true)
      }
    }, 1000)

    return () => {
      clearInterval(timerId)
    }
  }, [now])

  useEffect(() => {
    getLog()
  }, [city])

  const getLog = async () => {
    const log = await startProductionTimeAction(city, isOnline)
    const cityInfo = await getCityAction(city, isOnline)

    if (log) setStart(log.startedAt)
    else setStart(null)
    setProductionTime(cityInfo.productionTime)
    props.setProdTime(cityInfo.productionTime)
  }

  const toggleModal = () => {
    setProductionTimeModal(!productionTimeModal)
  }

  const saveProductionTime = async () => {
    setProductionTimeModal(false)
    const res = await updateCityAction(city, editedTime)
    setProductionTime(editedTime)
  }

  useEffect (() => {
    console.log (productionTime)
    console.log ("ProductionClock: useEffect (start, productionTime, city)", start, productionTime, city)
    if (city && city != "" && productionTime)
      setProductionTimeCtx(city, productionTime, start)
  },[start, productionTime, city])

  return (
    <>
      <div className="sort-container mb-0 pb-0 pt-0" style={{ border: "none" }}>
        <div className="sort-text">CLOCKS</div>
        <div className="d-flex row clock-container w-100 align-items-center">
          <div className="col-lg-3 col-sm-4 text-center">
            <div>{now.toDateString().substring(4, 15)}</div>
            <div className="desc">DATE</div>
          </div>

          <div className="col-lg-2 col-sm-4 text-center">
            <div>{now.toTimeString().substring(0, 8)}</div>
            <div className="desc">LOCAL TIME</div>
          </div>

          <div className="col-lg-2 col-sm-4 text-center">
            <div>{lastUpdated?lastUpdated.toTimeString().substring(0, 8):''}</div>
            <div className="desc">LAST UPDATED</div>
          </div>

          <div className="col-lg-2 col-sm-4 text-center">
            <div>{formatSeconds(time)}</div>
            <div className="desc">IN PRODUCTION</div>
          </div>

          <div className="col-lg-3 col-sm-4 text-center">
            <div
              style={{ cursor: "pointer" }}
              onClick={() => setProductionTimeModal(true)}
            >
              {productionTime} HOURS
            </div>
            <div className="desc">PRODUCTION TIME</div>
          </div>
        </div>
      </div>
      {/* <div className="sort-container mt-0 pt-0" style={{ border: "none" }}>
        <div className="sort-text"></div>
        <div className="row flex-1">
          <div className="col-9"></div>
          <div className="col-3 d-flex justify-content-center">
            <button
              className="btn btn-success"
              onClick={() => setProductionTimeModal(true)}
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: ".175rem",
                fontSize: "1rem",
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              Edit Time
            </button>
          </div>
        </div>
      </div> */}

      <Modal isOpen={productionTimeModal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          Set Production Time Of {city}
        </ModalHeader>
        <ModalBody>
          <form id="timer-form">
            <input
              type="number"
              className="form-control"
              onChange={e => setEditedTime(e.target.value)}
              defaultValue={productionTime}
            />
          </form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={saveProductionTime}>
            Save
          </Button>{" "}
          <Button color="secondary" onClick={toggleModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default ProductionClock
