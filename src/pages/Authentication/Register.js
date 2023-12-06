import PropTypes, { object } from "prop-types"
import React, { useEffect, useRef, useState } from "react"
import MetaTags from 'react-meta-tags';
import { Row, Col, CardBody, Card, Alert, Container, Label } from "reactstrap"

// availity-reactstrap-validation
import { AvForm, AvField } from "availity-reactstrap-validation"
import Logo from "../../assets/images/logo-dark.png"
// action
import { registerUser, apiError, registerUserFailed } from "../../store/actions"

// Redux
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import Select from "react-select"
// import images
import logoSm from "../../assets/images/logo-sm.png";

const Register = props => {

  const roles = [
    {
      label: "Role",
      options: [
        {
          value: 'Admin',
          label: 'Admin'
        },
        {
          value: 'Corporate',
          label: 'Corporate'
        },
        {
          value: 'Production',
          label: 'Production'
        },
        {
          value: 'Personnel',
          label: 'Personnel'
        },
      ]
    }
  ]

  const [role, setRole] = useState(roles[0].options[1])
  const [formRef, setFormRef] = useState()
  const locationOptions = [
    {
      label: "Location",
      options: [
        {
          value: "Seguin",
          label: "Seguin"
        },
        {
          value: "Conroe",
          label: "Conroe"
        },
        {
          value: "Gunter",
          label: "Gunter"
        }
      ]
    }
  ]

  const [location, setLocation] = useState("")

  // handleValidSubmit
  const handleValidSubmit = (event, values) => {
    props.registerUser({
      ...values,
      role: role.value,
      location: location.value
    })
  }

  useEffect(() => {
    props.apiError("")
  }, []);

  const [fields, setFields] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: ""
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

  const validation = (_fields) => {
    const keys = Object.keys(_fields)
    let _isValid = 0
    for (const key of keys) {
      if (_fields[key] == '') _isValid = 1
    }
    if ((!_isValid) && (location !== "" || role.value == 'Admin')) setAvailable(true)
    else setAvailable(false)
  }
  useEffect(() => {
    validation(fields)
  }, [location, role])
  const [available, setAvailable] = useState(false)

  return (
    <React.Fragment>
      <MetaTags>
        <title>Register | Ameritex Production Management System</title>
      </MetaTags>
      <div className="home-btn d-none d-sm-block">
        <Link to="/" className="text-dark">
          <i className="fas fa-home h2"></i>
        </Link>
      </div>
      <div className="account-pages my-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={4}>
              <Card className="overflow-hidden">
                <div className="bg-white">
                  <div className="d-flex justify-content-center align-items-center mt-5 flex-column logo-container">
                    <img src={Logo} width={200} />
                    <h5 className="mt-3">Welcome</h5>
                    <h6>Sign up to APMS</h6>
                  </div>
                </div>
                <CardBody className="p-4 pt-0">
                  <div className="p-3" style={{ overflowX: 'hidden', overflowY: 'auto' }}>
                    <AvForm
                      className="mt-2"
                      ref={e => setFormRef(e)}
                      onValidSubmit={(e, v) => {
                        handleValidSubmit(e, v)
                      }}
                    >
                      {props.user && props.user ? (
                        <Alert color="success">
                          Register User Successfully
                        </Alert>
                      ) : null}

                      {props.registrationError &&
                        props.registrationError ? (
                        <Alert color="danger">
                          {props.registrationError}
                        </Alert>
                      ) : null}

                      <div className="mb-3 d-flex" style={{ gap: 8 }}>
                        <div className="w-50">
                          <AvField
                            name="firstName"
                            label="First Name"
                            type="text"
                            required
                            placeholder="First Name"
                            onChange={(e) => valueChanged(e, "firstName")}
                          />
                        </div>
                        <div className="w-50">
                          <AvField
                            name="lastName"
                            label="Last Name"
                            type="text"
                            required
                            placeholder="Last Name"
                            onChange={(e) => valueChanged(e, "lastName")}
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <Label>Department</Label>
                        <Select
                          value={role}
                          onChange={(v) => {
                            setRole(v)
                            if(v.value==='Admin') {
                              setLocation("")
                            }
                          }}
                          options={roles}
                          classNamePrefix="select2-selection"
                        />
                      </div>
                      {
                        role.value != "Admin" ? <div className="mb-3">
                          <Label>Location</Label>
                          <Select
                            onChange={(v) => {
                              setLocation(v)
                            }}
                            placeholder="Select Location"
                            options={locationOptions}
                            classNamePrefix="select2-selection"
                          />
                        </div> : ""
                      }
                      <div className="mb-3">
                        <AvField
                          id="email"
                          name="email"
                          label="Email"
                          type="email"
                          required
                          placeholder="Enter email"
                          onChange={(e) => valueChanged(e, "email")}
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
                            required: { value: true, errorMessage: 'Please enter a password' },
                            pattern: {
                              value: '/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]/',
                              errorMessage: 'Your password must contain at least one special character, Uppercase Character, Lowercase Character and a Number '
                            },
                            minLength: { value: 8, errorMessage: 'Your password must be longer than 8 characters' },
                          }}
                          onChange={(e) => {
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
                          validate={
                            {
                              required: { value: true, errorMessage: 'Please confirm your password' },
                              match: { value: 'password', errorMessage: 'Password did not match' }
                            }
                          }
                          placeholder="Confirm Password"
                          onChange={(e) => valueChanged(e, "confirmPassword")}
                        />
                      </div>

                      <div className="mb-3 row">
                        <div className="col-12 text-end">
                          <button
                            className="btn btn-primary w-md waves-effect waves-light"
                            type="submit"
                            disabled={!available}
                          >
                            Register
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 mb-0 row">
                        <div className="col-12 mt-4">
                          <p className="mb-0">
                            By registering you agree to the Ameritex{" "}
                            <Link to="#" className="text-primary">
                              Terms of Use
                            </Link>
                          </p>
                        </div>
                      </div>
                    </AvForm>
                  </div>
                </CardBody>
              </Card>
              <div className="mt-5 text-center">
                <p>
                  Already have an account ?{" "}
                  <Link to="/" className="fw-medium text-primary">
                    {" "}
                    Login
                  </Link>{" "}
                </p>
                <p>
                  © {new Date().getFullYear()} Ameritex. Crafted with{" "}
                  <i className="mdi mdi-heart text-danger" /> by Ieoko Media
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  )
}

Register.propTypes = {
  registerUser: PropTypes.func,
  registerUserFailed: PropTypes.func,
  registrationError: PropTypes.any,
  user: PropTypes.any,
}

const mapStatetoProps = state => {
  const { user, registrationError, loading } = state.Account
  return { user, registrationError, loading }
}

export default connect(mapStatetoProps, {
  registerUser,
  apiError,
  registerUserFailed,
})(Register)
