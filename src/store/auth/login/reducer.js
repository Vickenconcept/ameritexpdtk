import {
  LOGIN_USER,
  LOGIN_SUCCESS,
  LOGOUT_USER,
  LOGOUT_USER_SUCCESS,
  API_ERROR,
  USER_PROFILE,
  GET_PROFILE_SUCCESS,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_AVATAR,
  SET_LOCK_STATUES
} from "./actionTypes"

const initialState = {
  error: "",
  loading: true,
  loggedIn: false,
  locked: false,
  user: null
}

const login = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOCK_STATUES:
      state = {
        ...state,
        locked: action.payload.statues
      }
      break
    case LOGIN_USER:
      state = {
        ...state,
        loading: true,
        locked: false,
      }
      break
    case GET_PROFILE_SUCCESS:
      state = {
        ...state,
        user: action.payload.user,
        loggedIn: false
      }
      break
    case UPDATE_AVATAR:
      state = {
        ...state,
        user: {
          ...state.user,
          avatar: action.payload
        }
      }
      break;
    case LOGIN_SUCCESS:
      state = {
        ...state,
        user: action.payload,
        loading: false,
        loggedIn: true,
        // locked: false,
      }
      break
    case UPDATE_PROFILE_SUCCESS:
      state = {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      }
      break;
    case LOGOUT_USER:
      state = { ...state,
        loggedIn: false
      }
      break
    case LOGOUT_USER_SUCCESS:
      state = { ...state }
      break
    case API_ERROR:
      state = { ...state, error: action.payload, loading: false }
      break
    default:
      state = { ...state }
      break
  }
  return state
}

export default login
