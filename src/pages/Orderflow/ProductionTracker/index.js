import { useContext, useEffect, useRef, useState } from "react"
import { cities, factories } from "helpers/globals"
import MetaTags from "react-meta-tags"
import {
  Container,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
} from "reactstrap"
import "./style.scss"
import { CitySelect, FactoryList } from "components/Common/Select"
import { getProducts } from "actions/timer"
import AutoCompleteSelect from "components/Common/AutoCompleteSelect"
import { array } from "prop-types"
import { arraySplice } from "redux-form"
import { getUsers } from "actions/auth"

import { connect } from "react-redux"
import { withRouter } from "react-router-dom"

import { avatar2url } from "helpers/functions"

import {
  createJobAction,
  deleteJobAction,
  editJobAction,
  getJobsAction,
} from "actions/job"
import sampleAvatar from "../../../assets/images/person.svg"

import "../../Production/Timer/style.scss"

import { LoadingContext } from "context/loading"
import { useMemo } from "react"
import { useNetStatus } from "context/net"
import {
  getActiveCities,
  canGetAllCities,
  getActiveFactories,
  canGetAllFactories,
} from "helpers/user_role"

const ProductionTracker = props => {
  const { user } = props
  const activeCities = useMemo(() => {
    return getActiveCities(user)
  }, [user])

  const canAllCities = useMemo(() => {
    return canGetAllCities(user)
  }, [user])

  const activeFactories = useMemo(() => {
    return getActiveFactories(user)
  }, [user])

  const canAllFactories = useMemo(() => {
    return canGetAllFactories(user)
  }, [user])
  
  const userCity = user
    ? user.role == "Admin"
      ? "Seguin"
      : user.location
    : "Seguin"

  const userFactory = user
    ? user.role == "Admin"
      ? ""
      : user.factory
    : "Pipe And Box"

  const {isOnline} = useNetStatus()
  const { loading, setLoading } = useContext(LoadingContext)
  const [jobModal, setJobModal] = useState(false)
  const [jobDeleteModal, setJobDeleteModal] = useState(false)
  const [deleteMode, setDeleteMode] = useState(0)
  const toggleModal = () => setJobModal(!jobModal)
  const toggleDeleteModal = () => setJobDeleteModal(!jobDeleteModal)
  const queryRef = useRef()

  const [editID, setEditID] = useState(-1)
  const [removeID, setRemoveID] = useState(-1)
  const [inputType, setInputType] = useState("text")

  const [sortKey, setSortKey] = useState("")
  const [jobs, setJobs] = useState([])
  const [job, setJob] = useState({})
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState("")

  const [filterCity, setFilterCity] = useState(userCity)
  const [filterFactory, setFilterFactory] = useState(userFactory)

  const [orderBy, setOrderby] = useState(1)
  const compare = (a, b) => {
    if (a[sortKey] < b[sortKey]) {
      return -orderBy
    }
    if (a[sortKey] > b[sortKey]) {
      return orderBy
    }
    return 0
  }
  const sortTable = array => {
    let _tmp = [...array]
    _tmp.sort(compare)
    setJobs(_tmp)
  }

  const [machines, setMachines] = useState([])
  const [parts, setParts] = useState([])
  const [timerPart, setTimerPart] = useState("")
  const [count, setCount] = useState(7)

  const [tab, setTab] = useState(1)
  const [users, setUsers] = useState([])

  const subStractDate = (date1, date2) => {
    const diffTime = date1 - date2
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  useEffect(()=>{
    ;(async () => {
      const _parts = await getProducts("Part", -1, {city: filterCity}, isOnline)
      const _machines = await getProducts("Machine", -1, {city: filterCity}, isOnline)
      const _users = await getUsers()

      setMachines(_machines.products)
      setParts(_parts.products)
      setUsers(_users)
      if (
        user.location &&
        (user.role == "Accounting" || user.role == "Personnel")
      )
        setFilterCity(user.location)
    })()
  }, [])

  const [activeJobCount, setActiveJobCount] = useState(0)
  const [finishedJobCount, setFinishedJobCount] = useState(0)
  const [testJobCount, setTestJobCount] = useState(0)
  const [deleteJobCount, setDeleteJobCount] = useState(0)
  const [resultCount, setResultCount] = useState(0)
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const getJobData = await getJobsAction(
        page,
        query,
        tab,
        filterCity,
        filterFactory,
        count,
        orderBy
      )
      const _jobs = getJobData.jobs
      setActiveJobCount(getJobData.totalActiveCount)
      setFinishedJobCount(getJobData.totalFinishedCount)
      setTestJobCount(getJobData.totalTestCount)
      setDeleteJobCount(getJobData.totalDeleteCount)
      setResultCount(getJobData.resultCount)
      setJobs(_jobs)
      setLoading(false)
    })()
  }, [page, query, tab, orderBy, count, filterCity, filterFactory])

  const [jobParams, setJobParams] = useState({
    factory: "Pipe And Box",
    city: "Seguin",
  })

  useEffect(() => {
    ;(async () => {
      const _parts = await getProducts("Part", -1, {city: jobParams.city}, isOnline)
      updateTempJobField("", "part")
      updateTempJobField("", "machine")
      setParts(_parts.products)
    })()
  }, [jobParams.city])

  useEffect (()=>{
    updateTempJobField("", "part")
  }, [jobParams.factory])

  const updateTempJobField = (e, field) => {
    // if (e.target && e.target.value == '' && _v[field]!='' && _v[field]!=null ) return false;
    const _v = { ...job, [field]: e.target ? e.target.value : e }
    setJob(_v)
  }
  const manageJob = async () => {
    const form = document.getElementById("job-form")
    const data = new FormData(form)
    if (editID === -1) {
      const newJob = await createJobAction(data)
      setJobModal(false)
      setJobs([newJob, ...jobs])
    } else {
      const editedJob = await editJobAction(data, jobs[editID]._id, jobs[editID].city)
      setJobModal(false)
      let _jobs = [...jobs]

      _jobs[editID] = editedJob
      setJobs(_jobs)
    }
  }
  const archieveJob = async () => {
    // if(!confirm ("Do you want to archive this job ?")) return false;
    const data = new FormData()
    data.append("active", 0)
    data.append("test", 0)
    setLoading(true)
    try {
      const editedJob = await editJobAction(data, jobs[editID]._id, jobs[editID].city)
      setJobModal(false)
      setTab(0)
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }
  const testJob = async () => {
    // if(!confirm ("Do you want to test this job ?")) return false;
    const data = new FormData()
    data.append("active", 0)
    data.append("test", 1)
    setLoading(true)
    try {
      const editedJob = await editJobAction(data, jobs[editID]._id, jobs[editID].city)
      setJobModal(false)
      setTab(2)
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }
  const factoryStyle = {
    stee: "bg-light text-dark",
    Stee: "bg-light text-dark",
    prec: "bg-warning",
    Prec: "bg-warning",
    pipe: "bg-info",
    Pipe: "bg-info",
    box: "bg-primary",
    Box: "bg-primary",
    cage: "bg-dark",
    Cage: "bg-dark",
  }
  useEffect (()=>{
    console.log ('Parts changed')
  }, [parts])
  const filteredJobModalParts = useMemo(() => {
    console.log ('changed parts options')
    return parts.filter(part => part.factory == jobParams.factory)
  }, [jobParams.factory, parts])
  // useEffect(async () => {
  //   setLoading(true)
  //   const _parts = await getProducts("Part", -1, {
  //     city: jobParams.city,
  //     search: { searchString: jobParams.part },
  //   })
  //   setParts(_parts.products)
  //   setLoading(false)
  // }, [jobParams, parts])
  const filteredJobModalMachine = useMemo(() => {
    return machines.filter(machine => machine.factory == jobParams.factory)
  }, [jobParams.factory, machines])

  const deleteJob = async () => {
    try {
      const res = await deleteJobAction(jobs[removeID]._id, deleteMode)
      if (deleteMode == 0)
        // in case of soft delete
        setTab(3)
      else if (deleteMode == 2) {
        // in case of terminate
        let _jobs = [...jobs]
        _jobs = _jobs.filter((job, index) => index !== removeID)
        setDeleteJobCount(prev => prev - 1)
        setJobs(_jobs)
      } else if (deleteMode == 1) {
        // in case of restore
        if (res.job.test) setTab(2)
        else setTab(res.job.active ? 1 : 0)
      }
      setJobDeleteModal(false)
    } catch (error) {
      console.log(error)
    }
  }

  const onKey = event => {
    if (event.keyCode === 13) setQuery(queryRef.current.value)
  }
  // authUser loading

  useEffect(() => {
    if (props.history?.location?.search && props.history.location.search == '?stockmodal=true') {
      setEditID(-1)
      setInputType("text")
      setJob({})
      toggleModal()
    }
  },[props.history.location])

  return (
    <div className="page-content production-tracker">
      <MetaTags>
        <title>Timer Page</title>
      </MetaTags>
      <Container fluid>
        <div className="jobslist-page-container mt-5 w-100">
          <div className="p-0 m-0 w-100">
            <div className="d-flex justify-content-between page-content-header production-tracker-page-header">
              <div>
                <h2>Production Tracker</h2>
                <div className="sub-menu">
                  <span className="parent">ORDER FLOW</span>
                  <span className="mx-1"> &gt; </span>
                  <span className="sub text-danger">TEXAS</span>
                </div>
              </div>
            </div>
            <div className="divide-line d-flex align-items-center pt-5 pb-3">
              <div className="pe-4 fs-5">JOBS</div>
              <div className="line"></div>
            </div>
            {user.role != "Personnel" && user.role != "Accounting" && (
              <>

                <div className="d-flex align-items-end justify-space-between mb-3 mt-1">
                  
                  <div className="d-flex city-selector-container flex-1 row p-0 m-0 mt-3 mr-5">
                  {cities.map((_city, index) => (
                    <div
                      key={"city" + index}
                      className="city text-uppercase col-lg-4 col-md-6 "
                    >
                      <div
                        className={`city-selector ${
                          _city == filterCity ? "active" : ""
                        }`}
                        onClick={() => setFilterCity(_city)}
                      >
                        <span>{_city}</span>
                        <span>
                          <i className="mdi mdi-poll"></i>
                        </span>
                      </div>
                    </div>
                  ))}
                  </div>

                  <button
                    className="btn btn-newjob ms-2 me-2 btn-danger"
                    onClick={() => {
                      setEditID(-1)
                      setInputType("text")
                      setJob({})
                      toggleModal()
                    }}
                  >
                    NEW JOB
                  </button>
                </div>
              </>
            )}
            <div>
              {/* {user.role == 'Personnel' ?
              <h4 className='mt-5'>Not authorized to see content</h4> : */}

              <div>
                <div className="bg-white jobs-table-container w-100">
                  <div className="d-flex jobs-table-header">
                    <div className="d-flex tab-container">
                      <div
                        className={`jobs-tab ongoing-job-tab cursor-pointer ${
                          tab === 1 ? "active" : ""
                        }`}
                        onClick={() => {
                          setTab(1)
                          setPage(1)
                        }}
                      >
                        <h3 className="number">{activeJobCount}</h3>
                        <div>
                          <h4 className="mb-0">Active</h4>
                          {/* <div className="text-secondary">Ongoing</div> */}
                        </div>
                      </div>
                      <div
                        className={`jobs-tab past-job-tab cursor-pointer ${
                          tab === 2 ? "active" : ""
                        }`}
                        onClick={() => {
                          setTab(2)
                          setPage(1)
                        }}
                      >
                        <h3 className="number">{testJobCount}</h3>
                        <div>
                          <h4 className="mb-0">Testing</h4>
                          {/* <div className="text-secondary">Testing jobs</div> */}
                        </div>
                      </div>
                      <div
                        className={`jobs-tab past-job-tab cursor-pointer ${
                          tab === 0 ? "active" : ""
                        }`}
                        onClick={() => {
                          setTab(0)
                          setPage(1)
                        }}
                      >
                        <h3 className="number">{finishedJobCount}</h3>
                        <div>
                          <h4 className="mb-0">Archieved</h4>
                          {/* <div className="text-secondary">Past jobs</div> */}
                        </div>
                      </div>
                      {user.role == "Admin" && (
                        <div
                          className={`jobs-tab past-job-tab cursor-pointer ${
                            tab === 3 ? "active" : ""
                          }`}
                          onClick={() => {
                            setTab(3)
                            setPage(1)
                          }}
                        >
                          <h3 className="number">{deleteJobCount}</h3>
                          <div>
                            <h4 className="mb-0">Deleted</h4>
                            {/* <div className="text-secondary"> Deleted jobs</div> */}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="d-flex flex-fill">
                      <div className="d-flex align-items-center ms-2 me-auto ">
                        <div className="position-relative">
                          <input
                            className="form-control bg-light ps-5"
                            placeholder="Search..."
                            ref={queryRef}
                            onKeyUp={onKey}
                          />
                          <i className="bi bi-search position-absolute"></i>
                        </div>
                      </div>
                      {/* {user.role == "Accounting" || user.role == "Personnel" ? (
                        <></>
                      ) : (
                        <div className="d-flex align-items-center ms-2 me-auto">
                          <CitySelect
                            value={filterCity}
                            placeholder="Select City"
                            onChange={e => {
                              setFilterCity(e.target.value)
                            }}
                          />
                        </div>
                      )} */}
                      <div className="d-flex flex-1 align-items-center ms-2 me-2">
                        <FactoryList
                          value={filterFactory}
                          allowall={canAllFactories?"true":null}
                          activeFactories = {activeFactories}
                          placeholder="Select Factory"
                          onChange={e => {
                            setFilterFactory(e.target.value)
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="jobs-table w-100 overflow-auto" style={{paddingBottom:'80px'}}>
                    <table
                      className="w-100 table table-nowrap mb-0"
                      id="jobstable"
                    >
                      <thead className="">
                        <tr>
                          <th style={{width: "20px"}}></th>
                          <th
                            style={{ paddingLeft: "56px", width: "40px" }}
                            onClick={() => {
                              setOrderby(-orderBy)
                              setSortKey("name")
                            }}
                          >
                            Factory
                          </th>
                          <th style={{ width: "80px" }}>Name</th>
                          <th style={{ width: "280px"}}>PART/MACHINE</th>
                          <th style={{ width: "50px" }}>DRAW</th>
                          <th style={{ width: "48px" }}>COUNT</th>
                          <th style={{ width: "48px" }}>STATUS</th>
                          <th style={{ width: "48px" }}>DUE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((job, index) => (
                          <tr key={"job" + index}>
                            <td style={{ paddingLeft: "20px" }}>{count * Math.max(page - 1, 0)+ index + 1}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                {job.user ? (
                                  <img
                                    className="job-user bg-light"
                                    src={avatar2url(job.user?.avatar) || sampleAvatar}
                                  ></img>
                                ) : (
                                  <div className="job-user"> UA</div>
                                )}
                                <div
                                  className={`job-factory ${
                                    job.factory
                                      ? factoryStyle[
                                          job.factory.substring(0, 4)
                                        ]
                                      : ""
                                  }`}
                                  style={{ textAlign: "center" }}
                                >
                                  {job.factory ? job.factory.substring(0, 4).toUpperCase() : ""}
                                </div>
                                {/* <div className='ms-2'>
                                  <div style={{ lineHeight: '14px' }}><b className='job-name name text-capitalize'>{job.name.toLowerCase()}</b></div>
                                  <div className="text-secondary pt-1" >{job.city}</div>
                                </div> */}
                              </div>
                            </td>
                            <td style={{ width: "140px" }}>
                              <b className="job-name name text-capitalize">
                                {job.name.toLowerCase()}
                              </b>
                            </td>
                            <td className="">
                              <div style={{ width: "200px" }}>
                                <div>
                                  <b className="name">
                                    {job.part?.name}
                                  </b>
                                </div>
                                <div className="text-secondary">
                                  {job.machine?.name}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="name" style={{ width: "80px" }}>
                                {job.drawingNumber}
                              </div>
                            </td>
                            <td className="name">
                              <div>
                                {job.producedCount} / {job.count}
                              </div>
                            </td>
                            <td>
                              <span className="job-status name">
                                {job.active === true ? "Active" : "Finished"}
                              </span>
                              <span
                                className={`${
                                  job.active === true ? "bg-primary" : "bg-info"
                                } rounded indicator-line`}
                              >
                                {" "}
                              </span>
                            </td>
                            <td>
                              {job.dueDate && <>
                              <b className="">
                                {job.dueDate.replace(/T.*$/, "")}
                              </b>
                              <div className="text-secondary ">
                                {subStractDate(
                                  new Date(job.dueDate),
                                  new Date()
                                ) < 0 ? (
                                  <span className="text-danger">Overdue</span>
                                ) : (
                                  subStractDate(
                                    new Date(job.dueDate),
                                    new Date()
                                  ) + " Days"
                                )}
                              </div>
                              </>
                              }
                            </td>
                            {user.role != "Personnel" && (
                              <td>
                                <b className="position-relative">
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
                                    <div
                                      className="dropdown-item p-4 py-2 cursor-pointer"
                                      onClick={() => {
                                        setJob(job)
                                        setEditID(index)
                                        setInputType("date")
                                        toggleModal()
                                      }}
                                    >
                                      Edit
                                    </div>
                                    {user.role == "Admin" && job.deleted && (
                                      <div
                                        className="dropdown-item p-4 py-2 cursor-pointer"
                                        onClick={() => {
                                          setRemoveID(index)
                                          setDeleteMode(1) // 1: Restore
                                          toggleDeleteModal(false)
                                        }}
                                      >
                                        Restore
                                      </div>
                                    )}
                                    {user.role == "Admin" && (
                                      <div
                                        className="dropdown-item p-4 py-2 cursor-pointer"
                                        onClick={() => {
                                          setRemoveID(index)
                                          setDeleteMode(job.deleted ? 2 : 0) // 0: Soft Delete, 2: Terminate
                                          toggleDeleteModal(true)
                                        }}
                                      >
                                        {job.deleted ? "Terminate" : "Delete"}
                                      </div>
                                    )}
                                  </div>
                                </b>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div
                    className="border-0 pagination py-3 align-items-center justify-content-between"
                    style={{ borderRadius: "10px" }}
                  >
                    <div className="d-flex">
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
                          <span> of {Math.round(resultCount / count)}</span>
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
                          onClick={() => setPage(page + 1)}
                        >
                          <span>NEXT</span>
                          <span className="mdi mdi-chevron-right"></span>
                        </div>
                      </div>
                    </div>

                    <div className="countshow d-flex align-items-center mx-4">
                      <span className="me-2">Show</span>
                      <input
                        className="px-2 py-1 bg-light form-control"
                        value={count}
                        style={{ width: 32 }}
                        onChange={e => setCount(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* } */}
            </div>
          </div>
        </div>
      </Container>
      {user.role != "Personnel" && user.role != "Accounting" && (
        <>
          <Modal isOpen={jobModal} toggle={toggleModal}>
            <ModalHeader toggle={toggleModal}>
              {editID === -1 ? "Create A New Job" : "Edit Job"}
            </ModalHeader>
            <ModalBody>
              <form id="job-form">
                <div className="mt-3 row">
                  <Label className="col-3 mt-1" style={{ textAlign: "right" }}>
                    Name:
                  </Label>
                  <div className="col-9">
                    <input
                      className="form-control"
                      type="text"
                      value={job.name || ""}
                      placeholder="Job Name"
                      name="name"
                      onChange={e => updateTempJobField(e, "name")}
                    />
                  </div>
                </div>

                <div className="mt-3 row">
                  <Label className="col-3 mt-1" style={{ textAlign: "right" }}>
                    City:
                  </Label>
                  <div className="col-9">
                    <CitySelect
                      value={job.city || ""}
                      placeholder="Select City"
                      allowall="false"
                      onChange={e => {
                        setJobParams({ ...jobParams, city: e.target.value })
                        updateTempJobField(e, "city")
                      }}
                    />
                  </div>
                </div>
                <div className="mt-3 row">
                  <Label className="col-3 mt-1" style={{ textAlign: "right" }}>
                    User:
                  </Label>
                  <div className="col-9">
                    <select
                      className="form-control"
                      name="user"
                      value={!job.user ? "" : !job.user._id ? job.user : job.user._id}
                      onChange={e => updateTempJobField(e, "user")}
                    >
                      {!users
                        ? ""
                        : users.map(user => (
                            <option value={user._id} key={user._id}>
                              {user.firstName + " " + user.lastName}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3 row">
                  <Label className="col-3 mt-1" style={{ textAlign: "right" }}>
                    Factory:
                  </Label>
                  <div className="col-9">
                    <FactoryList
                      placeholder="Select Factory"
                      value={job.factory || ""}
                      onChange={e => {
                        setJobParams({ ...jobParams, factory: e.target.value })
                        updateTempJobField(e, "factory")
                      }}
                    />
                  </div>
                </div>

                <div className="mt-3 row">
                  <Label className="col-3 mt-1" style={{ textAlign: "right" }}>
                    Machine:
                  </Label>
                  <div className="col-9">
                    <select
                      className="form-select"
                      name="machine"
                      value={job.machine ? job.machine._id : ""}
                      onChange={e => updateTempJobField(e, "machine")}
                    >
                      <option value="" disabled>
                        Select Machine
                      </option>
                      {filteredJobModalMachine.map(m => (
                        <option value={m._id} key={"machine-" + m._id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-3 row">
                  <Label className="col-3 mt-1" style={{ textAlign: "right" }}>
                    Part:
                  </Label>
                  <div className="col-9">
                    <div className="w-100">
                      <AutoCompleteSelect
                        name="part"
                        option={job.part?.name || ""}
                        value = {job.part?._id || ""}
                        placeholder="Select Parts"
                        options={filteredJobModalParts}
                        onChange={e => {
                          updateTempJobField(e, "part")
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 row">
                  <Label className="col-3" style={{ textAlign: "right" }}>
                    Drawing Number:
                  </Label>
                  <div className="col-9">
                    <input
                      className="form-control"
                      value={job.drawingNumber || ""}
                      placeholder="Drawing Number"
                      name="drawingNumber"
                      onChange={e => updateTempJobField(e, "drawingNumber")}
                    />
                  </div>
                </div>
                <div className="mt-3 row">
                  <Label className="col-3 mt-1" style={{ textAlign: "right" }}>
                    Count:
                  </Label>
                  <div className="col-9">
                    <input
                      className="form-control"
                      type={editID === -1 ? "hidden" : "number"}
                      value={job.producedCount || 0}
                      placeholder="Produced Count"
                      name="producedCount"
                      onChange={e => updateTempJobField(e, "producedCount")}
                    />
                    <div className={`px-3 ${editID === -1 ? "d-none" : ""}`}>
                      /
                    </div>
                    <input
                      className="form-control"
                      type="number"
                      value={job.count || ""}
                      placeholder="Total Count"
                      name="count"
                      onChange={e => updateTempJobField(e, "count")}
                    />
                  </div>
                </div>
                <div className="mt-3 row">
                  <Label className="col-3 mt-1" style={{ textAlign: "right" }}>
                    Due:
                  </Label>
                  <div className="col-9">
                    <input
                      placeholder="Due Date"
                      className="form-control"
                      name="dueDate"
                      type={inputType}
                      value={job.dueDate ? job.dueDate.replace(/T.*$/, "") : ""}
                      onFocus={e => (e.target.type = "date")}
                      id="date"
                      onChange={e => {
                        updateTempJobField(e, "dueDate")
                      }}
                    />
                  </div>
                </div>
                
                
              </form>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={manageJob}>
                {editID == -1 ? "Create" : "Update"}
              </Button>{" "}
              {editID != -1 &&
                (job.test ? (
                  <Button color="success" onClick={archieveJob}>
                    Archieve
                  </Button>
                ) : job.active ? (
                  <Button color="warning" onClick={testJob}>
                    Test
                  </Button>
                ) : (
                  ""
                ))}{" "}
              <Button color="secondary" onClick={toggleModal}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>

          {typeof jobs[removeID] != "undefined" && (
            <Modal isOpen={jobDeleteModal} toggle={toggleDeleteModal}>
              <ModalHeader toggle={toggleDeleteModal}>
                Delete {jobs[removeID].name}
              </ModalHeader>
              <ModalBody>
                {deleteMode == 0
                  ? "Are you going to delete this job ?"
                  : deleteMode == 1
                  ? "Are you going to restore this job ?"
                  : "Are you going to permanently remove this job ?"}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onClick={deleteJob}>
                  Confirm
                </Button>{" "}
                <Button color="secondary" onClick={toggleDeleteModal}>
                  Cancel
                </Button>
              </ModalFooter>
            </Modal>
          )}
        </>
      )}
    </div>
  )
}

const mapStatetoProps = state => {
  const user = state.Login.user
  return { user }
}

export default withRouter(connect(mapStatetoProps, {})(ProductionTracker))
