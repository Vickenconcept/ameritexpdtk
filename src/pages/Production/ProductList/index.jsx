import {
  CitySelect,
  CityVisualSelect,
  FactoryList,
  MachineClassSelect,
} from "../../../components/Common/Select"
// import { cities, factories } from "helpers/globals"
import { useContext, Fragment, useState, useMemo } from "react"
import MetaTags from "react-meta-tags"
import { Container } from "reactstrap"
import Machine from "../components/Machine"
import Part from "../components/Part"
import "./style.scss"
import {
  createMachineAction,
  createPartAction,
  editProductAction,
  getProducts,
} from "../../../actions/timer"
import { useEffect } from "react"
import SweetAlert from "react-bootstrap-sweetalert"

import Pagination from "../../../components/Common/Pagination"

import { LoadingContext } from "../../../context/loading"

import PartModal from "../components/PartModal"
import MachineModal from "../components/MachineModal"

import MachineEditModal from "../components/MachineEditModal"
import PartEditModal from "../components/PartEditModal"

import { connect } from "react-redux"
import { withRouter } from "react-router-dom"

import { useNetStatus } from "../../../context/net"
import { useLocalDB } from "../../../context/localDB"
import {
  getActiveCities,
  canGetAllCities,
  getActiveFactories,
  canGetAllFactories,
} from "../../../helpers/user_role"
import FactoryFilter from "../components/FactoryFilter"

const ProductList = props => {
  const user = props.user

  const { isDBReady } = useLocalDB()
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

  const { isOnline } = useNetStatus()

  const { loading, setLoading } = useContext(LoadingContext)

  const userCity = user
    ? user.role == "Admin"
      ? "Seguin"
      : user.location
    : "Seguin"
  const [city, setCity] = useState(userCity)
  const [machineModal, setMachineModal] = useState(false)
  const [editIndex, setEditIndex] = useState(-1)
  const [type, setType] = useState("Part")
  const types = ["Part", "Machine"]
  const [totalCount, setTotalCount] = useState(0)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPage: 1,
  })
  const [search, setSearch] = useState({
    searchString: "",
  })

  const moveToPage = _page => {
    setPagination({
      ...pagination,
      page: _page,
    })
  }

  const [partsModal, setPartsModal] = useState(false)

  const showCreateModal = () => {
    setEdit(false)
    setNewPart({
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
      media: [],
    })
    setNewMachine({
      city: city,
      factory: "",
      machineClass: "",
      name: "",
      details: "",
      preview: "",
      media: [],
    })
    if (type == "Part") setPartsModal(true)
    else setMachineModal(true)
  }

  const toggleModal = () => {
    setMachineModal(!machineModal)
  }

  const togglePartsModal = () => {
    setPartsModal(!partsModal)
  }

  const hidePartModal = () => {
    setPartsModal(false)
    setShowPartModal(false)
    setEdit(false)
    setShow(false)
  }

  const hideMachineModal = () => {
    setMachineModal(false)
    setShowMachineModal(false)
    setEdit(false)
    setShow(false)
  }

  const [alert, setAlert] = useState({
    success: true,
    error: false,
    msg: "",
  })
  const [showAlert, setShowAlert] = useState(false)

  const createPart = async cb => {
    if (!isOnline) return false
    const form = new FormData(document.getElementById("part-form"))
    if (edit) form.append("id", parts[editIndex]._id)
    try {
      const res = await createPartAction(form, cb)
      setAlert({
        success: res.success,
        error: res.error,
        msg: edit ? "Edit Part : " + newPart.name : "Created new Part",
      })
      hidePartModal()
    } catch (error) {
      setAlert({
        error: true,
        msg: edit ? "Edit Part : " + newPart.name : "Failed to create new Part",
      })
    }
    setShowAlert(true)
    updateProducts()
  }

  const createMachine = async cb => {
    if (!isOnline) return false
    const form = new FormData(document.getElementById("machine-form"))
    if (edit) form.append("id", machines[editIndex]._id)
    try {
      const res = await createMachineAction(form, cb)
      setAlert({
        success: res.success,
        error: res.error,
        msg: edit ? "Edit Machine : " + newMachine.name : "Created new Machine",
      })
      toggleModal()
      hideMachineModal()
    } catch (error) {
      setAlert({
        error: true,
        msg: edit
          ? "Edit Machine : " + newMachine.name
          : "Failed to created new Machine",
      })
    }
    setShowAlert(true)
    updateProducts()
  }

  const deleteProduct = async (type, id) => {
    if (!isOnline) return false
    if (type == "Machine") {
      setMachines(machines.filter(m => m._id != id))
    } else {
      setParts(parts.filter(p => p._id != id))
    }
    setAlert({ success: true, msg: "Removed Successfully" })
    setShowAlert(true)
  }

  const editMachine = async idx => {
    setShow(false)
    setEdit(true)
    setEditIndex(idx)
    let _machine
    Object.entries(newMachine).forEach(v => {
      _machine = { ..._machine, [v[0]]: machines[idx][v[0]] }
    })
    setNewMachine(_machine)
    setMachineModal(true)
  }

  const editPart = async idx => {
    setShow(false)
    setEditIndex(idx)
    setEdit(true)
    let _part
    Object.entries(newPart).forEach(
      v => (_part = { ..._part, [v[0]]: parts[idx][v[0]] })
    )
    setNewPart(_part)
    setPartsModal(true)
  }

  // TO SHOW PART MODAL FOR ITEM

  const [showPartModal, setShowPartModal] = useState(false)

  const showPart = async idx => {
    setEditIndex(idx)
    setEdit(true)
    let _part
    Object.entries(newPart).forEach(
      v => (_part = { ..._part, [v[0]]: parts[idx][v[0]] })
    )
    setNewPart(_part)
    setShow(true)
    setShowPartModal(true)
  }
  const toggleShowPartModal = () => {
    setShow(true)
    setShowPartModal(!showPartModal)
  }

  // TO SHOW MACHINE MODAL FOR ITEM

  const [showMachineModal, setShowMachineModal] = useState(false)

  const showMachine = async idx => {
    setEditIndex(idx)
    setEdit(true)
    let _machine
    Object.entries(newMachine).forEach(v => {
      _machine = { ..._machine, [v[0]]: machines[idx][v[0]] }
    })
    setShow(true)
    setNewMachine(_machine)
    setShowMachineModal(true)
  }
  const toggleShowMachineModal = () => {
    setShowMachineModal(!showMachineModal)
  }

  //

  const [edit, setEdit] = useState(false)
  const [show, setShow] = useState(false)
  const [machines, setMachines] = useState([])
  const [parts, setParts] = useState([])

  const [newPart, setNewPart] = useState({
    city: "",
    factory: "",
    machineClass: "",
    name: "",
    pounds: "",
    avgTime: "",
    finishGoodWeight: "",
    cageWeightScrap: "",
    cageWeightActuals: "",
    preview: "",
    inventory: 0,
    costToManufacture: 0,
    topSellPrice: 0,
    media: [],
  })
  const [newMachine, setNewMachine] = useState({
    city: "",
    factory: "",
    machineClass: "",
    name: "",
    details: "",
    preview: "",
    media: [],
  })
  const updateSearch = (f, e) => {
    const _search = {
      ...search,
      [f]: e.target ? e.target.value : e,
    }
    setSearch(_search)
  }

  const updateNewPart = async (f, e) => {
    if (typeof e == "string") {
      if (e.includes("$")) {
        e = e.replace("$", "")
      }
    }
    if (f == "preview") console.log("Part", e)
    const _part = {
      ...newPart,
      [f]: e == null ? null : e.target ? e.target.value : e,
    }
    await setNewPart(_part)
  }
  const updateNewMachine = async (f, e) => {
    const _machine = {
      ...newMachine,
      [f]: e == null ? null : e.target ? e.target.value : e,
    }
    if (f == "preview") console.log("Machine", e)
    return await setNewMachine(_machine)
  }

  const [factoryFilter, setFactoryFilter] = useState([false, false, false, false, false, true])

  const factoryFilters = useMemo(() => {
    if (!canAllFactories) return activeFactories
    return [...activeFactories, "Not Assigned", "All"]
  }, [activeFactories, canAllFactories])

  useEffect(() => {
    setFactoryFilter(
      activeFactories?.length === 1
        ? [true]
        : [...factoryFilters.map(f => f == "All" && canAllFactories)]
    )
  }, [factoryFilters])

  const selectedFactories = useMemo(() => {
    let _factories = factoryFilters.filter(
      (f, idx) => factoryFilter[idx] == true
    )
    if (_factories.includes("All")) {
      _factories = factoryFilters.filter(f => f != "All")
    }
    return _factories
  },[factoryFilter, factoryFilters])

  const updateProducts = async (smartRead = false) => {
    setLoading(!smartRead)
    const _factories = factoryFilters.filter(
      (f, idx) => factoryFilter[idx] == true
    )

    const res = await getProducts(
      type,
      pagination.page,
      {
        factories: _factories,
        city: city,
        machineClass: search.machineClass,
        search: search,
      },
      isOnline || smartRead
    )

    if (type == "Machine") setMachines(res.products)
    else setParts(res.products)
    setTotalCount(res.totalDocs)
    try {
      if (!smartRead) {
        setPagination({
          ...pagination,
          totalPage: Math.ceil(res.totalDocs / 9),
        })
        setTotalCount(res.totalDocs)
      }
    } catch (error) {}
    setLoading(false)
  }

  useEffect(async () => {
    if (isDBReady && isOnline) await updateProducts(true)
    updateProducts()
  }, [type, pagination.page, city, factoryFilter, search])

  const toggleFilter = (e, filter) => {
    let _filter = [...factoryFilter]
    const index = factoryFilters.findIndex(f => f == filter)
    _filter[index] = !_filter[index]

    if (filter == "All" && factoryFilter[index] == false)
      _filter = [false, false, false, false, false, true]

    if (filter != "All" && factoryFilter[index] == false) _filter[5] = false
    setFactoryFilter(_filter)
  }
  // authUser loading

  return (
    <div
      className="page-content"
      // style={{ padding: "86px calc(0.5rem / 2) 60px calc(11.5rem / 2)" }}
    >
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
          <div className="row p-0 m-0">
            <div className="d-flex justify-content-between timer-page-header page-content-header pb-4">
              <div>
                <h2>Product List</h2>
                <div className="sub-menu text-uppercase">
                  <span className="parent">Production</span>
                  <span className="mx-1"> &gt; </span>
                  <span className="sub text-danger">TEXAS</span>
                </div>
              </div>
              {user.role == "Sales" || user.role == "HR" ? (
                ""
              ) : (
                <div
                  className="d-flex align-items-center"
                  style={{ height: "60px" }}
                >
                  <div
                    className="d-flex border-left-right px-2 align-self-stretch"
                    style={{ height: "45px", marginTop: "8px" }}
                  >
                    <div className="d-flex justify-content-center flex-column align-items-center ms-3">
                      <h3 style={{ marginBottom: "-1px" }}>{totalCount}</h3>
                      <div
                        className="d-flex align-items-center text-uppercase text-black-50"
                        style={{ fontSize: "11px" }}
                      >
                        {type}s
                      </div>
                    </div>
                    <div className="ms-2 me-3 d-flex align-items-end h-100">
                      <span
                        className="mdi mdi-chevron-up"
                        style={{ fontSize: 20, color: "rgb(2, 186, 197)" }}
                      ></span>
                    </div>
                  </div>
                  {user.role == "Personnel" || user.role == "Accounting" ? (
                    ""
                  ) : isOnline ? (
                    <button
                      className="btn btn-newtimer ms-3 text-uppercase"
                      onClick={showCreateModal}
                    >
                      NEW {type}
                    </button>
                  ) : (
                    ""
                  )}
                </div>
              )}
            </div>
            {user.role == "Sales" || user.role == "HR" ? (
              <h4 className="mt-5">Not authorized to see content</h4>
            ) : (
              <Fragment>
                <div
                  className="mt-3 px-0"
                  style={{
                    borderBottom: "2px solid rgba(221, 222, 226, 0.5)",
                    paddingBottom: "1rem",
                  }}
                >
                  <div className="type-selector-container row p-0 m-0">
                    {types.map(_type => (
                      <div
                        key={_type}
                        className="type text-uppercase cursor-pointer col-lg-4 col-md-6"
                        style={{ marginLeft: "0px" }}
                        onClick={() => {
                          if (type != _type) {
                            setType(_type)
                            moveToPage(1)
                          }
                        }}
                      >
                        <div
                          className={`type-selector ${
                            _type == type ? "active" : ""
                          }`}
                        >
                          <span>{_type}</span>
                          <span>
                            <i className="mdi mdi-poll"></i>
                          </span>
                        </div>
                        {/* <div
                      className="mt-1 d-flex justify-content-end"
                      style={{ marginRight: "45px" }}
                    >
                      COMPARE{" "}
                      <input type="checkbox" className="form-checkbox ms-2" />
                    </div> */}
                      </div>
                    ))}
                  </div>

                  <div className="d-flex city-selector-container row p-0 m-0 mt-3">
                    <CityVisualSelect
                      activeCities={activeCities}
                      value={city}
                      onChange={val => {
                        setCity(val)
                      }}
                      small={true}
                    />
                  </div>

                  <FactoryFilter
                    style={{
                      paddingBottom: 0,
                      marginBottom: 0,
                      borderBottom: 0,
                    }}
                    factoryFilter={factoryFilter}
                    factoryFilters={factoryFilters}
                    toggleFilter={toggleFilter}
                  />
                </div>

                <div className="search-container mt-3">
                  <div
                    className="search-box row"
                    style={{ padding: "1rem 1rem 1rem 1.5rem" }}
                  >
                    <div className="col-6">
                      <div>
                        <h5>Machine Class</h5>
                      </div>
                      <div className="mt-2">
                        <MachineClassSelect
                          onChange={e => updateSearch("machineClass", e)}
                          value={search.machineClass || ""}
                          issearch="true"
                          factoryFilter = {selectedFactories}
                        />
                      </div>
                    </div>
                    <div className="col-6">
                      <div>
                        <h5>Search name</h5>
                      </div>
                      <div className="mt-2">
                        <input
                          className="form-control"
                          onChange={e => updateSearch("searchString", e)}
                          value={search.searchString}
                        ></input>
                        <input style={{position: "absolute", opacity :"0.0"}}></input>
                      </div>
                    </div>
                    {/* <div className="col-6 d-flex align-items-end">
                    <CitySelect />
                  </div> */}
                  </div>
                  {/* <div className="search-action">
                    <span className="mdi mdi-refresh cursor-pointer" onClick={updateProducts}></span>
                  </div> */}
                </div>
                <div className="d-flex justify-content-end mt-3">
                  <Pagination {...pagination} movePage={moveToPage} />
                </div>
                <div className="row mt-2 p-0">
                  {type == "Part" ? (
                    parts.length ? (
                      parts.map((product, idx) => (
                        <Part
                          {...product}
                          key={`part-${product._id}`}
                          deleteProduct={deleteProduct}
                          editPart={editPart}
                          showPart={showPart}
                          idx={idx}
                        />
                      ))
                    ) : (
                      <center>
                        <h2>There is no part here, Please add a new part.</h2>
                      </center>
                    )
                  ) : machines.length ? (
                    machines.map((product, idx) => (
                      <Machine
                        key={`machine-${product._id}`}
                        {...product}
                        deleteProduct={deleteProduct}
                        editMachine={editMachine}
                        showMachine={showMachine}
                        idx={idx}
                      />
                    ))
                  ) : (
                    <center>
                      <h2>
                        There is no machine here, Please add a new machine.
                      </h2>
                    </center>
                  )}
                </div>

                <div className="d-flex justify-content-end mt-5">
                  <Pagination {...pagination} movePage={moveToPage} />
                </div>
              </Fragment>
            )}
            {/* </div> */}
          </div>

          {/* <div className="products-container row m-0 p-0 mt-5"> */}
        </div>
      </Container>

      <PartModal
        isOpen={showPartModal}
        toggle={toggleShowPartModal}
        onEdit={editPart}
        updateItem={updateNewPart}
        createItem={createPart}
        item={newPart}
        id={parts[editIndex]?._id}
        reload={updateProducts}
        idx={editIndex}
      />
      <MachineModal
        isOpen={showMachineModal}
        toggle={toggleShowMachineModal}
        onEdit={editMachine}
        item={newMachine}
        id={machines[editIndex]?._id}
        createItem={createMachine}
        updateItem={updateNewMachine}
        reload={updateProducts}
        idx={editIndex}
      />

      <PartEditModal
        item={newPart}
        show={partsModal}
        toggleModal={togglePartsModal}
        updateItem={updateNewPart}
        createItem={createPart}
        edit={edit}
        idx={editIndex}
      />

      <MachineEditModal
        item={newMachine}
        show={machineModal}
        toggleModal={toggleModal}
        updateItem={updateNewMachine}
        createItem={createMachine}
        edit={edit}
        idx={editIndex}
      />
    </div>
  )
}

const mapStatetoProps = state => {
  const user = state.Login.user
  return { user }
}

export default withRouter(connect(mapStatetoProps, {})(ProductList))
