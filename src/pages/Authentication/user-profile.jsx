import PropTypes from "prop-types"
import MetaTags from "react-meta-tags"
import { useState, useEffect, useRef, useContext } from "react"
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  CardBody,
  Media,
  Button,
  CardFooter,
} from "reactstrap"
import { AvForm, AvField } from "availity-reactstrap-validation"
import sampleAvatar from "../../assets/images/person.svg"
// availity-reactstrap-validation
import './styles.scss'
// Redux
import { connect } from "react-redux"
import { withRouter } from "react-router-dom"
import SweetAlert from 'react-bootstrap-sweetalert'

import { LoadingContext } from "../../context/loading"
import { avatar2url } from "../../helpers/functions"

//Import Breadcrumb

// actions
import { editProfile, resetProfileFlag } from "../../store/actions"
import { updateProfile, updateAvatar, setUserProfile } from "../../store/auth/login/actions"

import "react-image-picker-editor/dist/index.css"
import axios from "axios"

const UserProfile = props => {
  const [user, setUser] = useState()
  const [fileName, setFileName] = useState();
  const { loading, setLoading } = useContext(LoadingContext)

  const config2 = {
    borderRadius: "50px",
    language: "en",
    width: "100px",
    height: "100px",
    objectFit: "contain",
    compressInitial: null,
  }
  const userAvatarRef = useRef()

  // const brand = "BRAND"
  // const updateUser = (e, field) => {
  //   const _user = { ...user, 
  //     [field]: e.target ? e.target.value : e, 
  //     id: user._id, 
  //     _id: undefined, 
  //     avatar: undefined, 
  //     // password: undefined, 
  //     // confirmPassword: undefined, 
  //     // email: undefined, 
  //     role: undefined, 
  //     status: undefined, 
  //     createdAt: undefined, 
  //     updatedAt: undefined, 
  //     __v: undefined,  
  //   }
  //   setUser(_user)
  // }

  var initialPhoto = sampleAvatar;

  const [uid, setUid] = useState(null)
  const [thisLoading, setThisLoading] = useState(true)

  const getProfile = async (uid) => {
    try {
      setLoading(true)
      setThisLoading(true)
      console.log("/auth/get-profile?id=" + uid)
      const res = await axios.get("/auth/get-profile?id=" + uid)
      console.log(res.data)
      if (res.data.user) {
        setUser(res.data.user)
        setUid(res.data.user._id)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
      setThisLoading(false)
    }
  }

  useEffect(() => {
    console.log('useEffect')
    if (props.match?.params?.id != null) {
      console.log(props.match.params.id)
      if (props.match.params.id != uid) {
        getProfile(props.match.params.id)
      }
    } else {
      setUser(props.authUser)
      setLoading(false)
      setThisLoading(false)
    }
  }, [props.match.params])

  useEffect(() => {
    if (user?.avatar) {
      const avatar = avatar2url(user.avatar) || sampleAvatar
      setPhoto(avatar)
      initialPhoto = avatar
    }
  }, [user])

  const [photo, setPhoto] = useState(initialPhoto);
  const onPhotoSelect = (ev) => {
    if (ev.target.files.length) {
      let file = ev.target.files[0];
      if (!file.type.startsWith("image/")) return false;
      setPhoto(URL.createObjectURL(file))
      setFileName(file.name)
    }
  }

  const uploadAvatar = () => {
    const avatar = userAvatarRef.current.files[0]
    let formData = new FormData()
    formData.append("avatar", avatar)
    formData.append("id", user._id)
    setLoading(true);
    axios.post("/auth/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((res) => {
      if (res.status == 200) {
        if (res.data.success) {
          setUser({ ...user, avatar: res.data.avatar })
          if (res.data.me)
            props.updateAvatar(res.data.avatar)
          setMsg({ type: 'success', txt: 'Avatar changed successfully', title: 'Change your avatar' })
        }
      }
    }).catch((err) => {
      setMsg({ type: 'error', txt: 'Server Error', title: 'Change your avatar' })
    }).finally(() => {
      setLoading(false);
      setShowMsg(true)
    })
  }

  const [input, setInput] = useState({
    id: props.authUser._id,
    firstName: '',
    lastName: '',
    email: '',
    factory: '',
  })

  useEffect(() => {
    if (user) {
      setInput({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        factory: user.factory,
      })
    }
  }, [user])

  const updateInput = (e) => {
    const { name, value } = e.target
    setInput({
      ...input,
      [name]: value,
    })
  }

  const updateName = async (e, v) => {
    setLoading(true)
    try {
      await props.updateProfile(input)
      setMsg({ type: 'success', txt: 'Your profile changed successfully', title: 'Change your profile' })
    } catch (error) {
      console.log(error)
      setMsg({ type: 'error', txt: 'Server Error', title: 'Change your profile' })
    } finally {
      // console.log (input)
      setShowMsg(true)
      setLoading(false)
    }
  }

  const [password, setPassword] = useState();

  const [showMsg, setShowMsg] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const onConfirm = () => {
    setShowConfirm(false);
    // setTimeout(1000, ()=>{
    setLoading(true)
    axios.post("/auth/update-profile", { id: user._id, password }).then((res) => {
      console.log(res.data)
      if (res.data.success)
        setMsg({ type: 'success', txt: res.data.msg, title: 'Change your password' })
    }).catch((error) => {
      setMsg({ type: 'error', txt: 'Server Error', title: 'Change your password' })
    }).finally(() => {
      setShowMsg(true)
      setLoading(false)
    })
    // })
  }

  const onCancel = () => {
    setShowConfirm(false);
  }

  const handleValidSubmit = (e, v) => {
    setPassword(v.password);
    setShowConfirm(true);
  }

  return (
    <React.Fragment>
      {(showMsg && msg != null) &&
        <SweetAlert success={msg.type == 'success'} error={msg.type == 'error'} title={msg.title} onConfirm={() => { setShowMsg(false) }} onCancel={() => { setShowMsg(false) }}>
          {msg.txt}
        </SweetAlert>
      }
      {showConfirm &&
        <SweetAlert info title={msg.title} onConfirm={onConfirm} onCancel={onCancel}>
          Confirm to change your password?
        </SweetAlert>
      }
      <div className="page-content">
        <MetaTags>
          <title>Profile</title>
        </MetaTags>
        <Container fluid>
          <div className="eidt-account-page-container mt-5 mx-auto">
            <div className='page-content-header'>
              <h2>
                {!user ? '' : (user._id == props.authUser._id) ? 'My ' : (user.firstName + ' ` s  ')}
                Profile
              </h2>
              <div className='sub-menu text-uppercase'>
                <span className="parent">OVERVIEW</span>
                <span className="mx-1"> &gt; </span>
                <span className='sub text-danger'>EDIT ACCOUNT</span>
              </div>
              <div className='divide-line d-flex align-items-center pt-5'>
                <div className='line'></div>
              </div>
            </div>

            {thisLoading && <p>Loading...</p>}

            {user &&
              <div className="mt-5 mx-auto">

                <h3>Basic Information</h3>

                <Card>
                  <AvForm
                    onValidSubmit={updateName}
                  >
                    <input type="hidden" name="id" value={user._id} />
                    <CardBody>
                      <div className="list-group list-group-form">
                        <div className="list-group-item ">
                          <div className="form-group row align-items-center mb-0">
                            <label className="form-label col-form-label col-sm-3">
                              First name
                            </label>
                            <div className="col-sm-9">
                              <input
                                type="text"
                                className="form-control"
                                value={input.firstName || ""}
                                placeholder="Your first name ..."
                                name="firstName"
                                onChange={e => updateInput(e, 'firstName')}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="list-group-item">
                          <div className="form-group row align-items-center mb-0">
                            <label className="form-label col-form-label col-sm-3">
                              Last name
                            </label>
                            <div className="col-sm-9">
                              <input
                                type="text"
                                className="form-control"
                                value={input.lastName || ""}
                                placeholder="Your last name ..."
                                name="lastName"
                                onChange={e => updateInput(e, 'lastName')}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="list-group-item rounded-0">
                          <div className="form-group row align-items-center mb-0">
                            <label className="form-label col-form-label col-sm-3">
                              Email address
                            </label>
                            <div className="col-sm-9">
                              <AvField
                                name="email"
                                type="email"
                                className="form-control"
                                value={input.email}
                                placeholder="Your email address ..."
                                onChange={e => updateInput(e, 'email')}
                                validate={{
                                  required: {
                                    value: true,
                                    errorMessage: 'Please type your email address'
                                  },
                                  pattern: {
                                    value: '/(\W|^)[\\w.+\\-]*@(ameritexpipe)\\.com(\\W|$)/',
                                    errorMessage: 'Your Email must be valid email address'
                                  }
                                }}
                              />
                              <div className="mt-1 text-black-50">
                                Note that if you change your email, you will have to
                                confirm it again.
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="list-group-item">
                          <div className="form-group row align-items-center mb-0">
                            <label className="form-label col-form-label col-sm-3">
                              Factory
                            </label>
                            <div className="col-sm-9">
                              <input
                                type="text"
                                className="form-control"
                                value={input.factory || ""}
                                placeholder="Your Factory name ..."
                                name="factory"
                                disabled={true}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                    <CardFooter>
                      <div style={{ position: "absolute", left: "35px", fontSize: "large" }}>approved by <code className="ml-3" style={{ fontSize: "inherit" }}>{user.approved_by != undefined ? (user.approved_by.firstName + " " + user.approved_by.lastName) : "self"}</code></div>
                      <button
                        className="btn btn-primary w-md waves-effect waves-light"
                        type="submit"
                      >
                        SAVE CHANGES
                      </button>
                    </CardFooter>
                  </AvForm>
                </Card>

                <h3>Profile & Privacy</h3>

                <Card>
                  <CardBody>
                    <div className="list-group list-group-form">
                      <div className="list-group-item">
                        <div className="form-group row align-items-center mb-0">
                          <label className="col-form-label form-label col-sm-3">
                            Your photo
                          </label>
                          <div className="col-sm-9 media d-flex align-items-center">
                            <div className="media-left mr-16pt">
                              <img
                                src={photo}
                                alt="people"
                                width="56"
                                height="56"
                                className="rounded-circle"
                                style={{ objectFit: 'cover' }}
                              />
                            </div>
                            <div className="media-body ps-3 flex-fill">
                              <div className="custom-file w-100 ">
                                <input
                                  type="file"
                                  ref={userAvatarRef}
                                  className="custom-file-input d-none"
                                  id="inputGroupFile01"
                                  onChange={onPhotoSelect}
                                />
                                <div className="d-flex align-items-center cursor-pointer">
                                  <div className="form-control rounded-0 rounded-start">
                                    {fileName || "Choose File"}
                                  </div>
                                  {/* <div
                                  className="form-control border-start-0 rounded-0 text-white btn-danger"
                                  style={{ width: 80 }}
                                  onClick={()=> {
                                    userAvatarRef.current.value=null;
                                    setPhoto(initialPhoto);
                                    setFileName(null);
                                  }}
                                >
                                  Reset
                                </div> */}
                                  <div
                                    className="custom-file-label form-control border-start-0 rounded-0 rounded-end text-white btn-primary"
                                    htmlFor="inputGroupFile01"
                                    style={{ width: 80 }}
                                    onClick={() => userAvatarRef.current.click()}
                                  >
                                    Browse
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="list-group-item">
                        <div className="form-group row align-items-center mb-0">
                          <label className="col-form-label form-label col-sm-3">
                            Ameritex profile name
                          </label>
                          <div className="col-sm-9">
                            <input
                              type="text"
                              className="form-control"
                              defaultValue=""
                              placeholder="Your profile name ..."
                            />

                          </div>
                        </div>
                        <div className="row justify-content-end">
                          <div className="mt-1 text-black-50 col-sm-9">
                            Your profile name will be used as part of your
                            public profile URL address.
                          </div>
                        </div>
                      </div>
                      <div className="list-group-item">
                        <div className="form-group row align-items-center mb-0">
                          <label className="col-form-label form-label col-sm-3">
                            About you
                          </label>
                          <div className="col-sm-9">
                            <textarea
                              rows="3"
                              className="form-control"
                              placeholder="About you ..."
                            ></textarea>
                          </div>
                        </div>
                      </div>
                      <div className="list-group-item">
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id="displayrealname"
                            disabled
                          />
                          <label
                            className="custom-control-label"
                            htmlFor="displayrealname"
                          >
                            Display your real name on your profile
                          </label>

                        </div>
                        <div className=" text-muted">
                          If unchecked, your profile name will be displayed
                          instead of your full name.
                        </div>
                      </div>
                      <div className="list-group-item">
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id="profilevisibility"
                            disabled
                          />
                          <label
                            className="custom-control-label"
                            htmlFor="profilevisibility"
                          >
                            Allow everyone to see your profile
                          </label>

                        </div>
                        <div className=" text-muted">
                          If unchecked, your profile will be private and no one
                          except you will be able to view it.
                        </div>
                      </div>
                    </div>
                  </CardBody>
                  <CardFooter>
                    <Button className="btn-primary float-right" onClick={uploadAvatar}>SAVE CHANGES</Button>
                  </CardFooter>
                </Card>

                <h3>Updates from Ameritex</h3>
                <Card>
                  <CardBody>
                    <div className="list-group list-group-form">
                      <div className="list-group-item">
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id="ameritexnews"
                            // defaultChecked
                            disabled
                          />
                          <label
                            className="custom-control-label"
                            htmlFor="ameritexnews"
                          >
                            Ameritex Newsletter
                          </label>

                        </div>
                        <div className=" text-muted">
                          Get the latest on company news.
                        </div>
                      </div>
                      <div className="list-group-item">
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id="newcontent"
                            // defaultChecked
                            disabled
                          />
                          <label
                            className="custom-control-label"
                            htmlFor="newcontent"
                          >
                            New Content Releases
                          </label>

                        </div>
                        <div className=" text-muted">
                          Send me an email when new courses or bonus content is
                          released.
                        </div>
                      </div>
                      <div className="list-group-item">
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id="featureupdated"
                            disabled
                          // defaultChecked
                          />
                          <label
                            className="custom-control-label"
                            htmlFor="featureupdated"
                          >
                            Product &amp; Feature Updates
                          </label>

                        </div>
                        <div className=" text-muted">
                          Be the first to know when we announce new features and
                          updates.
                        </div>
                      </div>
                      <div className="list-group-item">
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id="emailfromteam"
                            // defaultChecked
                            disabled
                          />
                          <label
                            className="custom-control-label"
                            htmlFor="emailfromteam"
                          >
                            Emails from Team Memebers
                          </label>

                        </div>
                        <div className=" text-muted">
                          Get messages, encouragement and helpful information
                          from your teachers.
                        </div>
                      </div>
                      <div className="list-group-item">
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id="contentsuggestions"
                            disabled
                          />
                          <label
                            className="custom-control-label"
                            htmlFor="contentsuggestions"
                          >
                            Content Suggestions
                          </label>

                        </div>
                        <div className=" text-muted">
                          Get daily content suggestions to keep you on track.
                        </div>
                      </div>
                    </div>
                  </CardBody>
                  <CardFooter>
                    <Button className="btn-primary float-right">SAVE CHANGES</Button>
                  </CardFooter>
                </Card>

                <h3>Change Password</h3>
                <Card>
                  <AvForm
                    // className="mt-2"
                    // ref={e => setFormRef(e)}
                    onValidSubmit={(e, v) => {
                      handleValidSubmit(e, v)
                    }}
                  >
                    <CardBody>
                      {/* <div className="alert alert-soft-warning">
                  <div className="d-flex flex-wrap align-items-center">
                    <div className="mr-8pt">
                      <i className="material-icons">check_circle</i>
                    </div>
                    <div className="flex" style="min-width: 180px">
                      <small className="text-100">
                        An email with password reset instructions has been sent
                        to your email address, if it exists on our system.
                      </small>
                    </div>
                  </div>
                </div> */}

                      <input type="hidden" name="id" value={user._id} />

                      <div className="list-group list-group-form">
                        <div className="list-group-item">
                          <div className="form-group row mb-0">
                            <label className="form-label col-form-label col-sm-3">
                              New password
                            </label>
                            <div className="col-sm-9">
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
                              />
                            </div>
                          </div>
                        </div>
                        <div className="list-group-item">
                          <div className=" form-group row mb-0">
                            <label className="form-label col-form-label col-sm-3">
                              Confirm password
                            </label>
                            <div className="col-sm-9">
                              <AvField
                                name="confirmPassword"
                                label="Confirm Password"
                                type="password"
                                id="confirm_password"
                                validate={
                                  {
                                    required: { value: true, errorMessage: 'Please confirm your password' },
                                    match: { value: 'password', errorMessage: 'Password did not match' }
                                  }
                                }
                                placeholder="Confirm Password"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                    <CardFooter>
                      <button
                        className="btn btn-primary w-md waves-effect waves-light"
                        type="submit"
                      >
                        Submit
                      </button>
                    </CardFooter>
                  </AvForm>
                </Card>
              </div>
            }
          </div>
        </Container>
      </div>
    </React.Fragment>
  )
}

UserProfile.propTypes = {
  editProfile: PropTypes.func,
  error: PropTypes.any,
  success: PropTypes.any,
}

const mapStatetoProps = state => {
  const { error, success } = state.Profile
  const authUser = state.Login.user
  return { error, success, authUser }
}

export default withRouter(
  connect(
    mapStatetoProps,
    {
      editProfile,
      resetProfileFlag,
      updateProfile,
      updateAvatar,
      setUserProfile
    })(UserProfile)
)
