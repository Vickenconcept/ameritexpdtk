import { useEffect, useState, useContext, createContext } from "react"
import { socket, event_source } from "../helpers/axiosConfig"

const NetStatus = createContext({ isOnline: true })

export const useNetStatus = () => useContext(NetStatus)
import { useTimerUser } from "./timer"

export const NetStatusProvider = (props) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isManualOffline, setIsManualOffline] = useState(false);
  const { TIMER_USER, attatchTimerUser, detatchTimerUser, timerRequest, isUserCanTimer, setTimerUser } = useTimerUser()

  useEffect(() => {
    if (!isOnline) socket.disconnect()
    else socket.connect()
  }, [isOnline])

  useEffect(() => {
    const onTimerUpdate = (id = [-1]) => {
      console.log("-id", id[0])
      refreshTimer(id, city)
    }

    const onTimerAttachMsg = (msg) => {
      // console.log ("onTimerAttachMsg", msg)
      attatchTimerUser(msg)
    }

    const onTimerDetachMsg = (msg) => {
      // console.log ("onTimerDetachMsg", msg)
      detatchTimerUser(msg)
    }

    const onTimerUser = (msg) => {
      setTimerUser(msg)
    }

    socket.connect()

    socket.on("connect", () => {
      console.log("--SOCKET connected")
      socket.on("TIMER_ATTATCH", onTimerAttachMsg)
      socket.on("TIMER_DETATCH", onTimerDetachMsg)
      socket.on("TIMER_USER", onTimerUser)
    })
    socket.on("disconnect", () => {
      console.log("--SOCKET disconnected")
    })

    return () => {
      // console.log("------------------------------", timers)
      console.log("Unload")
      socket.disconnect()
      socket.off("connect")
      socket.off("disconnect")
      socket.off("timerUpdated")
      socket.off("TIMER_ATTATCH")
      socket.off("TIMER_DETATCH")
    }
  }, [])

  useEffect(() => {
    // Update network status
    const handleStatusChange = () => {
      let on = navigator.onLine && !isManualOffline;
      setIsOnline(on);
      console.log("Network status: " + on)
    };

    // Listen to the online status
    window.addEventListener('online', handleStatusChange);

    // Listen to the offline status
    window.addEventListener('offline', handleStatusChange);

    handleStatusChange()
    // Specify how to clean up after this effect for performance improvment
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };

  }, [isManualOffline]);

  return (
    <NetStatus.Provider value={{ isOnline, setIsOnline, isManualOffline, setIsManualOffline }} >
      {props.children}
    </NetStatus.Provider>
  )

}
