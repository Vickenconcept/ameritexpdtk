import { useState, useContext, useEffect } from "react"
import PropTypes from "prop-types"
import { Row, Col, CardBody, Card, Alert, Container, Label } from "reactstrap"
import Select from "react-select"
import { AvForm, AvField } from "availity-reactstrap-validation"
// Redux
import { connect } from "react-redux"
import { Link, useHistory, withRouter } from "react-router-dom"

// actions
import {
  registerUser,
  apiError,
  registerUserFailed,
} from "../../../store/actions"

import Logo from "../../../assets/images/logo-dark.png"

import { SignupContext } from "../contexts/sign"
import { useMemo } from "react"
import Copyright from "./Copyright"

const SignUp = props => {
  const { up, setUp } = useContext(SignupContext)

  const roles = [
    {
      label: "Role",
      options: [
        {
          value: "Admin",
          label: "Administrator",
        },
        {
          value: "Corporate",
          label: "Corporate",
        },
        {
          value: "Production",
          label: "Production",
        },
        {
          value: "Personnel",
          label: "Personnel",
        },
      ],
    },
  ]

  // const [role, setRole] = useState(roles[0].options[1])
  const [role, setRole] = useState("")
  const [formRef, setFormRef] = useState()
  const locationOptions = [
    {
      label: "Location",
      options: [
        {
          value: "Seguin",
          label: "Seguin",
        },
        {
          value: "Conroe",
          label: "Conroe",
        },
        {
          value: "Gunter",
          label: "Gunter",
        },
      ],
    },
  ]

  const [location, setLocation] = useState("")

  // handleValidSubmit
  const handleValidSubmit = (event, values) => {
    props.registerUser({
      ...values,
      role: role.value,
      location: location.value,
    })
  }

  useEffect(() => {
    props.registerUserFailed("")
  }, [])

  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  console.log(location)
  const valueChanged = (e, field) => {
    const _fields = {
      ...fields,
      [field]: e.target.value,
    }
    setFields(_fields)
    validation(_fields)
  }

  const validation = _fields => {
    const keys = Object.keys(_fields)
    let _isValid = 0
    for (const key of keys) {
      if (_fields[key] == "") _isValid = 1
    }
    if (!_isValid && (location !== "" || role.value == "Admin"))
      setAvailable(true)
    else setAvailable(false)
  }
  useEffect(() => {
    validation(fields)
  }, [location, role])

  const [time, setTime] = useState(0)

  const [disabled, setDiabled] = useState (false)
  useEffect (()=>{
    console.log (props)
    setDiabled(props.registrationRes || props.loading)
    // if (props.registerUser && !props.loading) {
    //   setFields ({
    //     firstName: "",
    //     lastName: "",
    //     email: "",
    //     password: "",
    //     confirmPassword: "",
    //   })
    //   setLocation ("")
    //   setRole("")
    // }
    const timerId = setInterval (()=>{
      if (!props.loading && props.registrationRes) {
        setTime((time)=>time+1)
      }
    }, 1000)
    
    return (()=>clearTimeout(timerId))
  },[props.registrationRes, props.loading])

  const getTimeText = useMemo(()=>{
    if (!props.loading && props.registrationRes) {
        if (time == 10) {
          setUp(false)
        }
      return `You will be redirected to signin page in ${10 - time} seconds`
    }
  },[time, props.registrationRes, props.loading])

  const [available, setAvailable] = useState(false)

  return (
    <div
      className="d-flex flex-column bg-white sm-vw-100 signin-container"
      style={{ height: "100vh" }}
    >
      <div className="d-flex flex-column justify-content-center h-100 signin-form">
      <div
          className="d-flex justify-content-center align-items-center mt-5 flex-column logo-container"
          style={{ height: 200 }}
        >
          <img src={Logo} className="w-75" />
          <h5 className="mt-3">Welcome</h5>
          <h6>Sign up to APMS</h6>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <AvForm
            disabled = {disabled}
            className="mt-2"
            ref={e => setFormRef(e)}
            onValidSubmit={(e, v) => {
              handleValidSubmit(e, v)
            }}
            style={{ width: "100%" }}
          >
            {props.user && props.user ? (
              <Alert color="success">Register User Successfully</Alert>
            ) : null}

            {props.registrationRes ? (
              <Alert color="success">{getTimeText}</Alert>
            ):""}

            {props.registrationError && props.registrationError ? (
              <Alert color="danger">{props.registrationError}</Alert>
            ) : null}

            <div className="mb-3 d-flex" style={{ gap: 8 }}>
              <div className="w-50">
                <AvField
                  name="firstName"
                  label="First Name"
                  type="text"
                  required
                  placeholder="First Name"
                  onChange={e => valueChanged(e, "firstName")}
                />
              </div>
              <div className="w-50">
                <AvField
                  name="lastName"
                  label="Last Name"
                  type="text"
                  required
                  placeholder="Last Name"
                  onChange={e => valueChanged(e, "lastName")}
                />
              </div>
            </div>
            <div className="mb-3">
              <Label>Department</Label>
              <Select
                value={role}
                onChange={v => {
                  if (disabled) return false
                  setRole(v)
                  if (v.value === "Admin") {
                    setLocation("")
                  }
                }}
                options={roles}
                classNamePrefix="select2-selection"
                isDisabled={disabled}
              />
            </div>
            {role.value != "Admin" ? (
              <div className="mb-3">
                <Label>Location</Label>
                <Select
                  onChange={v => {
                    if (disabled) return false
                    setLocation(v)
                  }}
                  placeholder="Select Location"
                  options={locationOptions}
                  classNamePrefix="select2-selection"
                  isDisabled={disabled}
                />
              </div>
            ) : (
              ""
            )}
            <div className="mb-3">
              <AvField
                id="email"
                name="email"
                label="Email"
                type="email"
                required
                placeholder="Enter email"
                onChange={e => valueChanged(e, "email")}
                validate={{
                  required: {
                    value: true,
                    errorMessage: 'Please type your email address'
                  },
                  pattern: {
                    value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
                    errorMessage: 'Your Email must be valid email address'
                  }
                }}
              />
            </div>

            <div className="mb-3">
              <AvField
                name="password"
                label="Password"
                type="password"
                id="password"
                placeholder="Enter Password"
                validate={{
                  required: {
                    value: true,
                    errorMessage: "Please enter a password",
                  },
                  pattern: {
                    value: "/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]/",
                    errorMessage:
                      "Your password must contain at least one special character, Uppercase Character, Lowercase Character and a Number ",
                  },
                  minLength: {
                    value: 8,
                    errorMessage:
                      "Your password must be longer than 8 characters",
                  },
                }}
                onChange={e => {
                  valueChanged(e, "password")
                }}
              />
            </div>

            <div className="mb-3">
              <AvField
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="password"
                validate={{
                  required: {
                    value: true,
                    errorMessage: "Please confirm your password",
                  },
                  match: {
                    value: "password",
                    errorMessage: "Password did not match",
                  },
                }}
                placeholder="Confirm Password"
                onChange={e => valueChanged(e, "confirmPassword")}
              />
            </div>

            <div className="mb-3 row">
              <div className="col-12 text-end">
                <button
                  className="btn btn-primary w-md waves-effect waves-light"
                  type="submit"
                  disabled={!available || disabled}
                >
                  Register
                </button>
              </div>
            </div>

            <div className="mt-2 mb-0 row">
              <div className="col-12 mt-4">
                <p className="mb-0 text-center">
                  By registering you agree to the Ameritex{" "}
                  <Link to="#" className="text-primary">
                    Terms of Use
                  </Link>
                </p>
              </div>
            </div>
          </AvForm>
        </div>
        <div className="mt-3 text-center">
          <p>
            Don&#39;t have an account ?{" "}
            <Link
              to="#"
              className="fw-medium text-primary"
              onClick={ev => {
                setUp(false)
                ev.preventDefault()
              }}
            >
              {" "}
              Signin now{" "}
            </Link>{" "}
          </p>
        </div>
        <Copyright />
      </div>
    </div>
  )
}

const mapStateToProps = state => {
  const { user, registrationError, loading, registrationRes } = state.Account
  const { error } = state.Login
  return { error, user, registrationError, loading, registrationRes }
}

export default connect(mapStateToProps, {
  registerUser,
  apiError,
  registerUserFailed,
})(SignUp)

SignUp.propTypes = {
  registerUser: PropTypes.func,
  registerUserFailed: PropTypes.func,
  registrationError: PropTypes.any,
  user: PropTypes.any,
}
