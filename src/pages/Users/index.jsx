import PropTypes from 'prop-types'
import { Fragment, useEffect, useRef, useState, useContext, useMemo } from "react"
import MetaTags from 'react-meta-tags';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Badge,
} from "reactstrap"
import { Link, useHistory, useParams } from "react-router-dom"
import axios from 'axios';
import decode from "jwt-decode"

import "../../assets/scss/chartist.scss";
// import "../../chartist/dist/scss/chartist.scss";

import "./style.scss"
//i18n
import { withTranslation } from "react-i18next"
import SweetAlert from 'react-bootstrap-sweetalert';
import { removeUser, updateUser } from '../../../actions/auth';
import Select from "react-select"
import Pagination from '../../../components/Common/Pagination';
import { LoadingContext } from "../../../context/loading"

import { connect } from "react-redux"
import { withRouter } from "react-router-dom"

const Users = props => {

  const authUser = props.user;

  const [users, setUsers] = useState([])
  const { loading, setLoading } = useContext(LoadingContext)
  const [isAdmin, setIsAdmin] = useState(false)
  const { filter } = useParams()
  const history = useHistory()
  const [roles, setRoles] = useState([])
  const [count, setCount] = useState(7)
  const [selectedPersonIndex, setSelectedPersonIndex] = useState(-1)
  const [saveAlert, setSaveAlert] = useState(false)
  const [actionType, setActionType] = useState("")
  const [searchName, setSearchName] = useState("")
  const [firstLoading, setFirstLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPage: 1
  })
  const selectRef = useRef()

  useEffect(() => {
    console.log(filter)
  }, [filter])

  const getAllUsers = async () => {
    try {
      setLoading(true)
      setUsers([])
      const response = await axios.get(`/auth/all-users?filter=${filter || ""}&count=${count}&page=${pagination.page}&query=${searchName}`)
      setUsers(response.data.users)
      setRoles(response.data.users.map(user => user.role))
      setLoading(false)
      if (filter == 'Pending' && !response.data.users.length && firstLoading)
        history.push(`/users`)
      setIsAdmin(response.data.isAdmin)
      setFirstLoading(false)
      setPagination({
        ...pagination,
        totalPage: Math.ceil(response.data.totalCount / count)
      })
    } catch (err) {
    }
  }

  useEffect(() => {
    getAllUsers()
  }, [filter, pagination.page, count, searchName])
  // const token = localStorage.getItem("token")
  // let authUser = decode(token)

  const onChangeRole = async (e, index) => {
    if (loading) return
    setLoading(true)
    const response = await updateUser({ id: users[index]._id, role: e.target.value })
    // setUsers(users.map((user, _index) => index == _index ? { ...user, role: e.target.value } : user))
    // setLoading(false)
    getAllUsers()
  }
  const convertUserStatus = (value) => {
    return value == -1 || value == 0 ? 1 : 0
  }
  const toggleUserProperty = async (index, field, action) => {
    if (!isAdmin || loading) return
    setLoading(true)
    const req = action == undefined ? convertUserStatus(users[index][field]) : action;
    const response = await updateUser({
      id: users[index]._id,
      [field]: req,
      'approved_by': authUser._id
    })
    // setUsers(users.map((user, _index) => index == _index ? { ...user, ...response.user } : user))
    // setLoading(false)
    getAllUsers()
  }

  const factoryChanged = async (value, index) => {
    if (loading) return
    setLoading(true)
    const response = updateUser({ id: users[index]._id, factory: value })
    setLoading(false)
    setUsers(users.map((user, _index) => index == _index ? { ...user, factory: value } : user))
  }

  const locationChanged = async (value, index) => {
    if (loading) return
    setLoading(true)
    const response = updateUser({ id: users[index]._id, location: value })
    setLoading(false)
    setUsers(users.map((user, _index) => index == _index ? { ...user, location: value } : user))
  }

  const deleteAccount = async () => {
    if (loading) return
    setLoading(true)
    const response = await removeUser(users[selectedPersonIndex]._id)
    setLoading(false)
    setUsers(users.filter((_, index) => index != selectedPersonIndex))
  }
  const doAction = () => {
    if (actionType == "Delete") deleteAccount()
    else toggleUserProperty(selectedPersonIndex, "restrict")
  }



  const filterChanged = (e) => {
    history.push(`/users/${e.value}`)
  }
  const moveToPage = (_page) => {
    setPagination({
      ...pagination,
      page: _page
    })
  }
  const allOptions = [
    { label: 'All Users', value: '' },
    { label: 'Pending Users', value: 'Pending' },
  ]
  const cityOptions = [
    { label: 'Conroe', value: 'Conroe' },
    { label: 'Gunter', value: 'Gunter' },
    { label: 'Seguin', value: 'Seguin' },

  ]
  const userTypeOptions = [
    { label: 'Administrator', value: 'Admin' },
    { label: 'HR', value: 'HR' },
    { label: 'Accounting', value: 'Accounting' },
    { label: 'Sales', value: 'Sales' },
    { label: 'Personnel', value: 'Personnel' },
    { label: 'Production', value: 'Production' },
  ]
  const userTypeFilterOptions = [
    { label: 'Administrator', value: 'Admin' },
    { label: 'Corporate', value: 'Corporate' },
    { label: 'Personnel', value: 'Personnel' },
    { label: 'Production', value: 'Production' },
  ]
  const userTypeOptionsforHR = [
    { label: 'Personnel', value: 'Personnel' },
    { label: 'Production', value: 'Production' },
  ]
  const accountUsabilityOptions = [
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Archived', value: 'Archived' },
  ]
  const groupedOptions =
    authUser.role == 'Admin' ?
      [
        {
          options: allOptions
        },
        {
          label: "Cities",
          options: cityOptions
        },
        {
          label: "User Types",
          options: userTypeFilterOptions
        },
        {
          label: "Account Usability",
          options: accountUsabilityOptions
        }
      ] :
      authUser.role == 'HR' ?
        isAdmin ?
          [
            {
              options: allOptions
            },
            {
              label: "Cities",
              options: cityOptions
            },
            {
              label: "User Types",
              options: userTypeFilterOptions
            },
            {
              label: "Account Usability",
              options: accountUsabilityOptions
            }
          ] :
          [
            {
              options: allOptions
            },
            {
              label: "User Types",
              options: userTypeOptionsforHR
            },
            {
              label: "Account Usability",
              options: accountUsabilityOptions
            }
          ] :
        [
          {
            options: allOptions
          },
          {
            label: "Account Usability",
            options: accountUsabilityOptions
          }
        ]
    ;
  const userTab = () => {
    if (authUser.role == "Admin" || authUser.role == 'HR' || authUser.role == 'Production')
      return <div className='filter-user-tab'>
        <Select
          onChange={filterChanged}
          ref={selectRef}
          value={filter == 'Pending' ? { label: 'Pending Users', value: 'Pending' } : filter ? { label: filter, value: filter } : { label: "All Users", value: "" }}
          options={groupedOptions}
          defaultValue={filter !== 'Pending' && filter ? { label: filter, value: filter } : filter == 'Pending' ? allOptions[0] : allOptions[1]}
          classNamePrefix="select2-selection w-100"
        /></div>
  }

  const isStatusVisible = useMemo(() => {
    return (filter != 'Pending' && filter != 'Approved')
  }, [filter, authUser.role])

  const isActionVisible = useMemo(() => {
    return (authUser.role == 'Admin' || authUser.role == 'HR' || authUser.role == 'Production') && (filter == 'Pending' || filter == 'Rejected')
  }, [filter, authUser.role])

  const isDirectorVisible = useMemo(() => {
    return (filter != 'Pending')
  }, [filter, authUser.role])

  return (
    <React.Fragment>
      {
        authUser.role !== 'Admin' &&
          authUser.role !== 'HR' &&
          authUser.role !== "Production"
          ?
          ""
          :
          <div className="page-content users-page-content" style={{ minHeight: '100vh' }}>
            <MetaTags>
              <title>Users</title>
            </MetaTags>
            <Container fluid>
              {saveAlert ? (
                <SweetAlert
                  showCancel
                  title="Are you sure?"
                  cancelBtnBsStyle="danger"
                  confirmBtnBsStyle="success"
                  onConfirm={() => {
                    setSaveAlert(false)
                    doAction()
                  }}
                  onCancel={() => {
                    setSaveAlert(false)
                  }}
                >
                </SweetAlert>) : null
              }
              <div className="page-content-header mt-5 user-page-content-header ">
                <h2>Team Members</h2>
                <div className='sub-menu text-uppercase'>
                  <span className="parent">Users</span>
                  <span className="mx-1"> &gt; </span>
                  <span className='sub text-danger'>TEXAS</span>
                </div>
                <div className='divide-line d-flex align-items-center pt-5'>
                  <div className='line'></div>
                </div>
              </div>
              <Row>
                <Col xl={12}>
                  <Card className='mt-5 border'>
                    <CardBody className='p-0'>
                      <div className="my-4 px-3 d-flex justify-content-between">
                        <div style={{ width: 200 }}>
                          {userTab()}
                        </div>
                        <div className='d-flex align-items-center '>
                          <div className='countshow d-flex align-items-center mx-3' >
                            <span className="me-2">Show</span>
                            <input className="px-2 py-1 bg-light form-control" value={count} style={{ width: 40 }} onChange={e => setCount(e.target.value)} />
                          </div>
                          <div style={{ width: 200 }}>
                            <input className="form-control" placeholder="Search Names..." value={searchName} onChange={e => setSearchName(e.target.value)} />
                            <input style={{ position: "absolute", marginLeft: "50%", opacity: "0.0" }} />
                          </div>
                        </div>
                      </div>
                      <div className="d-flex users-table" style={{ position: 'relative' }}>
                        <div className='table-responsive table-container'>
                          <table className="table table-hover table-centered table-nowrap mb-0">
                            <thead>
                              <tr>
                                <th className='ps-3' scope="col">Id</th>
                                <th scope="col">Name</th>
                                <th scope="col">Email</th>
                                <th scope="col">Location</th>
                                <th scope="col">Factory</th>
                                <th scope="col">Role</th>
                                {isDirectorVisible && <th className='pe-3' scope="col">Director</th>}
                                {isStatusVisible && <th scope="col" style={{ borderLeft: '2px solid #e9edf2', paddingLeft: '1rem' }}>Status</th>}
                                {isActionVisible && <th scope="col" style={{ textAlign: 'center' }}>Action</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {
                                users.map((user, index) => (
                                  <tr key={"userFields" + user._id} style={{ height: 52 }} className={(
                                    (user._id == authUser._id) ?
                                      'user-mine' :
                                      ''
                                  )}>
                                    <td className='ps-3' scope="row">{index + 1 + (pagination.page - 1) * count}</td>
                                    <td >
                                      <div className='name'>
                                        <b> {user.firstName + ' ' + user.lastName}</b>
                                      </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td style={{ width: 82 }}>
                                      {
                                        isAdmin ? user.role == "Admin" ? "Global" : <select className='form-select' onChange={e => locationChanged(e.target.value, index)} value={user.location}>
                                          <option value="Seguin">Seguin</option>
                                          <option value="Conroe">Conroe</option>
                                          <option value="Gunter">Gunter</option>
                                        </select>
                                          : user.location
                                      }
                                    </td>
                                    <td style={{ width: 100 }} >
                                      {
                                        (authUser.role == "Production" || authUser.role == "HR" || authUser.role == "Admin") && (user.role == "Personnel" || user.role == "Production") ?
                                          <select className='form-select' onChange={e => factoryChanged(e.target.value, index)} value={user.factory || ""}>
                                            <option value="" disabled >Select...</option>
                                            <option value="Pipe">Pipe</option>
                                            <option value="Box">Box</option>
                                            <option value="MBK">MBK</option>
                                            <option value="Precast">Precast</option>
                                            <option value="Steel">Steel</option>
                                            <option value="Off-Site">Off-Site</option>
                                          </select>
                                          : user.role !== "Personnel" && user.role !== "Production" ? "Global" : user.factory
                                      }
                                    </td>
                                    <td style={{ maxWidth: 112 }}>
                                      {
                                        authUser.role == "Admin" && (user.role == "Corporate" || user.role == "HR" || user.role == "Sales" || user.role == "Accounting" || user.role == "Admin") ?
                                          <select className="form-select" id="role" value={user.role} onChange={v => onChangeRole(v, index)}>
                                            <option value="Corporate" disabled>Corporate</option>
                                            {
                                              userTypeOptions.map(role => <option value={role.value} key={"usera-" + index + "-" + role.value}>{role.label}</option>)
                                            }
                                          </select> : user.role
                                      }
                                    </td>
                                    {isDirectorVisible &&
                                      <td style={{ width: 80 }}>
                                        {
                                          user.role == "HR" ? <span className={`badge cursor-pointer ${user.admin ? "bg-success" : "bg-danger"}`} onClick={() => toggleUserProperty(index, "admin")}>
                                            {user.admin ? "Yes" : "No"}
                                          </span> : ""
                                        }
                                      </td>
                                    }
                                    {isStatusVisible &&
                                      <td style={{ width: '96px', paddingInline: '16px', borderLeft: '2px solid #e9edf2' }}>
                                        <span
                                          className={`badge px-2 py-1 ${user.approved == 0 ? "bg-danger" : user.approved == 1 && !user.restrict ? "bg-success" : "bg-warning"}`}
                                          style={{ width: 64 }}
                                        >
                                          {!user.approved ? "Rejected" :
                                            user.restrict ? "Restricted" :
                                              user.approved == 1 ? "Approved" :
                                                user.approved == -1 ? "Pending" : ""

                                          }
                                        </span>
                                      </td>
                                    }
                                    {isActionVisible &&
                                      <td style={{ textAlign: 'center' }}>
                                        {(user._id == authUser._id) ? "" : (<>
                                          <Button
                                            className={`px-2 py-1 text-white 
                                        ${user.approved == 1 ? 'bg-danger' : 'bg-success'} 
                                        ${(user.role == 'Production' || user.role == 'Personnel') && !user.factory ? 'disabled' : ''}`}
                                            onClick={() => {
                                              if (((user.role == 'Production' || user.role == 'Personnel') && user.factory) || (user.role !== 'Production' && user.role !== 'Personnel'))
                                                toggleUserProperty(index, "approved")
                                            }}
                                            style={{ width: 66 }}>
                                            {user.approved == 1 ? 'Reject' : 'Approve'}
                                          </Button>
                                        </>)}
                                      </td>
                                    }
                                  </tr>
                                ))
                              }
                            </tbody>
                          </table>

                        </div>
                        {
                          <div className='dropdown-user' >
                            <div className='border-bottom' style={{ height: 36, width: 20 }}></div>
                            {
                              users.map((user, index) => (
                                <div key={"user_dropdown_" + user._id} className='py-2 border-bottom' style={{ height: 52 }}>
                                  <b className='position-relative'>
                                    <i className='mdi mdi-dots-vertical cursor-pointer' data-bs-toggle="dropdown" aria-expanded="false" id={"userEdit" + index}></i>
                                    {(user._id == authUser._id) ? "" : (
                                      <div className='dropdown-menu dropdown-menu-end postion-fixed' aria-labelledby={"userEdit" + index} >

                                        {!isAdmin ? "" :
                                          <Fragment>
                                            <div className='dropdown-item px-3 py-2 border-bottom'  >
                                              <Button
                                                className={`px-2 py-1 text-white bg-info `}
                                                onClick={() => {
                                                  if (((user.role == 'Production' || user.role == 'Personnel') && user.factory) || (user.role !== 'Production' && user.role !== 'Personnel'))
                                                    history.push(`/profile/${user._id}`)
                                                }}
                                                style={{ width: 66 }}>
                                                Edit
                                              </Button>
                                            </div>
                                            <div className='px-3 py-1 border-bottom'  ></div>
                                            {user.approved === 0 ? "" :
                                              user.approved !== 1 ?
                                                <div className='dropdown-item px-3 py-2 border-bottom'  >
                                                  <Button
                                                    className={`px-2 py-1 text-white bg-danger `}
                                                    onClick={() => {
                                                      toggleUserProperty(index, "approved", 0)
                                                    }}
                                                    style={{ width: 66 }}>
                                                    Reject
                                                  </Button>
                                                </div>
                                                :
                                                <div className='dropdown-item px-3 py-2 border-bottom'  >
                                                  <Button className={`px-2 py-1 text-white ${user.restrict ? "bg-success" : "bg-warning"}`} onClick={() => {
                                                    setSaveAlert(true)
                                                    setSelectedPersonIndex(index)
                                                    setActionType("Archive")
                                                  }}
                                                    style={{ width: 66 }}>
                                                    {user.restrict ? "Restore" : "Archive"}
                                                  </Button>
                                                </div>
                                            }
                                            <div className='dropdown-item px-3 py-2 border-bottom'>
                                              <Button className="px-2 py-1 text-white bg-dark" onClick={() => {
                                                setSaveAlert(true)
                                                setSelectedPersonIndex(index)
                                                setActionType("Delete")
                                              }}
                                                style={{ width: 66 }}>
                                                Delete
                                              </Button>
                                            </div>
                                          </Fragment>
                                        }
                                        {(user._id == authUser._id) ? "" : (authUser.role == 'HR' || authUser.role == 'Production') ?
                                          <div className='dropdown-item px-3 py-2'>
                                            <Button
                                              className={`px-2 py-1 text-white 
                                      ${user.approved == 1 ? 'bg-danger' : 'bg-success'} 
                                      ${(user.role == 'Production' || user.role == 'Personnel') && !user.factory ? 'disabled' : ''}`}
                                              onClick={() => {
                                                if (((user.role == 'Production' || user.role == 'Personnel') && user.factory) || (user.role !== 'Production' && user.role !== 'Personnel'))
                                                  toggleUserProperty(index, "approved")
                                              }}
                                              style={{ width: 66 }}>
                                              {user.approved == 1 ? 'Reject' : 'Approve'}
                                            </Button>
                                          </div>
                                          : ""
                                        }
                                      </div>
                                    )
                                    }
                                  </b>
                                </div>
                              ))
                            }
                          </div>
                        }
                      </div>
                      <div className='border-0 py-3' style={{ borderRadius: '10px' }}>
                        <Pagination
                          {...pagination}
                          movePage={moveToPage} />
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Container>
          </div>
      }
    </React.Fragment>
  )
}

Users.propTypes = {
  t: PropTypes.any
}

const mapStatetoProps = state => {
  const { error, success } = state.Profile
  const user = state.Login.user
  return { error, success, user }
}

export default withRouter(connect(mapStatetoProps, {})(Users))
