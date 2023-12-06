import axios from "axios"
import { post, del, get, put } from "./api_helper"
import * as url from "./url_helper"
import jwt from 'jwt-decode'
const bcrypt = require("bcryptjs");

// Gets the logged in user data from local session
// const getLoggedInUser = () => {
//   const user = localStorage.getItem("user")
//   if (user) return JSON.parse(user)
//   return null
// }

const getToken = () => {
  const token = localStorage.getItem("token")
  if (token) return token
  return null
}

const getAuthUser = () => {
  const authUser = localStorage.getItem("authUser")
  if (authUser) return JSON.parse(authUser)
  return null
}

const setAuthUser = (authUser) => {
  if (!authUser || authUser == "") return localStorage.removeItem("authUser")
  else return localStorage.setItem("authUser", JSON.stringify(authUser))
}

const setToken = (token) => {
  if (!token || token == "") return localStorage.removeItem("token")
  else return localStorage.setItem("token", token)
}

const decodeJWT = (token) => {
  return jwt(token)
}

const getJWTUser = () => {
  const token = getToken()
  if (token) return decodeJWT(token)
  return null
}

//check if user is authenticated
const isUserAuthenticated = () => {
  const user = getJWTUser()
  if (!user) return false
  return true
}

// Register Method
const postFakeRegister = (data) => post(url.POST_FAKE_REGISTER, data)

// Login Method
const postFakeLogin = data => post(url.POST_FAKE_LOGIN, data)

// postForgetPwd
const postFakeForgetPwd = data => post(url.POST_FAKE_PASSWORD_FORGET, data)

// Edit profile
const postJwtProfile = data => post(url.POST_EDIT_JWT_PROFILE, data)

const postFakeProfile = data => post(url.POST_EDIT_PROFILE, data)

// Register Method
const postJwtRegister = (url, data) => {
  return axios
    .post(url, data)
    .then(response => response)
    .catch(err => err.response)
}

// Login Method
const postJwtLogin = data => post(url.POST_FAKE_JWT_LOGIN, data)

// postForgetPwd
const postJwtForgetPwd = data => post(url.POST_FAKE_JWT_PASSWORD_FORGET, data)

// get Events
export const getEvents = () => get(url.GET_EVENTS)

export const getProfile = () => get("/auth/get-profile")

export const updateProfileRequest = (updates) => post("/auth/update-profile", { id:updates.id, updates:{...updates, id:undefined} }).then(res=>res.data).catch(err=>err.response.data)

// add Events
export const addNewEvent = event => post(url.ADD_NEW_EVENT, event)

// update Event
export const updateEvent = event => put(url.UPDATE_EVENT, event)

// delete Event
export const deleteEvent = event =>
  del(url.DELETE_EVENT, { headers: { event } })

// get Categories
export const getCategories = () => get(url.GET_CATEGORIES)

export const offlineLogin = async (data) => {
  const user = getJWTUser()
  const token = getToken()
  if (user) {
    if (user.email === data.email) {
      if (!user.password || user.password == '')
        return {
          status: 400,
          data: {
            msg: "Invalid Password"
          }
        }
      const isPasswordValid = await bcrypt.compareSync(data.password, user.password)
      if (isPasswordValid) {
        return {
          status: 200,
          data: {
            accessToken: token,
            refreshToken: token,
          }
        }
      } else {
        return {
          status: 400,
          data: {
            msg: "Invalid Password"
          }
        }
      }
    } else {
      return {
        status: 400,
        data: {
          msg: "Invalid Email"
        }
      }
    }
  } else {
    return {
      status: 400,
      data: {
        msg: "User not found"
      }
    }
  }
}

export {
  getAuthUser,
  isUserAuthenticated,
  postFakeRegister,
  postFakeLogin,
  postFakeProfile,
  postFakeForgetPwd,
  postJwtRegister,
  postJwtLogin,
  postJwtForgetPwd,
  postJwtProfile,
  setToken,
  setAuthUser,
  getJWTUser,
}
