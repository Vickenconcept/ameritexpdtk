import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { machineClasses, classifyCategory, mc2factory, mc2category, factory2mc } from '../../../../helpers/globals';
import { getProducts, deleteProductAction, refreshTimerAction, updateTimerAction } from '../../../../actions/timer';
import { useNetStatus } from '../../../../context/net';
import { socket, event_source } from "../../../../helpers/axiosConfig"
import { useLoading } from '../../../../context/loading';

const TimerContext = createContext();
export default TimerContext;

export const useTimerContext = () => useContext(TimerContext);

export const TimerProvider = ({
    children,
    city,
    selectedFactories,
    timers, setTimers
}) => {

    const { loading, setLoading } = useLoading()

    const [canOperate, setCanOperate] = useState(true)

    const [parts, setParts] = useState({})

    const [partsLoading, setPartsLoading] = useState({})
    const [partsLoaded, setPartsLoaded] = useState({})

    const { isOnline } = useNetStatus()

    const classifyTimer = useMemo(() => {
        if (!timers || timers.length == 0) return {}
        let _result = {}
        timers.map((timer, index) => {
            const machineClass = timer.machine[0] ? timer.machine[0].machineClass : timer.machine.machineClass
            const category = mc2category(machineClass)
            if (!_result[category]) _result[category] = []
            _result[category].push(timer)
            return _result
        })
        return _result
    }, [timers])

    const refreshTimer = async (ids, p_city, needLoading = true) => {
        if (needLoading)
            setLoading(true)
        let _timers = [...timers]
        for (const id of ids) {
            const timer = await refreshTimerAction(id, p_city, isOnline)
            if (p_city != city) continue
            timer.machine = [timer.machine]
            timer.part = [timer.part]
            _timers = _timers.map(t => (t._id == timer._id ? timer : t))
            if (_timers.find(t => t._id == timer._id) == undefined)
                _timers.push(timer)
        }
        setTimers(_timers)
        if (needLoading)
            setLoading(false)
    }

    useEffect(() => {
        const onTimerUpdate = (msg) => {
            let { ids } = msg
            console.log("signal: timer updated with id:", city, ids)
            refreshTimer(ids, msg.city, false)
        }

        socket.on("timerUpdated", onTimerUpdate)
        console.log("TIMERUPDATEON")
        return () => {
            console.log("TIMERUPDATEOFF")
            socket.off("timerUpdated")
        }
    }, [isOnline, timers])

    const deleteTimer = async id => {
        await deleteProductAction("Timer", id)
        const _timers = timers.filter(item => {
            return item._id != id
        })
        setTimers(_timers)
    }

    const startTimer = (idx, now) => {
        let _timers = timers.map((t, index) => {
            return idx != index
                ? t
                : {
                    ...t,
                    times: [
                        ...t.time,
                        {
                            startTime: now,
                            endTime: undefined,
                        },
                    ],
                    status: "Started",
                }
        })
        setTimers(_timers)
    }

    const stopTimer = (idx, now) => {
        let _timers = timers.map((t, index) => {
            let times = [...t.times]
            if (times.length) times[times.length - 1].endTime = now
            return idx != index
                ? t
                : {
                    ...t,
                    times,
                    status: "Pending",
                }
        })
        setTimers(_timers)
    }

    const getMCParts = async (mc) => {
        console.log('loading mc parts of ' + mc + '...' + city + ' ' + isOnline)
        setPartsLoading(partsLoading => ({ ...partsLoading, [mc]: true }))
        try {
            const _parts = await getProducts(
                "Part",
                -1,
                {
                    city: city,
                    machineClass: mc,
                },
                isOnline
            )
            setParts(parts => ({ ...parts, [mc]: _parts.products }))
            setPartsLoaded(partsLoaded => ({ ...partsLoaded, [mc]: true }))
        } catch (err) {
            console.log('!!! error on loading mc parts of ' + mc, err)
            setPartsLoaded(partsLoaded => ({ ...partsLoaded, [mc]: false }))
        } finally {
            console.log('!!! success on loading mc parts of ' + mc)
            setPartsLoading(partsLoading => ({ ...partsLoading, [mc]: false }))
        }
    }

    const getFactoryParts = async (f) => {
        if (!f || f == "Not Assigned") return true
        let mcs = factory2mc(f)
        if (!mcs) return true
        await Promise.all(mcs.map(async mc => {
            if (partsLoaded[mc] || partsLoading[mc]) return true
            else await getMCParts(mc)
        }));
    }

    const getParts = async () => {
        await Promise.all(selectedFactories.map(async (f, idx) => {
            if (f) await getFactoryParts(f)
        }))
    }

    useEffect(() => {
        if (city) {
            console.log('parts loading effect for city')
            setParts({})
            setPartsLoaded({})
            setPartsLoading({})
            getParts()
        }
    }, [city])

    useEffect(() => {
        console.log('parts loading effect for factories')
        getParts()
    }, [selectedFactories])

    const finedParts = useMemo(() => {
        if (!parts) return {}
        let _parts = {}
        machineClasses?.forEach(mc => {
            if (!parts[mc]) _parts[mc] = []
            else _parts[mc] = parts[mc]
        })
        return _parts
    }, [parts])

    const [machines, setMachines] = useState([])
    const [machinesLoading, setMachinesLoading] = useState(false)

    const getMachines = () => {
        setMachines([])
        setMachinesLoading(true)
        getProducts(
            "Machine",
            -1,
            {
                city: city,
            },
            isOnline
        )
            .then(res => {
                setMachines(res.products)
                setMachinesLoading(false)
            })
            .catch(e => {
                setMachinesLoading(false)
            })
    }

    useEffect(() => {
        getMachines()
    }, [
        city,
    ])

    const state = {
        classifyTimer, timers, setTimers, startTimer, stopTimer, deleteTimer, refreshTimer,
        canOperate, setCanOperate,
        selectedFactories,
        parts, finedParts, partsLoading, partsLoaded,
        machines, machinesLoading,
    }

    return (
        <TimerContext.Provider value={state}>
            {children}
        </TimerContext.Provider>
    );
}