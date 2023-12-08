import {useState, createContext, useContext, useCallback} from "react"
import { useNotification, notification_types } from "./notification.jsx"

const timerUserContext = createContext()
export const useTimerUser = () => useContext(timerUserContext)

export const TimerUserProvider = (props) => {
	const [timerUser, setTimerUser] = useState({}) //{tid:{uid, profile}}
	const {pushNotification} = useNotification()
	const attatchTimerUser = (msg) => {
		let items = msg.TIMER_ATTATCH
		for (var i in items) {
			pushNotification ({
				type: notification_types.NOTIFICATION_TYPE_TIMER_ATTATCH,
				city:	msg.city,
				time: msg.time,
				content: (items[i].profile.firstName) + ' started a Timer in '+msg.city
			})
		}
		setTimerUser (msg.TIMER_USER)
	}

	const detatchTimerUser = (msg) => {
		let items = msg.TIMER_DETATCH
		for (var i in items) {
			pushNotification ({
				type: notification_types.NOTIFICATION_TYPE_TIMER_DETATCH,
				city:	msg.city,
				time: msg.time,
				content: (items[i].profile.firstName) + ' ended a Timer in '+msg.city
			})
		}
		setTimerUser (msg.TIMER_USER)
	}

	const isAvail = (city, tid, uid) => {
		if (!timerUser[city]) return true
		else if (!timerUser[city][tid]) return true;
		else if (timerUser[city][tid].uid === uid) return true;
		else return false;
	}

	const timerRequest = (req) => { // {uid, tid, }
		let t = isAvail (req.city, req.tid, req.uid)
		// console.log ("TIMER: Request to timer", req, t)
		return t;
	}

	const [timerValue, setTimerValue] = useState({}) //{city:{tid:{status, time}}}
	
	const getTimerValueCtx = useCallback((city, tid) => {
		if (!timerValue[city]) return null
		else if (!timerValue[city][tid]) return null
		else return timerValue[city][tid]
	},[timerValue])

	const setTimerValueCtx = (city, tid, status, time, ctx) => {
		// if (!time || time == NaN) return
		if (!time || isNaN(time)) return;

		let newTimerValue = {...timerValue}
		if (!newTimerValue[city]) newTimerValue[city] = {}
		newTimerValue[city][tid] = {status, time, ...ctx}
		setTimerValue (newTimerValue)
	}

	const [productionTime, setProdTime] = useState ({}) //{city:{productionTime, start}}

	const setProductionTime = (city, t, start) => {
		console.log ("TIMER: Set production time", city, t, start)
		// if (!city || !t || t == NaN) return
		if (!city || !t || isNaN(t)) return;
		setProdTime (prev=>{
			let newState = {...prev}
			newState[city] = {productionTime:t, start}
			console.log ("TIMER: Set production time", newState)
			return newState
		})
	}

	const getProductionTime = useCallback((city) => {
		if (!productionTime[city]) return null
		else return productionTime[city]
	},[productionTime])

	return (
		<timerUserContext.Provider value={{
			TIMER_USER:timerUser, 
			attatchTimerUser, 
			detatchTimerUser, 
			setTimerUser,
			timerRequest, 
			isUserCanTimer: isAvail,
			getTimerValueCtx,
			setTimerValueCtx,
			getProductionTime,
			setProductionTime,
			productionTime,
			TIMER_TICK_UNIT: 1000,
		}}>{props.children}</timerUserContext.Provider>
	)
}
