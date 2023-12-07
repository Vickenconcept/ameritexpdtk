import { useState, useContext, useEffect, useCallback } from "react"
import PropTypes from "prop-types"

import {connect} from "react-redux"
import { Link, useHistory, withRouter } from "react-router-dom"

import { Row, Col, CardBody, Card, Alert, Container, Label } from "reactstrap"

import { loginUser, apiError } from "../../../store/actions"

import {setLockStatues} from "../../../store/auth/login/actions"
import Logo from "../../../assets/images/logo-dark.png"
import sampleAvatar from "../../../assets/images/person.svg"

import {lockingTime} from "helpers/globals"

import {
    getProfile,
    postFakeLogin,
    postJwtLogin,
    offlineLogin,
    postSocialLogin,
    updateProfileRequest,
} from "helpers/fakebackend_helper"
import { avatar2url } from "../../../helpers/functions"
import {useNetStatus} from "../../../context/net"
import Copyright from "./Copyright"

const Lock = (props) => {
    const {locked, user} = props
    const {isOnline} = useNetStatus()
    const [data, setData] = useState({ email: user.email, password: "", offline:  !isOnline})
    const [available, setAvailable] = useState(false)
    const [overtime, setOverTime] = useState (1)
    const [startTime, setStartTime] = useState(1)
    const history = useHistory()

    const [error, setError] = useState(null)

    const limit = lockingTime.logout

    const onChangeField = (e, field) => {
        const _data = {
          ...data,
          [field]: e.target.value,
        }
        setAvailable(_data.password)
        setData(_data)
        setError(null)
    }

    useEffect (()=>{
        onChangeField({target: {value: (!isOnline)}}, "offline")
    }, [isOnline])

    const login = async () => {
        try {
            let response = null;
            if (isOnline)
                response = await postJwtLogin( data )
            else
                response = await offlineLogin (data)
            if (response.status != 200 && response.status != 201) {
                if (response.data?.msg)
                    return setError (response.data.msg)
                return setError("Wrong Password")
            }
            props.setLockStatues(false)
        } catch (error) {
            setError (error.toString())
        }
    }

    const logout = () => {
        history.push ('/logout')
    }

    const getTimeText = (seconds) => {

        seconds = limit - seconds;

        let hh = Math.floor(seconds / 3600);
        seconds -= hh*3600;
        let mm = Math.floor(seconds / 60);
        let ss = seconds % 60;
        hh = hh < 10 ? "0" + hh : hh;
        mm = mm < 10 ? "0" + mm : mm;
        ss = ss < 10 ? "0" + ss : ss;
        
        return hh+":"+mm+":"+ss;
    }

    function timerFunc () {
        setOverTime ((prevOvertime) => {
            if (overtime - startTime >= limit){
                clearInterval (timer)
            }
            return Math.ceil(new Date().getTime() / 1000)
        })
    }

    function handleBeforeUnload(event) {
        event.preventDefault();
        event.returnValue = '';
        if(locked) localStorage.setItem ('statues','locked')
    } 

    let timer = null;

    useEffect (()=>{
        if (overtime - startTime >= limit) {
            clearInterval (timer)
            logout()
        }
    },[overtime])

    useEffect(()=>{
        function resetTimer () {
            clearInterval (timer)
            setStartTime(Math.ceil(new Date().getTime() / 1000))
            setOverTime (Math.ceil(new Date().getTime() / 1000))
            timer = setInterval (timerFunc, 1000)
        }
        setData ({
            email: user.email,
            password: ""
        })
        if (locked) {
            localStorage.setItem ('statues','locked')
            resetTimer ()
            window.addEventListener('beforeunload', handleBeforeUnload);
        }
        else {
            localStorage.setItem ('statues','on')
            setStartTime(0)
            setOverTime (0)
            clearInterval (timer)
            window.removeEventListener('beforeunload', handleBeforeUnload);
        }
        return () => {
            clearInterval (timer)
            window.removeEventListener('beforeunload', handleBeforeUnload);
            setData ({
                email: user.email,
                password: ""
            })
        }
    },[locked])

    return (
        <div
        className="d-flex flex-column bg-white sm-vw-100 signin-container"
        style={{ height: "100vh", overflow: "auto" }}
        >
        <div className="d-flex flex-column h-100 signin-form">
            <div
            className="d-flex justify-content-center align-items-center mt-5 flex-column logo-container"
            style={{ height: 200 }}
            >
                <img src={Logo} className="w-75" />
                <h5 className="mt-3">Screen Locked</h5>
                <h6>Hello {user.firstName}, enter your password to unlock the screen</h6>
            </div>

            <div className="d-flex justify-content-between align-items-center">
                <div
                className="d-flex flex-column justify-content-center h-100 signin-form w-100"
                >
                {error && error && error != "Error: Request failed with status code 403" ? (
                    <Alert color="danger">{error}</Alert>
                ) : ""}

                {!isOnline &&
                <Alert color="warning">
                    It's offline state now. <br/>
                    Please check the network status. <br/>
                    Or if you logged in once in 6 hours, you can log in with that user for offline working. 
                </Alert>
                }

                <div className="d-flex flex-column justify-content-center align-items-center w-full">
                    <div className="pt-3 text-center">
                      <img
                        src={avatar2url(props.user?.avatar) || sampleAvatar}
                        className="rounded-circle img-thumbnail avatar-lg"
                        alt="thumbnail"
                      />
                      <h6 className="font-size-16 mt-3">
                        {props.user.firstName} {' '} {props.user.lastName}
                      </h6>
                    </div>
                </div>


                <div className="mt-3">
                    <label>Password</label>
                    <input
                    className="form-control"
                    type="password"
                    placeholder="Enter Password"
                    onChange={e => onChangeField(e, "password")}
                    value={data.password || ""}
                    autoComplete={"false"}
                    />
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="form-check mt-3">
                    
                    </div>

                    <div>
                    <button
                        className="btn btn-primary"
                        disabled={!available}
                        onClick={login}
                    >
                        Unlock
                    </button>
                    </div>
                </div>
                <h3 className="mt-3 text-center">
                    Logging out in
                </h3>
                <h6 className="mt-1 text-center" style={{fontSize:"40px"}}>
                    {getTimeText(overtime - startTime)}
                </h6>
                {/* {isOnline&& */}
                <div className="mt-5 text-center">
                    <p>
                    Not you ? {" "}
                    <Link
                        to="/logout"
                        className="fw-medium text-primary"
                    >
                        {" "}
                        Logout{" "}
                    </Link>{" "}
                    </p>
                </div>
                {/*  } */}
                <Copyright />
            </div>
        </div>

      </div>
    </div>
    )
}

const mapStatetoProps = state => {
  const { error, success } = state.Profile
  const user = state.Login.user
  const locked = state.Login.locked
  return { error, success, user, locked }
}

export default withRouter(connect(mapStatetoProps,{setLockStatues})(Lock))
