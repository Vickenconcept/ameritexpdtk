import { call, put, takeEvery, takeLatest } from "redux-saga/effects"

// Login Redux States
import { 
  LOGIN_USER, 
  LOGOUT_USER, 
  UPDATE_PROFILE, 
  USER_PROFILE, 
  GET_PROFILE_SUCCESS, 
  API_ERROR,
  SET_LOCK_STATUES
} from "./actionTypes"

import { 
    apiError, 
    getProfileSuccess, 
    loginSuccess, 
    logoutUserSuccess, 
    updateProfileSuccess, 
    updateAvatar ,
    setLockStatues
  } from "./actions"

//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper"
import {
  getProfile,
  postFakeLogin,
  postJwtLogin,
  postSocialLogin,
  updateProfileRequest,
  setToken,
  setAuthUser,
  getToken,
  getJWTUser,
  offlineLogin,
} from "../../../helpers/fakebackend_helper"
import jwt from 'jwt-decode'
import { setAxiosConfig } from "./helpers/axiosConfig"

const fireBaseBackend = getFirebaseBackend()

function* loginUser({ payload: { user, history } }) {
  try {
    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const response = yield call(
        fireBaseBackend.loginUser,
        user.email,
        user.password
      )
      yield put(loginSuccess(response))
    } else if (process.env.REACT_APP_DEFAULTAUTH === "jwt") {
      let response = null;
      if (user.offline) {
        response = yield call(offlineLogin, {
          email: user.email,
          password: user.password,
        })
      } else {
        response = yield call(postJwtLogin, {
          email: user.email,
          password: user.password,
        })
      }

      console.log ("Login result for " + user.offline?"offline":"online" +" mode ", response)

      if (response.status != 200 && response.status != 201) throw response.data.msg

      setToken(response.data.accessToken)
      setAxiosConfig()
      // const authUser = jwt(response.data.accessToken)
      var authUser = jwt(response.data.accessToken)
      if (authUser.avatar=='') authUser.avatar = null;
      setAuthUser(JSON.stringify(authUser))
      yield put(setLockStatues(false))
      yield put(loginSuccess(authUser))
    } else if (process.env.REACT_APP_DEFAULTAUTH === "fake") {
      const response = yield call(postFakeLogin, {
        email: user.email,
        password: user.password,
      })
      setAuthUser(JSON.stringify(response))
      yield put(setLockStatues(false))
      yield put(loginSuccess(response))
    }
    history.push("/profile-home")
  } catch (error) {
    yield put(apiError(error))
  }
}

function* logoutUser({ payload: { history, offline } }) {
  try {
    setAuthUser(null)
    if (!offline) setToken(null)
    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const response = yield call(fireBaseBackend.logout)
      yield put(logoutUserSuccess(response))
    }
    history.push("/")
  } catch (error) {
    yield put(apiError(error))
  }
}

function* setUserProfile({ payload: { user } }) {
  try {
    let response = null
    if (user.offline) {
      response = {
        user: getJWTUser(),
      }
    } else {
      response = yield call(getProfile)
    }
    const lock = localStorage.getItem('statues') == 'locked'
    yield put(loginSuccess(response.user))
    yield put(setLockStatues(lock))
  } catch (error) {
    yield put(apiError(error))
  }
}

function *updateProfile({ payload: { updates } }) {
  try {
    const response = yield call(updateProfileRequest, updates)
    console.log (response)
    if (response.success && response.me)
      yield put(updateProfileSuccess( response.user ))
  } catch (err) {
    console.log (error)
  }
}

function *saveProfile({payload:{user}}) {
  try {
    setAuthUser(JSON.stringify(user))
  } catch (err) {
    setToken(null)
    console.log ('Token removed',err)
    history.push ('/logout')
  }
}

// function *onGetError({payload:{error}}) {
  
// }

function *onLock({payload:{statues}}) {
  console.log ('Lock saga', statues)
  localStorage.setItem("statues", statues?"locked":"on")
}

function* authSaga() {
  yield takeEvery(LOGIN_USER, loginUser)
  yield takeEvery(LOGOUT_USER, logoutUser)
  yield takeEvery(USER_PROFILE, setUserProfile)
  yield takeEvery(UPDATE_PROFILE, updateProfile)
  yield takeEvery(GET_PROFILE_SUCCESS, saveProfile)
  // yield takeEvery(API_ERROR, onGetError)
  yield takeEvery(SET_LOCK_STATUES, onLock)
}

export default authSaga
