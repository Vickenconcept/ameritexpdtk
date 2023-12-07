import { useContext, useEffect } from "react"
import { cities, factories, classify, factory2mc, mc2factory, checkMcRule, machineClasses } from "../../../helpers/globals"
import { useState } from "react"
import MetaTags from "react-meta-tags"
import {
  Container,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
  Form,
} from "reactstrap"
import Dropzone from "react-dropzone"
import Timer from "../components/Timer"
import "./style.scss"
import {
  createTimerAction,
  getProducts,
  updateTimerAction,
  createPartAction,
} from "../../../actions/timer"
import { useMemo, useCallback } from "react"
import SweetAlert from "react-bootstrap-sweetalert"

import AutoCompleteSelect from "../../../components/Common/AutoCompleteSelect"
import { getCurrentTime } from "../../../helpers/functions"
import {
  CitySelect,
  CityVisualSelect,
  FactoryList,
} from "../../../components/Common/Select"
import { connect } from "react-redux"
import { withRouter } from "react-router-dom"
import TimerLogs from "./component/TimerLogs"
import Pagination from "../../../components/Common/Pagination"
import ProductionClock from "./component/ProductionClock"

import { LoadingContext } from "../../../context/loading"
import PartEditModal from "../components/PartEditModal"

import { useLocalDB } from "../../../context/localDB"
import { useNetStatus } from "../../../context/net"

import ControllerModal from "../components/ControllerModal"
import { useTimerUser } from "../../../context/timer"

import { getActiveCities, canGetAllCities, getActiveFactories, canGetAllFactories } from "../../../helpers/user_role"

import "../../../components/modal.scss"
import {offset} from '../../../helpers/globals.js'
import FactoryFilter from "../components/FactoryFilter"
import TimerEditModal from "./component/TimerEditModal"
import TimerList from "./component/TimerList"

import { TimerProvider } from "./context"
import TimerViewModal from "./component/TimerViewModal"

const TimerPage = props => {
  const { user } = props

  const activeCities = useMemo(()=>{
    return getActiveCities (user)
  }, [user])

  const canAllCities = useMemo(()=>{
    return canGetAllCities (user)
  }, [user])

  const activeFactories = useMemo(() => {
    return getActiveFactories (user)
  }, [user])

  const canAllFactories = useMemo(() => {
    return canGetAllFactories (user)
  }, [user])

  const [canOperate, setCanOperate] = useState(true);

  const { isDBReady } = useLocalDB()
  const { isOnline } = useNetStatus()
  const {
    TIMER_USER,
  } = useTimerUser()

  useEffect(() => {
    console.log("TIMER_USER", TIMER_USER)
  }, [TIMER_USER])

  var elem = document.documentElement
  /* View in fullscreen */
  const openFullscreen = () => {
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if (elem.webkitRequestFullscreen) {
      /* Safari */
      elem.webkitRequestFullscreen()
    } else if (elem.msRequestFullscreen) {
      /* IE11 */
      elem.msRequestFullscreen()
    }
  }

  /* Close fullscreen */
  function closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      /* Safari */
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      /* IE11 */
      document.msExitFullscreen()
    }
  }
  const [viewTimerController, setViewTimerController] = useState(false)
  const [partsModal, setPartsModal] = useState(false)
  const { loading, setLoading } = useContext(LoadingContext)

  const userCity = (user?(user.role=='Admin'?"Seguin":user.location):"Seguin")

  const [city, setCity] = useState(userCity)
  const [lastUpdated, setLastUpdated] = useState(getCurrentTime(offset[city]))

  const togglePartsModal = () => {
    setPartsModal(!partsModal)
  }
  const toggleControllerModal = () => {
    setViewTimerController(!viewTimerController)
  }

  const [edit, setEdit] = useState(false)

  const [alert, setAlert] = useState({
    success: true,
    error: false,
    msg: "",
  })
  const [showAlert, setShowAlert] = useState(false)
  const createPart = async () => {
    const form = new FormData(document.getElementById("part-form"))
    if (edit) form.append("id", newPart._id)
    try {
      const res = await createPartAction(form)
      setAlert({
        success: res.success,
        error: res.error,
        msg: edit ? "Edit Part : " + newPart.name : "Create new Part",
      })
    } catch (error) {
      console.log(error)
      setAlert({
        error: true,
        msg: edit ? "Edit Part : " + newPart.name : "Create new Part",
      })
    }
    togglePartsModal()
    setShowAlert(true)
  }

  const [newPart, setNewPart] = useState({
    city: city,
    factory: "",
    machineClass: "",
    name: "",
    pounds: "",
    avgTime: "",
    finishGoodWeight: "",
    cageWeightScrap: "",
    cageWeightActuals: "",
    preview: "",
  })

  const updateNewPart = async (f, e) => {
    const _part = {
      ...newPart,
      [f]: e == null ? null : e.target ? e.target.value : e,
    }
    setNewPart(_part)
  }
  // -----------------------------------
  const [timerModal, setTimerModal] = useState(false)
  const [productionTime, setProductionTime] = useState(0)

  const toggleModal = () => {
    setTimerModal(!timerModal)
  }

  const [timers, setTimers] = useState([])
  const [timerPagination, setTimerPagination] = useState({
    page: 1,
    totalPage: 0,
  })

  const createTimer = async (item) => {
    // const timerForm = document.getElementById("timer-form")
    // let formData = new FormData(timerForm)
    let formData = new FormData()
    formData.append("city", city)
    formData.append("created_by", user._id)
    formData.append("machine", item.machine)
    formData.append("part", item.part)
    formData.append("factory", item.factory)
    formData.append("weight", item.weight)
    formData.append("productionTime", item.productionTime)
    toggleModal()
    let res
    try {
      res = await createTimerAction(formData)
      setAlert({
        success: res.success,
        error: res.error,
        msg: "Create Timer Success",
      })
    } catch {
      setAlert({
        error: true,
        msg: "Create Timer failed by some reason",
      })
    }
    res.data.timer.machine = [res.data.timer.machine]
    res.data.timer.part = [res.data.timer.part]
    setTimers([res.data.timer, ...timers])
    setShowAlert(true)
    updateTimers()
  }

  const [factoryFilter, setFactoryFilter] = useState([false, false, false, false, false, true])

  const factoryFilters = useMemo(()=>{
    if (!canAllFactories) return activeFactories
    return [...activeFactories, "Not Assigned", "All"]
  },[activeFactories, canAllFactories])

  const selectedFactories = useMemo(() => {
    let _factories = factoryFilters.filter(
      (f, idx) => factoryFilter[idx] == true
    )
    if (_factories.includes("All")) {
      _factories = factoryFilters.filter(f => f != "All")
    }
    return _factories
  },[factoryFilter, factoryFilters])

  const toggleFilter = (e, filter) => {
    let _filter = [...factoryFilter]
    const index = factoryFilters.findIndex(f => f == filter)
    _filter[index] = !_filter[index]

    if (filter.toLowerCase() == "all" && factoryFilter[index] == false) {
      _filter = [false, false, false, false, false, true]
    }

    if (filter.toLowerCase() != "all" && factoryFilter[index] == false)
      _filter[5] = false
    setFactoryFilter(_filter)
  }

  useEffect(()=>{
    setFactoryFilter(activeFactories?.length===1?[true]:[...factoryFilters.map(f=>(f=="All"&&canAllFactories))])
  },[factoryFilters])

  const [editModal, setEditModal] = useState(false)
  const [editingTimer, setEditingTimer] = useState({
    weight: 0,
    productionTime: 0,
    operator: "",
    _id: "",
    created_by: "",
  })
  const [editingTimerIndex, setEditingTimerIndex] = useState(0)
  const toggleEditModal = () => {
    setEditModal(!editModal)
  }
  const editTimer = _id => {
    const idx = timers.findIndex(x => x._id === _id)
    const timer = timers[idx]
    const thisPart = timer.part[0]

    setNewPart({
      _id: thisPart._id,
      city: thisPart.city,
      factory: thisPart.factory,
      machineClass: thisPart.machineClass,
      name: thisPart.name,
      pounds: thisPart.pounds,
      avgTime: thisPart.avgTime,
      preview: thisPart.preview,
      finishGoodWeight: thisPart.finishGoodWeight,
      cageWeightActuals: thisPart.cageWeightActuals,
      cageWeightScrap: thisPart.cageWeightScrap,
    })

    setEditingTimer({
      weight: timer.weight,
      productionTime: timer.productionTime,
      operator: timer.operator,
      _id: timer._id,
      part: timer.part,
      machine: timer.machine,
      created_by: timer.created_by,
    })

    setEditingTimerIndex(idx)
    setEditModal(true)
  }
  const saveTimer = async () => {
    let _timers = [...timers]
    _timers[editingTimerIndex].operator = editingTimer.operator
    try {
      const res = await updateTimerAction(editingTimer._id, editingTimer.city, {
        operator: editingTimer.operator,
      })
      setAlert({
        success: res.success,
        error: res.error,
        msg: "Edit Part : " + newPart.name,
      })
    } catch (err) {
      setAlert({
        error: true,
        msg: "Edit Part : " + newPart.name,
      })
    }
    setEditModal(false)
    setShowAlert(true)
  }

  const updateTimers = async () => {
    setLoading(true)

    const _factories = factoryFilters.filter(
      (f, idx) => factoryFilter[idx] || canAllFactories
    )
    if (factoryFilter[1]) _factories.push("Pipe And Box")

    try {
      let res = { products: [] }
      res = await getProducts(
        "Timer",
        -1,
        {
          factories: selectedFactories,
          city,
        },
        isOnline
      )
      console.log("---------------------------------timer products------------------------------")
      console.log(res.products)
      setTimers(res.products)
      setLastUpdated (getCurrentTime(offset[city]))
      setTimerPagination({
        ...timerPagination,
        totalPage: Math.ceil(res.totalCount / 9),
      })
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(async () => {
    updateTimers()
    console.log("---------------------update timers------------------------")
  }, [
    timerPagination.page, 
    selectedFactories, 
    city, 
    // timerModal
  ])

  const [newTimer, setNewTimer] = useState({
    factory: "",
    machineClasse: "",
    part: "",
    machine: "",
  })
  const updateNewTimer = (f, e) => {
    setNewTimer({
      ...newTimer,
      [f]: e.target ? e.target.value : e,
      part: "",
    })
  }

  return (
    <div className="page-content">
      <MetaTags>
        <title>Timer Page</title>
      </MetaTags>
      <Container fluid>
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
        <div className="timer-page-container mt-5 mx-auto">
          <div className="p-0 m-0">
            {/* <div className="col-xl-9 p-0"> */}
            <div className="d-flex justify-content-between timer-page-header page-content-header pb-4">
              <div>
                <h2>Timer and Analytics</h2>
                <div className="sub-menu text-uppercase">
                  <span className="parent">Production</span>
                  <span className="mx-1"> &gt; </span>
                  <span className="sub text-danger">TEXAS</span>
                </div>
              </div>
              {user.role == "Sales" || user.role == "HR" ? (
                ""
              ) : (
                <div className="d-flex align-items-center">
                  <div className="d-flex flex-column align-items-center border-left-right px-4">
                    <h3 className="mb-0">{timers?.length}</h3>
                    <div className="text-black-50">Timers </div>
                  </div>
                  {user.role == "Personnel" ||
                  user.role == "Accounting" ||
                  !isOnline ? (
                    ""
                  ) : (
                    <button
                      className="btn btn-newtimer ms-3"
                      onClick={() => setTimerModal(true)}
                    >
                      NEW TIMER
                    </button>
                  )}
                </div>
              )}
            </div>
            {user.role == "Sales" ||
            user.role == "HR" ||
            user.role == "Corporate" ? (
              <h4 className="mt-5">Not authorized to see content</h4>
            ) : (
              <div>
                <div
                  className="mt-3 pb-3"
                  style={{
                    borderBottom: "2px solid #dddee2",
                  }}
                >
                  <div className="d-flex city-selector-container row p-0 m-0">
                    <CityVisualSelect 
                      activeCities={activeCities} 
                      value={city} 
                      onChange = {(val)=>{
                        setCity(val)
                      }}
                    />
                  </div>
                </div>

                <FactoryFilter
                  factoryFilter={factoryFilter}
                  factoryFilters={factoryFilters}
                  toggleFilter={toggleFilter}
                />

                <ProductionClock city={city} setCanOperate={setCanOperate} setProdTime={setProductionTime} lastUpdated={lastUpdated} />
                
                <TimerProvider city={city} selectedFactories={selectedFactories} timers={timers} setTimers={setTimers}>
                  <TimerList
                    editTimer={editTimer}
                    updateTimerAction={updateTimerAction}
                    canOperate={canOperate}

                    city={city}
                    productionTime={productionTime}
                  />

                  <TimerEditModal 
                    open = {timerModal}
                    edit = {edit}
                    createTimer = {createTimer}
                    toggleModal = {toggleModal}
                    city = {city}
                    // part = {null}
                    activeFactories = {activeFactories}
                    canAllFactories = {canAllFactories}
                    // newTimer = {newTimer}
                    updateNewTimer = {updateNewTimer}
                  />

                </TimerProvider>

              </div>
            )}
          </div>
        </div>
      </Container>
      
      <TimerViewModal
        {...{
          editModal, toggleEditModal,
          editingTimer, setEditingTimer,
          setPartsModal,
          saveTimer,
        }}
      />

      <PartEditModal
        item={newPart}
        show={partsModal}
        toggleModal={togglePartsModal}
        updateItem={updateNewPart}
        createItem={createPart}
        edit={true}
      />
    </div>
  )
}

const mapStatetoProps = state => {
  const user = state.Login.user
  return { user }
}

export default withRouter(connect(mapStatetoProps, {})(TimerPage))
