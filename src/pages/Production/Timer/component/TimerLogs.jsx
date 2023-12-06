import {
  getProducts,
  getTimerLogsOfMachine,
  searchMacheinsAction,
} from "actions/timer"
import { machineClasses } from "helpers/globals"
import React, { useEffect, useMemo, useRef, useState } from "react"

import { formatSeconds, lbsToTons } from "../../../../helpers/functions.js"
import { useNetStatus } from "context/net"

import PopupWindow from './PopupWindow.jsx'
import NewWindow from 'react-new-window'
import LogTable from "./LogTable.jsx"
import LogTableFS from "./LogTableFS.jsx"
import Report from "./Report.jsx"

const TimerLogs = props => {
  const { isOnline } = useNetStatus()
  const { city, filteredParts } = props
  const [resultCount, setResultCount] = useState(0)
  const [part, setPart] = useState("")
  const [timer, setTimer] = useState("")
  const [trackTimers, setTrackTimers] = useState([])
  const [machines, setMachines] = useState([])
  const [colors, setColors] = useState([])
  const [page, setPage] = useState(1)
  const [tab, setTab] = useState(0)
  const [logs, setLogs] = useState([])
  const [totalTons, setTotalTons] = useState(0)
  const [totalLoss, setTotalLoss] = useState(0)
  const [totalGain, setTotalGain] = useState(0)
  const [totalFloat, setTotalFloat] = useState(0)
  const [reportBtnColor, setReportBtnColor] = useState("yellow")
  const [activeMachine, setActiveMachine] = useState(0)
  const [forToday, setForToday] = useState()
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState({
    machineClass: machineClasses[0],
    productClass: "",
    includeCycle: true,
    from: null,
    to: null,
  })
  const [parts, setParts] = useState([])
  const reportWindowRef = useRef()
  const updateFilter = (f, e) => {
    if (f == "machineClass")
      setFilters({
        ...filters,
        [f]: e.target ? e.target.value : e,
        productClass: "",
      })
    else
      setFilters({
        ...filters,
        [f]: e.target ? e.target.value : e,
      })
  }
  const updateDateRange = (start, end) => {
    // setFilters({
    //   ...filters,
    //   from: start ? start.format("YYYY-MM-DD") : null,
    //   to: end ? end.format("YYYY-MM-DD") : null,
    // })
  }
  // const getDateRangeText = useMemo(() => {
  //   if (filters.from == null || filters.to == null)
  //     return "Please Select the Range"
  //   return filters.from + " - " + filters.to
  // }, [filters.from, filters.to])
  const setActiveTab = async index => {
    setTab(index)
    setPage(1)
    getMachineLogs(machines[index]._id)
  }
  useEffect(() => {
    if (machines[tab]) getMachineLogs(machines[tab]._id)
  }, [part, timer, filters])
  const getMachineLogs = async id => {
    if (!id) return
    props.setLoading(true)
    try {
      let res = await getTimerLogsOfMachine(
        id,
        part,
        filters.from,
        filters.to,
        page,
        filters.includeCycle,
        props.machineClass,
        props.city,
        props.items_per_page,
        query,
        isOnline,
        timer,
      )
      if (res == "You take too long period to get the log.") {
        console.log("You take too long period to get the log.")
        props.setLoading(false)
        return
      }
      if (!res.logs) res.logs = []
      if (res.logs.length < 8) while (res.logs.length < 8) res.logs.push({})
      setLogs(res.logs)
      setResultCount(res.total ? res.total : 0)
      setTotalTons(lbsToTons(res.totalTons ? res.totalTons : 0))
      setTotalGain(res.totalGain ? res.totalGain : 0)
      setTotalLoss(res.totalLoss ? res.totalLoss : 0)
      setTotalFloat(res.totalFloat ? res.totalFloat : 0)
      setForToday(res.forToday)
      let _tableSummary = props.tableSummary
      _tableSummary[[id]] = { total: res?.total || 0, totalTons: res?.totalTons || 0 }
      await props.setTableSummary(_tableSummary)
      // const tmp = props.updateLogForGlobal
      // props.setUpdateLogForGlobal(tmp + 1);
      props.update()
      // updateSummary()
      props.setLoading(false)
    } catch (error) {
      console.log(error)
      props.setLoading(false)
    }
  }
  const [summary, setSummary] = useState({})
  const updateSummary = async () => {
    let _sub_total = 0,
      _sub_totalTons = 0,
      _global_total = 0,
      _global_totalTons = 0
    for (const machine of machines) {
      if (Object.keys(props.tableSummary).includes(machine._id)) {
        _sub_total += !props.tableSummary[[machine._id]].total ? 0 : props.tableSummary[[machine._id]].total
        _sub_totalTons += !props.tableSummary[[machine._id]].totalTons ? 0 : props.tableSummary[[machine._id]].totalTons
      }
    }
    for (var id in props.tableSummary) {
      _global_total += !props.tableSummary[id].total ? 0 : props.tableSummary[id].total
      _global_totalTons += !props.tableSummary[id].totalTons ? 0 : props.tableSummary[id].totalTons
    }
    setSummary({
      total: _sub_total,
      totalTons: lbsToTons(_sub_totalTons),
      global_total: _global_total,
      global_totalTons: lbsToTons(_global_totalTons),
    })
  }
  useEffect(async () => {
    updateSummary()
  }, [props.tableSummary])

  useEffect(async () => {
    for (const machine of machines) {
      const res = await getTimerLogsOfMachine(
        machine._id,
        part,
        filters.from,
        filters.to,
        page,
        filters.includeCycle,
        props.machineClass,
        props.city,
        props.items_per_page,
        query,
        isOnline,
        timer,
      )

      if (res == "You take too long period to get the log.") {
        console.log("You take too long period to get the log.")
        updateDateRange(null, null)
        return
      }

      let _tableSummary = props.tableSummary
      _tableSummary[[machine._id]] = {
        total: res.total,
        totalTons: res.totalTons,
      }
      await props.setTableSummary(_tableSummary)
      props.update()
    }
    updateSummary()
  }, [machines])

  useEffect(() => {
    if (props.refreshLogs && machines[tab]) {
      getMachineLogs(machines[tab]._id)
      props.afterRefresh()
    }
  }, [props.refreshLogs])

  useEffect(() => {
    if (machines[tab]) getMachineLogs(machines[tab]._id)
  }, [page, props.items_per_page])

  const updateProducts = async () => {
    const res = await getProducts(
      "Part",
      -1,
      {
        city,
        machineClass: props.machineClass,
      },
      isOnline
    )
    setParts(res.products)
  }
  const reset = async () => {
    setFilters({
      machineClass: machineClasses[0],
      productClass: "",
      includeCycle: true,
      from: null,
      to: null,
    });
  }
  useEffect(() => {
    updateProducts()
  }, [city, filters.machineClass])

  useEffect(() => {
    const _machines = props.timers.map(timer => {
      return { ...timer.machine[0], timerId: timer._id, partName: timer.part && timer.part.length && timer.part[0].name }
    })
    setMachines(_machines)
    setColors(
      _machines.map(m => {
        const _color = (m.color && m.color.includes('rgb'))
          ? m.color
          : `rgb(${parseInt(Math.random() * 256)}, ${parseInt(
            Math.random() * 256
          )}, ${parseInt(Math.random() * 256)})`

        let _colors = props.btnColors
        _colors[m.timerId] = _color
        props.setBtnColors(_colors)
        return _color
      })
    )
    if (_machines.length && _machines[tab])
      getMachineLogs(
        _machines[tab]._id
      )
  }, [props.timers])

  useEffect(() => {
    if (colors.length > 0) setReportBtnColor(colors[0])
  }, ["COLORS", colors])

  const reloadLogs = (machine) => {
    if (machine) {
      getMachineLogs(machine._id, filters)
    }
  }

  const [popupOpen, setPopupOpen] = useState({})
  const [popupData, setPopupData] = useState({ links: [] })

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  const onPopupClick = async (id) => {
    if (document.getElementsByClassName("timer-log-table").length == 0) return
    const elem = document.getElementsByClassName("timer-log-table")[0].getBoundingClientRect()
    setWindowSize({
      width: elem.width,
      height: elem.height,
    })
    setPopupOpen(prev => ({ ...prev, [id]: true }))
  }

  const onClosePopup = (id) => {
    setPopupOpen(prev => ({ ...prev, [id]: false }))
  }

  const [showReport, setShowReport] = useState(false)

  const openReport = () => {
    setShowReport(true)
  }

  const onClickReport = (e) => {
    e.preventDefault()
    // let url = `/report/${city}/${props.classify}/${activeMachine}/${filters.from}/${filters.to}`
    openReport()
  }

  return (
    <React.Fragment>
      {machines.length > 0 && machines.map((machine, index) => {
        return (popupOpen[machine._id] && (
          <NewWindow key={'timerlog_window_' + machine._id} copyStyles={true} features={windowSize} center='parent' onResize={() => { }} onUnload={() => onClosePopup(machine._id)} closeOnUnmount={false} title={machine.name + ' : ' + machine.partName}>
            <LogTableFS {...{
              formatSeconds,
              filters,
              logs,
              resultCount,
              page,
              setPage,
              items_per_page: props.items_per_page,
              totalFloat,
              totalGain,
              totalLoss,
              machine,
              part,
              machineClass: props.machineClass,
              city: props.city,
              isOnline,
              query,
              onClosePopup,
              popupOpen,
              lbsToTons,
            }}
            />
          </NewWindow>
        ))
      })}
      {
        showReport && (
          <NewWindow copyStyles={true} features={{
            width: 800,
            height: 1000,
          }}
            center='parent'
            onUnload={() => setShowReport(false)}
            closeOnUnmount={false}
            title={'Report'}
          >
            <Report
              city={city}
              machines={[machines[tab]]}
              from={filters.from}
              to={filters.to}
              onClosePopup={() => setShowReport(false)}
              includeCycle={filters.includeCycle}
              machineClass={props.machineClass}
              query={query}
              isOnline={isOnline}
              timer={timer}
            />
          </NewWindow>
        )
      }
      {/* <div className="row m-0 rounded">
        <div className="search-container mx-0">
          <div className="d-flex flex-1 w-full" style={{ paddingLeft: "13px" }}>
            <div className="" style={{ flexGrow: 1 }}>
              <div
                className="row mt-2"
                style={{ marginLeft: "0px", fontSize: "18px" }}
              >
                <h3>PRODUCTION LOOKUP</h3>
              </div>
              <div className="row m-0">
                <div className="mb-2 align-items-center col-xl-3">
                  <h5>SELECT TIMER</h5>
                  <select
                    className="form-select"
                    defaultValue=""
                    onChange={async e => {
                      setTimer(e.target.value)
                    }}
                  >
                    <option value="">
                      All
                    </option>
                    {props.timers.map(timer => (
                      <option
                        value={timer._id}
                        key={"log-filter1-" + timer._id}
                      >
                        {timer.machine[0].name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-2 align-items-center col-xl-3">
                  <h5>SELECT PART OR PRODUCT</h5>
                  <select
                    className="form-select"
                    defaultValue=""
                    onChange={async e => {
                      setPart(e.target.value)
                    }}
                  >
                    <option value="">
                      All
                    </option>
                    {parts.map(part => (
                      <option value={part._id} key={"log-filter1-" + part._id}>
                        {part.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-2 align-items-center col-xl-2">
                  <h5>
                    <div>INCLUDE CYCLES</div>
                  </h5>
                  <div className="d-flex align-items-stretch">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={filters.includeCycle}
                      onChange={() =>
                        updateFilter("includeCycle", !filters.includeCycle)
                      }
                    />
                    <h6 className="ms-2" style={{ marginTop: '.2rem' }}>Yes</h6>
                  </div>
                </div>
                <div className="align-items-center col-xl-4">
                  <h5>REVIEW RANGE</h5>
                  <DateRangePicker
                    // initialSettings={{ startDate: '1/1/2014', endDate: '3/1/2014' }}
                    value={{ startDate: filters.from, endDate: filters.to }}
                    onCallback={(start, end, label) => {
                      updateDateRange(start, end)
                    }}
                    onEvent={(event, picker) => { }}
                  >
                    <button
                      className="btn btn-apply-date"
                      style={{ backgroundColor: "#102136" }}
                    >
                      {getDateRangeText}
                    </button>
                  </DateRangePicker>
                </div>
              </div>

              <div className="m-0 search-box row mb-3">
                <div className="col-xl-3">
                </div>

                <div className="col-xl-3">
                </div>

                <div className="col-xl-2 d-flex align-items-center">
                </div>

              </div>
            </div>
            <div className="" style={{ flexShrink: 0, flexGrow: 0 }}>
              <div
                className="align-items-center d-flex cursor-pointer"
                style={{
                  justifyContent: "center",
                  fontSize: "15px",
                  letterSpacing: "2px",
                  backgroundColor: "#102136",
                  height: "50%",
                  color: "white",
                  fontFamily: "'Bebas Neue', sans-serif",
                  padding: '0px 10px'
                }}
                onClick={updateProducts}
              >
                SEARCH
              </div>
              <div
                className="align-items-center d-flex"
                style={{
                  justifyContent: "center",
                  fontSize: "20px",
                  backgroundColor: "white",
                  height: "50%",
                  color: "#102136",
                  fontWeight: "bold",
                }}
              >
                <span
                  className="mdi mdi-refresh cursor-pointer"
                  onClick={reset}
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <div className="d-flex justify-content-between align-items-center">
        <h2 className="mb-3 mt-3" style={{ paddingLeft: "15px" }}>
          TIMER TRACKER - {props.classify}{" "}
        </h2>
      </div>
      <div className="bg-white time-tracker-table-container">
        <div className="time-tracker-table-header d-flex">
          <div className="flex-1 d-flex">
            {colors.map((color, index) => (
              <div
                className={`time-tracker-tab ongoing-job-tab cursor-pointer ${tab === index ? "active" : ""
                  }`}
                style={{ borderTop: `5px solid ${color}` }}
                onClick={() => {
                  setActiveTab(index)
                  setReportBtnColor(color)
                  setActiveMachine(index)
                }}
                key={"tab" + index}
              >
                <div>
                  <h4 className="mb-0">
                    {machines[index] && machines[index].name}
                  </h4>
                  <h6 className="text-secondary">
                    {machines[index] && machines[index].city}
                  </h6>
                </div>
              </div>
            ))}
          </div>
          {machines && machines.length > 0 &&
            <div className="d-flex align-items-center mx-3 py-1 count-show">
              <div className="position-relative">
                <span
                  className="mdi mdi-fullscreen cursor-pointer"
                  style={{ fontSize: "24px" }}
                  onClick={() => onPopupClick(machines[tab]?._id)}
                ></span>
                {/* {popupOpen?'CLOSE':"OPEN"} */}
                {/* <input
                className="form-control bg-light ps-5"
                placeholder="Search..."
                onChange={e => {
                  setQuery(e.target.value)
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    if (machines[tab]) getTimers(machines[tab]._id)
                  }
                }}
              />
              <i className="bi bi-search position-absolute"></i> */}
              </div>
            </div>
          }
          {/* {props.index == 0 ? (
            <div className="d-flex align-items-center me-5 ">
              <span className="me-2">Show</span>
              <input
                className="p-2 bg-light form-control"
                style={{ width: 32 }}
                value={props.items_per_page}
                onChange={e => {
                  props.setItemsPerPage(e.target.value)
                  setPage(page)
                }}
              />
            </div>
          ) : (
            ""
          )} */}
        </div>


        <LogTable {...{
          formatSeconds,
          filters,
          logs,
          resultCount,
          page,
          setPage,
          items_per_page: props.items_per_page,
          totalFloat,
          totalGain,
          totalLoss,
          totalTons,
          machine: machines[tab],
          reloadLogs,
          forToday,
          onClickReport,
        }}
        />

      </div>
      <div
        className="statistics-container"
      >
        <div className="row">
          <div className="col-8">
            <div
              className="d-inline-flex flex-column"
              style={{ textAlign: "right" }}
            >
              <div className="text-end ">
                <b>OVERALL UNITS:</b>
              </div>
              <div className="text-end ">
                <b>OVERALL TONS:</b>
              </div>
              <div className="text-end ">
                <b>GLOBAL UNITS:</b>
              </div>
              <div className="text-end ">
                <b>GLOBAL TONS:</b>
              </div>
            </div>
          </div>
          <div className="col-4 ml-0 pl-0">
            <div className="d-inline-flex flex-column">
              <div>
                <b>{summary.total}</b>
              </div>
              <div>
                <b>{summary.totalTons}</b>
              </div>
              <div>
                <b>{summary.global_total}</b>
              </div>
              <div>
                <b>{summary.global_totalTons}</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default TimerLogs
