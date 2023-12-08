import PropTypes from 'prop-types'
import { useEffect, useState } from "react"
import MetaTags from 'react-meta-tags';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
} from "reactstrap"
import { Link } from "react-router-dom"
import axios from 'axios';
import decode from "jwt-decode"

// import "../../chartist/dist/scss/chartist.scss";
import "../../assets/scss/chartist.scss"

//i18n
import { withTranslation } from "react-i18next"
import SweetAlert from 'react-bootstrap-sweetalert';
import { removeUser, updateUser } from '../../actions/auth';

const Users = props => {

  const [users, setUsers] = useState([])
  const [loading, setLoaing] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const getAllUsers = async () => {
    try {
      const response = await axios.get("/auth/all-users?filter=HR")
      setUsers(response.data.users)
      setRoles(response.data.users.map(user => user.role))
      setIsAdmin(response.data.isAdmin)
    } catch (err) {

    }
  }

  useEffect(() => {
    getAllUsers()
  }, [])

  const [roles, setRoles] = useState([])
  const onChangeRole = (e, index) => {
    setRoles(roles.map((r, _index) => index == _index ? e.target.value : r))
  }
  const toggleUserProperty = async (index, field) => {
    if (!isAdmin || loading) return
    setLoaing(true)
    const response = updateUser({ id: users[index].id, [field]: !users[index][field] })
    setLoaing(false)
    setUsers(users.map((user, _index) => index == _index ? { ...user, [field]: !user[field] } : user))
  }
  const deleteAccount = async () => {
    if (loading) return
    setLoaing(true)
    const response = await removeUser(users[selectedPersonIndex].id)
    setLoaing(false)
    setUsers(users.filter((_, index) => index != selectedPersonIndex))
  }
  const doAction = () => {
    if (actionType == "Delete") deleteAccount()
    else toggleUserProperty(selectedPersonIndex, "restrict")
  }

  const [selectedPersonIndex, setSelectedPersonIndex] = useState(-1)
  const [saveAlert, setSaveAlert] = useState(false)
  const [actionType, setActionType] = useState("")

  return (
    <React.Fragment>
      <div className="page-content">
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
          <Row>
            <Col xl={12}>
              <Card>
                <CardBody>
                  <h4 className="card-title mb-4">Users</h4>
                  <div className="table-responsive">
                    <table className="table table-hover table-centered table-nowrap mb-0">
                      <thead>
                        <tr>
                          <th scope="col">Id</th>
                          <th scope="col">Name</th>
                          <th scope="col">Email</th>
                          <th scope="col">Location</th>
                          <th scope="col">Role</th>
                          <th scope="col">Status</th>
                          <th scope="col">Admin</th>
                          <th scope="col"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          users.map((user, index) => (
                            <tr key={"user" + index} >
                              <th scope="row">{index + 1}</th>
                              <td>
                                <div>
                                  {user.firstName + ' ' + user.lastName}
                                </div>
                              </td>
                              <td>{user.email}</td>
                              <td>{user.location}</td>
                              <td>
                                {
                                  user.role == "admin" ? <select id="role" className="form-select" onChange={v => onChangeRole(v, index)}>
                                    {
                                      (user.role == "income" ? ["income"] : ["HR", "Production", "Personnel"]).map(role => <option value={role} key={"user-" + index + "-" + role}>{role}</option>)
                                    }
                                  </select> : user.role
                                }
                              </td>
                              <td>
                                <span className={`badge cursor-pointer ${user.approved ? "bg-success" : "bg-danger"}`} onClick={() => toggleUserProperty(index, "approved")}>
                                  {user.approved ? "Approved" : "Under Review"}
                                </span>
                              </td>
                              <td>
                                <span className={`badge cursor-pointer ${user.admin ? "bg-success" : "bg-danger"}`} onClick={() => toggleUserProperty(index, "admin")}>
                                  {user.admin ? "Yes" : "No"}
                                </span>
                              </td>
                              <td>
                                <Button className="text-white bg-danger ms-3" onClick={() => {
                                  setSaveAlert(true)
                                  setSelectedPersonIndex(index)
                                  setActionType("Delete")
                                }}>
                                  Delete
                                </Button>
                                <Button className="text-white bg-info ms-3" onClick={() => {
                                  setSaveAlert(true)
                                  setSelectedPersonIndex(index)
                                  setActionType("Archieve")
                                }}>
                                  Archieve
                                </Button>
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

    </React.Fragment>
  )
}

Users.propTypes = {
  t: PropTypes.any
}

export default withTranslation()(Users)
