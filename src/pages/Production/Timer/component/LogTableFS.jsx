import { useState, useEffect, useMemo } from "react"
import {
  getProducts,
  getTimerLogsOfMachine,
  searchMacheinsAction,
} from "../../../../actions/timer"
import {
  useTimerUser
} from '../../../../context/timer'
import { formatSeconds } from "../../../../helpers/functions"
import './report.scss'

export default (props) => {
  const {
    formatSeconds,
    sortTable,
    isOnline,
    onClosePopup,
    popupOpen,
    lbsToTons,
  } = props

  let {
    machine,
    machineClass,
    reportBtnColor,
    filters,
    query,
    part,
    city,
  } = props

  const { getTimerValueCtx } = useTimerUser()

  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(1)
  const [items_per_page, setItemsPerPage] = useState(12)
  const [resultCount, setResultCount] = useState(0)
  const [totalTons, setTotalTons] = useState(0)
  const [totalLoss, setTotalLoss] = useState(0)
  const [totalGain, setTotalGain] = useState(0)
  const [totalFloat, setTotalFloat] = useState(0)

  const getTimers = async () => {
    if (!machine?._id) return
    try {
      const res = await getTimerLogsOfMachine(
        machine._id,
        part,
        filters.from,
        filters.to,
        page,
        filters.includeCycle,
        machineClass,
        city,
        items_per_page,
        query,
        isOnline,
      )
      if (res == "You take too long period to get the log.") {
        console.log("You take too long period to get the log.")
        return
      }
      setLogs(res.logs ? res.logs : 0)
      setResultCount(res.total ? res.total : 0)
      setTotalTons(lbsToTons(res.totalTons ? res.totalTons : 0))
      setTotalGain(res.totalGain ? res.totalGrain : 0)
      setTotalLoss(res.totalLoss ? res.totalLoss : 0)
      setTotalFloat(res.totalFloat ? res.totalFloat : 0)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!popupOpen[machine._id]) return
    getTimers()
  }, [page])

  useEffect(() => {
    const loadInterv = setInterval(() => {
      getTimers()
    }, 1000 * 5)
    return () => {
      setLogs([])
      setPage(1)
      setItemsPerPage(10)
      setResultCount(0)
      setTotalTons(0)
      setTotalLoss(0)
      setTotalGain(0)
      setTotalFloat(0)
      onClosePopup(machine._id)
      clearInterval(loadInterv)
    }
  }, [])

  const timerContext = useMemo(() => {
    let timerValue = getTimerValueCtx(city, machine.timerId)
    if (!timerValue) return {}
    return timerValue
  }, [getTimerValueCtx, machine.timerId, city])

  const time = useMemo(() => {
    let timerValue = getTimerValueCtx(city, machine.timerId)
    if (!timerValue) return ""
    return timerValue.time
  }, [timerContext])

  return (
    <div className="bg-white time-tracker-table-container" style={{ height: '100%', display: 'flex', flexFlow: 'column', justifyContent: 'space-between' }}>
      <div style={{ flexGrow: 1 }}>
        <div style={{ position: 'relative' }}>
          <div>
            <h2 style={{ textAlign: "center", fontSize: '3rem', marginBottom: '-0.5rem' }}>{machine.name}</h2>
            <h3 style={{ textAlign: "center", fontSize: '1.3rem', marginBottom: '0.3rem', color: '#d0d0d0' }}>{city}</h3>
          </div>
          <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', padding: '.6rem 1.3rem' }}>
            <h2 style={{ color: timerContext.isExpired ? "#00c800" : "#ec4561", textAlign: "center", fontSize: '4rem', lineHeight: '80%' }}>{timerContext.timeText}</h2>
            {/* <h3 className='text-info' style={{textAlign:"center", fontSize:'1rem'}}>{timerContext.operator}</h3> */}
          </div>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', padding: '.6rem 1.3rem', display: 'flex' }}>
            <h3 className='text-warning' style={{ textAlign: "center", fontSize: '1.6rem' }}>Daily<br />Units</h3>
            <h2 style={{ textAlign: "center", fontSize: '4rem', lineHeight: '90%', marginLeft: '1rem' }}>{timerContext.dailyUnit}</h2>
          </div>
        </div>
        <div className="time-tracker-table border-top" style={{ overflowY: 'auto' }}>
          <table className="w-100 table table-nowrap mb-0" id="jobstable">
            <thead className="" style={{ position: "sticky" }}>
              <tr>
                <th
                  style={{ paddingLeft: "16px", width: 88 }}
                  onClick={() => sortTable("name", jobs)}
                >
                  CYCLE
                </th>
                <th>DATE</th>
                <th className="">PART/PRODUCT</th>

                <th>OPERATOR</th>
                <th>ID</th>
                <th style={{ width: "90px" }}>STATUS</th>
                <th style={{ width: "100px" }}>TIME</th>
                <th style={{ width: "50px" }}>STOP REASON</th>
              </tr>
            </thead>

            <tbody style={{ minHeight: "200px" }}>
              {filters.includeCycle
                ? logs.map((trackTimer, index) => (
                  <tr key={index} style={{ height: "63px" }}>
                    <td style={{ paddingLeft: "24px" }}>
                      <div className="d-flex align-items-center">
                        <b className="name">
                          {resultCount -
                            (page - 1) * items_per_page -
                            index >
                            0
                            ? resultCount -
                            (page - 1) * items_per_page -
                            index
                            : ""}
                        </b>
                      </div>
                    </td>
                    <td className="">
                      <div>
                        <div>
                          <b className="name">
                            {trackTimer.startTime
                              ? new Date(
                                new Date(trackTimer.startTime) -
                                1000 * 5 * 3600
                              )
                                .toISOString()
                                .substring(0, 10)
                              : ""}
                          </b>
                        </div>
                        <div className="text-primary" style={{ color: '#000' }}>
                          {trackTimer.startTime
                            ? new Date(
                              new Date(trackTimer.startTime) -
                              1000 * 5 * 3600
                            )
                              .toISOString()
                              .substring(11, 19)
                            : ""}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="name" style={{ width: "288px" }}>
                        <b>{trackTimer.part ? trackTimer.part.name : ""}</b>
                      </div>
                    </td>
                    <td className="name">
                      <div>
                        <b>{trackTimer.operator}</b>
                      </div>
                    </td>
                    <td>{trackTimer.id}</td>
                    <td>
                      <div>
                        {resultCount -
                          (page - 1) * items_per_page -
                          index >
                          0 && (
                            <b
                              style={{ color: trackTimer.time <= trackTimer.productionTime ? "#00c800" : "#ec4561" }}
                            >
                              {trackTimer.time > trackTimer.productionTime
                                ? "LOSS"
                                : "GAIN"}
                            </b>
                          )}
                      </div>
                    </td>
                    <td>
                      <div>
                        {resultCount -
                          (page - 1) * items_per_page -
                          index >
                          0 && (
                            <b
                              style={{ color: trackTimer.time <= trackTimer.productionTime ? "#00c800" : "#ec4561" }}
                            >
                              {formatSeconds(
                                (new Date(trackTimer.endTime) -
                                  new Date(trackTimer.startTime)) /
                                1000
                              )}
                            </b>
                          )}
                      </div>
                    </td>
                    <td>{trackTimer.stoppingReason}</td>
                    {/* <td className="position-relative">
                            <b className="position-absolute three-dot-icon-end">
                              <i
                                className="mdi mdi-dots-vertical cursor-pointer"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                id={"expEdit" + index}
                              ></i>
                              <div
                                className="dropdown-menu dropdown-menu-end"
                                aria-labelledby={"expEdit" + index}
                              >
                                <div className="dropdown-item p-4 py-2 cursor-pointer">
                                  Stop
                                </div>
                                <div className="dropdown-item p-4 py-2 cursor-pointer">
                                  Start
                                </div>
                              </div>
                            </b>
                          </td> */}
                  </tr>
                ))
                : ""}
            </tbody>
          </table>
        </div>
      </div>
      <div
        className="border-top pagination py-2 d-flex align-items-center"
        style={{ borderRadius: 0, fontSize: "1.1rem" }}
      >
        {filters.includeCycle &&
          // Math.ceil(resultCount / items_per_page) ? 
          (
            <>
              <div
                className="pe-0 cursor-pointer"
                style={{ paddingLeft: "24px" }}
              >
                <div
                  className="d-flex align-items-center border-end pe-2"
                  onClick={() => {
                    if (page > 1) {
                      setPage(page - 1)
                    }
                  }}
                >
                  <span className="mdi mdi-chevron-left"></span>
                  <span>PREV</span>
                </div>
              </div>

              <div className="px-0 cursor-pointer">
                <div className="d-flex align-items-center border-end px-2 position-relative">
                  {page}
                  <i
                    className="mdi mdi-menu-down"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    id="setpage"
                  ></i>
                  <span>
                    {" "}
                    of {Math.ceil(resultCount / items_per_page)}
                  </span>
                  <div
                    className="dropdown-menu dropdown-menu-end border-0 p-0"
                    aria-labelledby="setpage"
                  >
                    <input
                      className="form-control"
                      type="number"
                      onChange={e => {
                        if (e.target.value > 0) setPage(e.target.value)
                      }}
                      style={{ width: "64px" }}
                    />
                  </div>
                </div>
              </div>

              <div className="px-2 cursor-pointer">
                <div
                  className="d-flex align-items-center"
                  onClick={() => {
                    if (page < Math.ceil(resultCount / items_per_page))
                      setPage(page + 1)
                  }}
                >
                  <span>NEXT</span>
                  <span className="mdi mdi-chevron-right"></span>
                </div>
              </div>
            </>
          )}
        <div className="flex-1 d-flex align-items-center total-analytics ms-0">
          <div className="d-flex" style={{ marginRight: "auto" }}>
            <a
              className="btn btn-success m-2"
              // target="_blank"
              // href={`/report/${city}/${classify}/${activeMachine}/${filters.from}/${filters.to}`}
              style={{
                backgroundColor: `${reportBtnColor}`,
                borderColor: `${reportBtnColor}`,
              }}
              disabled
            >
              View Report
            </a>
            <div className="d-inline-flex flex-column ms-3 align-items-center justify-content-center">
              <span>Time:{" "}{timerContext.timeText}</span>
            </div>
            <div
              className="d-inline-flex flex-column ms-3"
              style={{ marginLeft: "10px", fontSize: 'larger' }}
            >
              <div className="text-end">
                <b>{machine && machine.name} TOTAL UNITS:</b>
              </div>
              <div className="text-end">
                <b>{machine && machine.name} TOTAL TONS:</b>
              </div>
            </div>
            <div
              className="d-inline-flex flex-column ms-3"
            >
              <div className="text-end">
                <b>{resultCount}</b>
              </div>
              <div className="text-end">
                <b>{totalTons}</b>
              </div>
            </div>
          </div>
          <div className="divide-vertical"></div>
          <div className="me-4  ps-2">
            <div className="d-inline-flex flex-column">
              <div className="text-end ">
                <b>TOTAL GAIN:</b>
              </div>
              <div className="text-end ">
                <b>TOTAL LOSS:</b>
              </div>
              <div className="text-end ">
                <b>TOTAL FLOAT:</b>
              </div>
            </div>
            <div className="d-inline-flex flex-column ms-3">
              <div className="text-end" style={{ color: "#00c800" }}>
                <b>{formatSeconds(totalGain)}</b>
              </div>
              <div className="text-end" style={{ color: "#ec4561" }}>
                <b>{formatSeconds(totalLoss)}</b>
              </div>
              <div className="text-end text-warning">
                <b>{formatSeconds(Math.max(totalFloat, 0))}</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}