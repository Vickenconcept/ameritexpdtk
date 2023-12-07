// Summary: This file contains the code for the report lookup page. This page allows the user to search for a report based on the timer, part, and date range. The user can also choose to include cycles in the report. The user can also choose to export the report to a CSV file.
import { useState, useMemo, useEffect } from "react"
import {
  cities,
  factories,
  machineClasses,
  mc2factory,
} from "../../../../helpers/globals"
import {
  getProducts,
} from "../../../../actions/timer"
import { updateReport } from "../../../../actions/auth.js"
import Multiselect from 'multiselect-react-dropdown';
import DateRangePicker from "react-bootstrap-daterangepicker"
import NewWindow from 'react-new-window'
import Report from '../../Timer/component/Report.jsx'
import "bootstrap-daterangepicker/daterangepicker.css"
import "./daterangepicker.scss"
import "./style.scss"
import SweetAlert from "react-bootstrap-sweetalert"

function isEqualArray(arr1, arr2) {
  if (arr1 === arr2) return true
  if (!_.isArrayLike(arr1) || !_.isArrayLike(arr2)) return false
  let tmp = (arr1.length > arr2.length) ? _.difference(arr1, arr2) : _.difference(arr2, arr1)
  return ((tmp == undefined || tmp.length == 0) ? true : false)
}

function isEqualReport(item1, item2) {
  if (!item1 || !item2) return false
  if (!isEqualArray(item1.city, item2.city)) return false
  if (!isEqualArray(item1.factory, item2.factory)) return false
  if (!isEqualArray(item1.machineClass, item2.machineClass)) return false
  if (!isEqualArray(item1.machine?.map(item => item._id), item2.machine?.map(item => item._id))) return false
  return true
}

function hasReport(filters, reports) {
  if (!reports || reports.length == 0) return false
  let res = reports.find(item => isEqualReport(item, filters))
  return (res !== null && res !== undefined)
}

export default ({
  pinnable,
  report,
  user_report: user_report,
  loadUserReport: loadUserReport,
  editable,
}) => {

  const initialSettings = {
    city: [],
    machine: [],
    machineClass: [],
    factory: [],
    productClass: "",
    includeCycle: false,
    from: null,
    to: null,
    ...report,
  }
  const [filters, setFilters] = useState(initialSettings)
  const [machines, setMachines] = useState([])

  const [showReport, setShowReport] = useState(false)

  const openReport = () => {
    if (!enabled) return false
    setShowReport(true)
  }

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
  const onReset = () => {
    setFilters(prev => (pinnable ? initialSettings : {
      ...initialSettings,
      from: null,
      to: null,
      includeCycle: false,
    }))
  }
  const updateDateRange = (start, end) => {
    setFilters({
      ...filters,
      from: start ? start.format("YYYY-MM-DD") : null,
      to: end ? end.format("YYYY-MM-DD") : null,
    })
  }
  const getDateRangeText = useMemo(() => {
    if (filters.from == null || filters.to == null)
      return "Today"
    return filters.from + " - " + filters.to
  }, [filters.from, filters.to])

  useEffect(async () => {
    cities.forEach(item => {
      getProducts("Machine", -1, {
        city: item,
      }).then(data => data.products)
        .then(data => {
          setMachines(prev => [...prev, ...data])
        })
        .catch(err => {
          console.log(err)
          // setMachines([])
        })
    })
  }, [])

  useEffect(() => {
    if (filters?.city?.length == 0) {
      setFilters({
        ...initialSettings,
        city: filters?.city,
      })
    }
    else {
      // updateFilter("machine", [...filters.machine.filter(item=> {
      //   return filters?.city.includes(item.city)
      // })])
    }
  }, [filters?.city])

  const filteredMachines = useMemo(() => {
    if (filters.city.length == 0)
      return []
    updateFilter("machine", filters.machine.filter(item =>
      filters.city.includes(item.city) &&
      filters.factory.includes(item.factory) &&
      filters.machineClass.includes(item.machineClass)
    ))
    return machines.filter(item =>
      filters.city.includes(item.city) &&
      filters.factory.includes(item.factory) &&
      filters.machineClass.includes(item.machineClass)
    )
  }, [filters?.city, filters?.factory, filters?.machineClass, machines])

  const filteredMachineClasses = useMemo(() => {
    if (filters.factory && filters.factory.length > 0) {
      let mc = []
      console.log('-------------------------')
      console.log(filters.factory)
      mc = machineClasses.filter(item => {
        return filters.factory.includes(mc2factory(item))
      })
      console.log(mc)
      console.log('-------------------------')
      return _.uniq([...mc])
    }
    else {
      return _.uniq([...machineClasses])
    }
  }, [filters?.factory])

  useEffect(() => {
    updateFilter("machineClass", [...filters.machineClass.filter(item => {
      return filteredMachineClasses.includes(item)
    })])
  }, [filteredMachineClasses])

  const enabled = useMemo(() => {
    return (filters?.city?.length > 0 && filters?.machine && filters?.machine?.length > 0) ? true : false
  }, [filters?.machine])

  const pinned = useMemo(() => {
    if (!user_report) return false
    return isEqualReport(pinnable ? filters : report, user_report)
  }, [filters, user_report, report])

  const onPin = async () => {
    if (!enabled) return false
    if (!pinnable) await updateReport('remove', report)
    else
      setShowAlert(true)
    if (pinned)
      setAlert({ success: true, msg: "Successfully removed!" })
    else
      setAlert({ success: true, msg: "Successfully created!" })
    await updateReport(pinned ? 'remove' : 'push', {
      city: filters.city,
      factory: filters.factory,
      machineClass: filters.machineClass,
      machine: filters.machine.map(item => ({
        _id: item._id,
        name: item.name,
        machineClass: item.machineClass,
        factory: item.factory,
        city: item.city
      }))
    })
    if (typeof (loadUserReport) !== `undefined`)
      loadUserReport()
  }

  const [alert, setAlert] = useState({
    success: true,
    error: false,
    msg: "",
  })

  const [showAlert, setShowAlert] = useState(false)

  return (
    <div className="row m-0 mb-3 rounded">
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
              city={filters.city[0]}
              machines={filters.machine}
              from={filters.from}
              to={filters.to}
              onClosePopup={() => setShowReport(false)}
              includeCycle={filters.includeCycle}
              machineClass={null}
              query={''}
              isOnline={true}
              timer={null}
            />
          </NewWindow>
        )
      }
      {showAlert && (
        <SweetAlert
          success={alert.success}
          error={alert.error}
          onConfirm={() => setShowAlert(false)}
          title=""
        >
          {alert.msg}
        </SweetAlert>
      )}
      <div className="search-container mx-0">
        <div className="d-flex flex-1 w-full" style={{ paddingLeft: "13px" }}>
          <div className="" style={{ flexGrow: 1 }}>
            <div
              className="row mt-2"
              style={{ marginLeft: "0px", fontSize: "18px" }}
            >
              <h3>PRODUCTION REPORT LOOKUP</h3>
            </div>
            <div className="row mb-3 m-0">
              <div className="mb-2 align-items-center col-xl-2">
                <h5>Select City</h5>
                <Multiselect
                  disable={!editable}
                  options={cities.map((item, index) => ({ name: item }))}
                  hideSelectedList={true}
                  showCheckbox={true}
                  selectedValues={filters.city.map((item, index) => ({ name: item }))}
                  onSelect={(a, b) => {
                    // console.log (a,b)
                    updateFilter("city", a.map(item => item.name))
                  }}
                  onRemove={(a, b) => {
                    updateFilter("city", a.map(item => item.name))
                  }}
                  displayValue="name"
                  placeholder="Select city"
                />
                <input style={{ position: "absolute", opacity: "0.0" }} />
              </div>
              {filters.city && filters.city != "" &&
                <>
                  <div className="mb-2 align-items-center col-xl-2">
                    <h5>FACTORY</h5>
                    <Multiselect
                      disable={!editable}
                      options={factories.map((item, index) => ({ name: item }))}
                      hideSelectedList={true}
                      showCheckbox={true}
                      selectedValues={filters.factory.map((item, index) => ({ name: item }))}
                      onSelect={(a, b) => {
                        // console.log (a,b)
                        updateFilter("factory", a.map(item => item.name))
                      }}
                      onRemove={(a, b) => {
                        updateFilter("factory", a.map(item => item.name))
                      }}
                      displayValue="name"
                      placeholder="Select Factory"
                    />
                  </div>
                  <div className="mb-2 align-items-center col-xl-2">
                    <h5>MACHINE CLASS</h5>
                    <Multiselect
                      disable={!editable}
                      options={filteredMachineClasses.map((item, index) => ({ name: item }))}
                      hideSelectedList={true}
                      showCheckbox={true}
                      selectedValues={filters.machineClass.map((item, index) => ({ name: item }))}
                      onSelect={(a, b) => {
                        // console.log (a,b)
                        updateFilter("machineClass", a.map(item => item.name))
                      }}
                      onRemove={(a, b) => {
                        updateFilter("machineClass", a.map(item => item.name))
                      }}
                      displayValue="name"
                      placeholder="Select Machine Class"
                    />
                  </div>
                  <div className="mb-2 align-items-center col-xl-2">
                    <h5>Machine</h5>
                    <Multiselect
                      disable={!editable}
                      options={filteredMachines}
                      hideSelectedList={true}
                      showCheckbox={true}
                      selectedValues={filters.machine}
                      onSelect={(a, b) => {
                        updateFilter("machine", a)
                        // console.log (a,b)
                      }}
                      onRemove={(a, b) => {
                        // console.log (a,b)
                        updateFilter("machine", a)
                      }}
                      displayValue="name"
                      placeholder="Select Machine"
                    />
                    <input style={{ position: "absolute", opacity: "0.0" }} />
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
                  <div className="d-flex flex-column align-items-center col-xl-2">
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
                        className="btn-action btn-apply-date"
                      >
                        {getDateRangeText}
                      </button>
                    </DateRangePicker>
                  </div>
                </>
              }
            </div>
            {filters.city && filters.city != "" &&
              <>
                <div className="row m-0">
                  <div className="col-12">
                    Confirmation Selections
                  </div>
                </div>
                <div className="row mb-3 m-0 confirmation-table">
                  <div className="mb-2 align-items-center col-xl-2">
                    {
                      filters.city && filters.city != "" && filters.city.map((item, index) => (
                        <div key={`filter_item_selected${index}`} className="d-flex align-items-stretch">
                          {editable && (
                            <span
                              className="mdi mdi-close-circle-outline ms-2"
                              onClick={() => {
                                updateFilter("city", filters.city.filter(city => city != item))
                              }}
                            ></span>
                          )}
                          {item}
                        </div>
                      ))
                    }
                  </div>
                  <div className="mb-2 align-items-center col-xl-2">
                    {
                      filters.factory && filters.factory != "" && filters.factory.map((item, index) => (
                        <div key={`filter_item_selected${index}`} className="d-flex align-items-stretch">
                          {editable && (
                            <span
                              className="mdi mdi-close-circle-outline ms-2"
                              onClick={() => {
                                updateFilter("factory", filters.factory.filter(factory => factory != item))
                              }}
                            ></span>
                          )}
                          {item}
                        </div>
                      ))
                    }
                  </div>
                  <div className="mb-2 align-items-center col-xl-2">
                    {
                      filters.machineClass && filters.machineClass != "" && filters.machineClass.map((item, index) => (
                        <div key={`filter_item_selected${index}`} className="d-flex align-items-stretch">
                          {editable && (
                            <span
                              className="mdi mdi-close-circle-outline ms-2"
                              onClick={() => {
                                updateFilter("machineClass", filters.machineClass.filter(mc => mc != item))
                              }}
                            ></span>
                          )}
                          {item}
                        </div>
                      ))
                    }
                  </div>
                  <div className="mb-2 align-items-center col-xl-2">
                    {
                      filters.machine && filters.machine != "" && filters.machine.map((item, index) => (
                        <div key={`filter_item_selected${index}`} className="d-flex align-items-stretch">
                          {editable && (
                            <span
                              className="mdi mdi-close-circle-outline ms-2"
                              onClick={() => {
                                updateFilter("machine", filters.machine.filter(machine => machine?._id != item?._id))
                              }}
                            ></span>
                          )}
                          {item?.name}
                        </div>
                      ))
                    }
                  </div>
                  <div className="mb-2 align-items-center col-xl-1">
                    {
                      filters.includeCycle ? "Yes" : "No"
                    }
                  </div>
                  <div className="mb-2 align-items-center col-xl-3 text-end">
                    {
                      getDateRangeText
                    }
                  </div>
                  {enabled &&
                    <div className="col-12 d-flex justify-content-end">
                      <button className="btn btn-load" onClick={openReport} disabled={!enabled}>
                        {/* <i className='mdi mdi-check'></i> */}
                        REPORT
                      </button>
                    </div>
                  }
                </div>
              </>
            }
          </div>
          <div className="button-container">
            <a
              className={`btn-action btn-pin ${pinned ? 'active' : ''}`}
              onClick={onPin}
              title={'pin'}
              disabled={false}
            >
              <span
                className="mdi mdi-pin"
              ></span>
            </a>
            <a
              className="btn-action btn-reset"
              onClick={onReset}
              title={'reset'}
            >
              <span
                className="mdi mdi-refresh"
              ></span>
            </a>
            {/* <a
                className="btn-action btn-report"
                disabled={!enabled}
                onClick={openReport}
                title={'report'}
              >
                <span
                  className="mdi mdi-book"
                ></span>
              </a> */}
          </div>
        </div>
      </div>
    </div>
  )
}