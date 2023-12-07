import { useState, useEffect, createContext, useMemo, useContext } from "react";
import { useNetStatus } from "./net";
import { cities } from "../helpers/globals";
import { initDB, insertData, putData, clearStore, getStoreData } from "../helpers/offlineDB";

import { getProducts, getTimerLogsOfMachine, uploadMigrationData, getLastUpdated, getLocalLastUpdated } from "../../../../actions/timer";
import { getJobsForMP } from "actions/job";

const LocalDBContext = createContext();

export const useLocalDB = () => useContext(LocalDBContext);

export const LocalDBProvider = (props) => {
    const {user, userLoading} = props
    const { isOnline } = useNetStatus();
    const [localDBStatus, setLocalDBStatus] = useState(null);
    const [isDBLoading, setIsDBLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const isDBReady = useMemo(() => {
        if (localDBStatus) {
            let tmpCities = []
            if (user.role === "Admin") 
                tmpCities = cities;
            else if (cities.indexOf(user.location) !== -1) 
                tmpCities = [user.location];
            for (let i = 0; i < tmpCities.length; i++) {
                if (!localDBStatus[tmpCities[i]]) {
                    return false;
                }
            }
            return true && !isDBLoading;
        }
        return false;
    },[localDBStatus, isDBLoading])

    const dbStatus = useMemo(() => {
        if (isOnline && isDBReady) return "Synced"
        if (!isOnline && isDBReady) return "Ready"
        if (!isOnline) return "Error"
        if (uploading) return "Uploading"
        if (downloading) return "Downloading"
        if (isDBLoading) return "Loading"
        // console.log ("error", {
        //     isDBLoading, isDBReady, isOnline, uploading, downloading
        // })
        return "Error"
    },[isDBLoading, isDBReady, isOnline, uploading, downloading])

    const fillStore = async (city, type, params) => {
        try {
            const lastUpdated = await getLastUpdated(type, city);
            const localLastUpdated = await getLocalLastUpdated(type, city);
            if (lastUpdated === localLastUpdated) {
                if (type === 'Timer') {
                    const timers = await getStoreData (city, type);
                    if (timers && timers.length > 0) {
                        return {mids: timers.map (timer => timer.machine[0]?._id), pids: timers.map (timer => timer.part[0]?._id)};
                    }
                    return {mids:[], pids:[]};
                }
            }
            else {
                console.log ("there are some changes on backend", city, type, lastUpdated, localLastUpdated)
            }
        } catch (error) {
            console.log('Error:', error);
        }

        await clearStore(city, type);

        let res = { products: [] };

        let mids = []
        let pids = []

        if (type === 'Job') {
            res = await getJobsForMP(city, params.mids, params.pids);
        } else if (type !== 'TimerLog') {
            res = await getProducts(type, -1, { city });
        } else {
            res = await getTimerLogsOfMachine(0, 0, undefined, undefined, -1, true, 0, city, undefined, '');
        }

        const products = res.products || res.jobs || res.logs;

        if (!Array.isArray(products)) {
            return null;
        }

        await Promise.all(
            products.map(async (product) => {
            if (type === 'Timer') {
                let mid = product.machine[0]._id
                let pid = product.part[0]._id
                if (!mids.includes(mid)) {
                    mids.push(mid)
                }
                if (!pids.includes(pid)) {
                    pids.push(pid)
                }
            }
            const putRes = await putData(city, type, product);
            if (!putRes) {
                console.log('Error in putData', putRes);
            }
            })
        );

        if (type === 'Timer') {
            return {mids, pids}
        }
        return true;
    };


    const mgr2local = async (city) => {
        setDownloading (true)
        try {
            console.log ('mgr2local', city)
            let {mids, pids} = await fillStore (city, "Timer")
            if (mids?.length && pids?.length)
                await fillStore (city, "Job", {mids, pids})
            else {
                "No reading jobs because there are no updated timers"
            }
            await fillStore (city, "TimerLog")
            // await fillStore (city, "Part")
            // await fillStore (city, "Machine")
        } catch (err) {
            console.log (err)
        } finally {
            setDownloading (false)
        }
    }

    const mgrStore = async (city, type) => {
        const res = await getStoreData(city, type)
        if (res.length) {
            let data = []
            for (let i = 0; i < res.length; i++) {
                if (res[i].mgr)
                    data.push(res[i])
            }
            try {
                if (data.length){
                    console.log ('Migrating data '+data.length)
                    let pRes = await uploadMigrationData(city, type, data)
                }
            } catch (err) {
                console.log (err)
            } finally {
                return true;
            }
        } else {
            return false;
        }
    }

    const mgr2server = async (city) => {
        setUploading (true)
        await mgrStore (city, "Timer")
        await mgrStore (city, "TimerLog")
        setUploading (false)
    }

    const initDBs = async () => {
        if (!isOnline) return false;
        setLocalDBStatus(null);
        let tmpCities = []
        if (user.role === "Admin") 
            tmpCities = cities;
        else if (cities.indexOf(user.location) !== -1) 
            tmpCities = [user.location];
        try {
            for (let i =0; i < tmpCities.length; i++) {
                const status = await initDB(tmpCities[i])
                if (!status) continue;
                await mgr2server (tmpCities[i])
                await mgr2local (tmpCities[i])
                setLocalDBStatus(prev=>{
                    return {...prev, [tmpCities[i]]: status}
                })
            }
        } catch (e) {
            console.log (e)
        }
        return;
    }

    useEffect(async () => {
        if (!userLoading && isOnline && user && user.role !== "Sales" && user.role !== "HR" && user.role !== "Corporate") {
            setIsDBLoading(true);
            try {
                await initDBs();
            } catch (e) {
                console.log (e)
            }
            setIsDBLoading(false);
        }
    }, [isOnline, user, userLoading]);

    useEffect (() => {
        console.log ("isDBReady:", isDBReady)
    },[isDBReady])

    return (
        <LocalDBContext.Provider value={{
            localDBStatus,
            isDBLoading,
            isDBReady,
            dbStatus,
            initDBs,
        }}>
            {props.children}
        </LocalDBContext.Provider>
    )
}
