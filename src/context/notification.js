import {useState, useContext, createContext} from "react"
import useArray from "react-use-array"

const NotificationContext = createContext()
export const useNotification = () => useContext(NotificationContext)

export const NotificationProvider = (props) => {

  const [ notification, {
    set, empty, replace, push,
    updateAt, setAt, removeAt,
    filter, map, sort, reverse,
    mergeBefore, mergeAfter,
  }] = useArray([]);
  // const [notification, setNotification] = useState([])
  const pushNotification = async (not) => {
    // {type, content, link}
    console.log ('NOTI: push', not)
    // setNotification([
    //   not,
    //   ...notification
    // ])
    // await reverse()
    await push (not)
    // await reverse()
  }

  const removeNotification = (idx) => {
    console.log ('NOTI: remove', idx)
    // const not = [...notification]
    // not.splice(idx, 1)
    // setNotification([
    //   ...not
    // ])
    removeAt(idx)
  }

  const clearNotification = () => {
    console.log ('NOTI: clear')
    // setNotification([])
    empty()
  }

  return (
    <NotificationContext.Provider value={{
      pushNotification,
      removeNotification,
      clearNotification,
      notification,
    }}>{props.children}</NotificationContext.Provider>
  )
}

export const notification_types = {
  NOTIFICATION_TYPE_TIMER_ATTATCH: 'NOTIFICATION_TYPE_TIMER_ATTATCH',
  NOTIFICATION_TYPE_TIMER_DETATCH: 'NOTIFICATION_TYPE_TIMER_DETATCH',
}