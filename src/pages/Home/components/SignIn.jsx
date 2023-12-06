import { useState, useContext, useEffect } from "react"
import PropTypes from "prop-types"

// Redux
import { connect } from "react-redux"
import { Link, useHistory, withRouter } from "react-router-dom"

// actions
import { loginUser, apiError } from "../../../store/actions"

import Logo from "../../../assets/images/logo-dark.png"

import { SignupContext } from "../contexts/sign"

import { Row, Col, CardBody, Card, Alert, Container, Label } from "reactstrap"
import { isUserAuthenticated } from "helpers/fakebackend_helper"
import { useNetStatus } from "context/net"
import Copyright from "./Copyright"

const SignIn = props => {
  const {isOnline} = useNetStatus()
  const { up, setUp } = useContext(SignupContext)
  const [data, setData] = useState({ email: "", password: "" })
  const [available, setAvailable] = useState(false)
  const history = useHistory()

  useEffect(() => {
    onChangeField({target: {value: (!isOnline)}}, "offline")
  },[isOnline])

  const onChangeField = (e, field) => {
    const _data = {
      ...data,
      [field]: e.target.value,
    }
    setAvailable(_data.email && _data.password)
    setData(_data)
    props.apiError("")
  }

  const login = () => {
    props.loginUser(data, history)
  }

  useEffect(() => {
    
  }, [props.error])
  useEffect(() => {
    props.apiError("")
    // if (isUserAuthenticated()) {
    //   history.push("/profile-home")
    // }
  }, [])
  return (
    <div
      className="d-flex flex-column bg-white sm-vw-100 signin-container"
      style={{ height: "100vh", overflow: "auto" }}
    >
      <div className="d-flex justify-content-center flex-column h-100 signin-form">
        <div
          className="d-flex align-items-center justify-content-center mt-5 flex-column logo-container"
          style={{ height: 200 }}
        >
          <img src={Logo} className="w-75" />
          <h5 className="mt-3">Welcome</h5>
          <h6>Sign in to APMS</h6>
        </div>

        <div className="d-flex justify-content-between align-items-center">
        <div
          className="d-flex flex-column justify-content-center h-100 signin-form w-100"
        >
          {props.error && props.error && !props.error.toString().startsWith("Error: Request failed with status code") ? (
            <Alert color="danger">{props.error.toString()}</Alert>
          ) : ""}
          {!isOnline &&
          <Alert color="warning">
            It's offline state now. <br/>
            Please check the network status. <br/>
            Or if you logged in once in 6 hours, you can log in with that user for offline working. 
          </Alert>
          }
          <Alert color="warning">
            We are upgrading the portal architecture to 2.0, you'll be notified when access is restored.
          </Alert>
          {/* <div>
            <label>Username</label>
            <input
              className="form-control"
              type="email"
              placeholder="Enter Username"
              onChange={e => onChangeField(e, "email")}
            />
          </div>

          <div className="mt-3">
            <label>Password</label>
            <input
              className="form-control"
              type="password"
              placeholder="Enter Password"
              onChange={e => onChangeField(e, "password")}
            />
          </div> */}

          {/* <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="form-check mt-3">
              <input type="checkbox" className="form-check-input" />
              <label className="form-check-label">Remember Me</label>
            </div>

            <div>
              <button
                className="btn btn-danger"
                disabled={!available}
                onClick={login}
              >
                Log In
              </button>
            </div>
          </div> */}
          {/* {isOnline&&
          <div className="mt-5 text-center">
            <p>
              Don&#39;t have an account ?{" "}
              <Link
                to="#"
                className="fw-medium text-primary"
                onClick={ev => {
                  setUp(true)
                  ev.preventDefault()
                }}
              >
                {" "}
                Signup now{" "}
              </Link>{" "}
            </p>
          </div>
          } */}
          <Copyright />
        </div>
      </div>

      </div>
    </div>
  )
}

const mapStateToProps = state => {
  const { error } = state.Login
  return { error }
}

export default withRouter(
  connect(mapStateToProps, { loginUser, apiError })(SignIn)
)

SignIn.propTypes = {
  error: PropTypes.any,
  history: PropTypes.object,
  loginUser: PropTypes.func,
}
