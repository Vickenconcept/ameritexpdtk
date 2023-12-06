import axios from "axios"
import { extractFormData, getCurrentTime } from "helpers/functions"
// import { addLocalProducts, getLocalProducts } from "helpers/indexedDB"
import {
  getStoreData,
  updateData,
  getStoreItem,
  putData,
  putDataArr,
  insertData,
  getLastUpdatedData,
} from "helpers/offlineDB"

export const createMachineAction = async (form, cb) => {
  const res = await axios.post("/timer/create-machine", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: progressEvent => {
      cb(progressEvent)
    },
  })
  return res.data
}

export const createPartAction = async (form, cb) => {
  const res = await axios.post("/timer/create-part", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: progressEvent => {
      cb(progressEvent)
    },
  })
  return res.data
}
export const getLastUpdated = async (type, city = "Seguin") => {
  const res = await axios.get("/timer/getLastUpdated", {
    params: { city, type },
  })
  // console.log("get latest update result:", city, type , res.data.lastUpdated)
  return res.data.lastUpdated
}
export const getLocalLastUpdated = async (type, city = "Seguin") => {
  return await getLastUpdatedData(city, type)
}
export const getProducts = async (type, page = 1, filters, isOnline = true) => {
  if (isOnline) {
    const res = await axios.post("/timer/get-products", { type, page, filters })
    putDataArr(filters.city, type, res.data.products)
    return res.data
  } else {
    return await getLocalProducts(type, page, filters)
  }
}

export const getLocalProducts = async (type, page = 1, filters) => {
  const products_all = await getStoreData(filters.city, type)
  const filtered = products_all.filter((product, idx) => {
    let isFactoryMatch = true
    if (filters.factories) {
      isFactoryMatch = false
      let product_factory = ""
      if (type === "Timer") product_factory = product.part[0]?.factory
      else product_factory = product.factory
      // if (type === "Timer")
      //   console.log(product.part[0]?.factory, filters.factories)
      if (filters.factories.includes("ALL")) isFactoryMatch = true
      else if (filters.factories.includes(product_factory))
        isFactoryMatch = true
      else if (filters.factories.includes("Not Assigned") && !product_factory)
        isFactoryMatch = true
    }
    if (type === "Timer") return isFactoryMatch
    const isMachineMatch =
      filters.machineClass == "All" ||
      filters.machineClass == "" ||
      !filters.machineClass
        ? true
        : product.machineClass == filters.machineClass
    const isSearchMatch = !filters.search
      ? true
      : product.name?.includes(filters.search?.searchString || "")
    return isMachineMatch && isSearchMatch && isFactoryMatch
  })
  const limit = type == "Timer" ? 100 : 9
  const offset = Math.max((page - 1) * limit, 0)
  const paginated = filtered.slice(offset, offset + limit)
  return {
    products: paginated,
    totalDocs: filtered.length,
    totalCount: paginated.length,
    totalPages: Math.ceil(filtered.length / limit),
  }
}

export const deleteProductAction = async (type, id, city = "Seguin") => {
  const res = await axios.delete("/timer/delete-product", {
    headers: {},
    data: { type, id, city },
  })
  return res.data
}

export const editProductAction = async (type, id, updates) => {
  const res = await axios.post("/timer/edit-product", { type, id, updates })
  return res.data
}

export const createTimerAction = async data => {
  const timer = extractFormData(data)
  const res = await axios.post("/timer/create-timer", timer)
  return res
}

export const localTimerAction = async (
  id,
  city = "Seguin",
  action,
  payload,
  isOnline = false,
  aParam = ''
) => {
  try {
    const timer = await getStoreItem(city, "Timer", id)
    console.log("Local timer action : " + action +"timer to be updated--", timer)
    if (!timer) {
      return { error: "Timer not found" }
    }
    let newTimer = { ...timer }
    if (action != "get") {
      newTimer.updatedAt = getCurrentTime()
      // if (!isOnline) newTimer.mgr = true
      newTimer.mgr = true
    }
    switch (action) {
      case "start":
        if (!timer.times[0] || !timer.times[0].startTime) {
          newTimer.times = []
        }
        newTimer.times = [
          ...newTimer.times,
          {
            startTime: payload,
            weight: newTimer.weight,
            endTime: undefined,
          },
        ]
        newTimer.status = "Started"
        break
      case "end":
        if (newTimer.times.length != 0 && newTimer.status == "Started") {
          newTimer.times[newTimer.times.length - 1].endTime = payload
          newTimer.times[newTimer.times.length - 1].weight = newTimer.weight
          newTimer.status = "Pending"
          newTimer.endProductionTime = payload
        }
        let newLog1 = {
          timer: newTimer,
          times: newTimer.times,
          operator: newTimer.operator,
          startTime: newTimer.times[newTimer.times.length - 1].startTime,
          endTime: newTimer.times[newTimer.times.length - 1].endTime,
          weight: newTimer.weight,
          part: newTimer.part,
          machine: newTimer.machine,
          city: newTimer.city,
          time: 0, //TODO
          productionTime: 0, //TODO
          mgr: isOnline ? undefined : true,
        }
        try {
          if (newLog1.timer.machine?.length !== undefined) {
            newLog1.timer.machine = newLog1.timer.machine[0]
          }
          if (newLog1.timer.part?.length !== undefined) {
            newLog1.timer.part = newLog1.timer.part[0]
          }
        } catch (error) {
          console.log(error)
        }
        await insertData(newTimer.city, "TimerLog", newLog1)
        break
      case "stop":
        if (newTimer.times.length != 0 && newTimer.status == "Started") {
          newTimer.times[newTimer.times.length - 1].endTime = payload
          newTimer.times[newTimer.times.length - 1].weight = newTimer.weight
          newTimer.status = "Pending"
        }
        newTimer.status = "Pending"
        let newLog2 = {
          timer: newTimer,
          times: newTimer.times,
          operator: newTimer.operator,
          startTime: newTimer.times[newTimer.times.length - 1].startTime,
          endTime: newTimer.times[newTimer.times.length - 1].endTime,
          weight: newTimer.weight,
          part: newTimer.part,
          machine: newTimer.machine,
          city: newTimer.city,
          time: 0, //TODO
          productionTime: 0, //TODO
          mgr: isOnline ? undefined : true,
          stoppingReason: aParam
        }
        try {
          if (newLog2.timer.machine?.length !== undefined) {
            newLog2.timer.machine = newLog2.timer.machine[0]
          }
          if (newLog2.timer.part?.length !== undefined) {
            newLog2.timer.part = newLog2.timer.part[0]
          }
          await insertData(newTimer.city, "TimerLog", newLog2)
        } catch (error) {
          console.log(error)
        }
        break
      case "update":
        newTimer = { ...newTimer, ...payload }
        break
      case "get":
        //TODO TimerLog for today and statistics
        if (
          newTimer.part?.length == 1 &&
          typeof newTimer.part[0] !== "undefined"
        ) {
          newTimer.part = newTimer.part[0]
        }
        if (
          newTimer.machine?.length == 1 &&
          typeof newTimer.machine[0] !== "undefined"
        ) {
          newTimer.machine = newTimer.machine[0]
        }
        return { ...newTimer, dailyUnit: newTimer.times.length }
      default:
        break
    }
    const res = await updateData(city, "Timer", newTimer)
    const timerIds = [res]
    return {
      data: { success: true, cnt: timerIds.length, timer: newTimer },
      status: 200,
    }
  } catch (error) {
    return { status: 500, error }
  }
}

export const startTimerAction = async (
  id,
  city = "Seguin",
  operator,
  isOnline = true
) => {
  try {
    // if (!isOnline) {
    // }
    if (!operator || operator == "") return null
    const time = new Date()
    if (isOnline) {
      const res_online = await
      axios.post("/timer/start-timer", {
        id,
        city,
        operator,
        time: time.toISOString(),
      })
      // .then ((res) => {
        // console.log("startTimerAction res", res.data)
      //   // if (res.data.success && res.data.timer) {
      //   //   putDataArr(city, "Timer", res.data.timer)
      //   // }
      //   return null
      // }).catch ((err) => {
      //   console.log("startTimerAction err", err)
      //   // TODO: handle error (Stop timer again)
      //   return null
      // })
      console.log ("startTimerAction res_online", res_online)
      return res_online
    }
    const timer = await getStoreItem(city, "Timer", id)
    if (!timer.operator)
      return {
        status: 200,
        data: { success: false, msg: "Operator is not set yet" },
      }
    if (timer.endProductionTime)
      return {
        status: 400,
        data: { success: false, msg: "The production ended for today" },
      }
    const res_offline = await localTimerAction(
      id,
      city,
      "start",
      time.toISOString(),
      isOnline
    )
    return res_offline
  } catch (error) {
    console.log (error)
    return error
  }
}

export const endTimerAction = async (id, city = "Seguin", isOnline = true) => {
  try {
    const time = new Date()
    if (isOnline) {
      const res_online = await
      axios.post("/timer/end-timer", {
        id,
        city,
        time,
      })
      // .then((res) => {
      //   console.log("endTimerAction res", res.data)
      //   // putDataArr(city, "Timer", res.data.timer)
      // }).catch((err) => {
      //   console.log("endTimerAction err", err)
      //   // TODO: handle error (Fetch backend timer again)
      // })
      return res_online
    }
    const res_offline = await localTimerAction(
      id,
      city,
      "end",
      time.toISOString(),
      isOnline
    )
    return res_offline
  } catch (error) {
    return error
  }
}

export const stopTimerAction = async (id, city = "Seguin", isOnline = true, stoppingReason = '') => {
  try {
    const time = new Date()
    if (isOnline) {
      const res_online = await
      axios.post("/timer/stop-timer", {
        id,
        city,
        time,
        stoppingReason,
      })
      // .then((res) => {
      //   console.log("stopTimerAction res", res.data)
      //   // putDataArr(city, "Timer", res.data.timer)
      // }).catch((err) => {
      //   console.log("stopTimerAction err", err)
      //   // TODO: handle error (Fetch backend timer again)
      // })
      console.log ("stop timer res", res_online)
      return res_online
    }
    const res_offline = await localTimerAction(
      id,
      city,
      "stop",
      time.toISOString(),
      isOnline,
      stoppingReason
    )
    return res_offline
  } catch (error) {
    return error
  }
}

export const updateTimerAction = async (id, city, updates, isOnline = true) => {
  try {
    if (isOnline) {
      const res_online = await axios
        .post("/timer/update-timer", {
          id,
          city,
          updates,
        })

      return res_online?.data
    }
    const res_offline = await localTimerAction(
      id,
      city,
      "update",
      updates,
      isOnline
    )
    console.log (res_offline)
    return res_offline
  } catch (error) {
    console.log("ERROR")
    return error
  }
}

export const refreshTimerAction = async (
  id,
  city = "Seguin",
  isOnline = true
) => {
  //Not Yet
  try {
    if (isOnline) {
      const res_online = await
      axios.get("/timer/get-timer?id=" + id + "&city=" + city)
      // .then(res => {
      //   console.log("update local db on timer ", res.data.timer)
      //   putDataArr(city, "Timer", [res.data.timer])
      // }).catch(err => {
      //   console.log("refreshTimerAction err", err)
      //   // TODO: handle error (Recover original backend timer again)
      // })
      return res_online?.data?.timer
    }
    const res_offline = await localTimerAction(id, city, "get", isOnline)
    return res_offline
  } catch (error) {
    console.log(error)
    return undefined
  }
}

export const searchMacheinsAction = async machineClass => {
  try {
    const res = await axios.get("/timer/search-machines", {
      params: { machineClass },
    })
    return res.data.machines
  } catch (error) {
    return error
  }
}

export const getTimerLogsOfMachine = async (
  machine,
  part,
  from,
  to,
  page,
  includeOperator,
  machineClass = 0,
  city = 0,
  items_per_page = 4,
  query,
  isOnline = true,
  timer,
) => {
  try {
    if (isOnline) {
      const res = await axios.get("/timer/timer-logs-of-machine", {
        params: {
          machine,
          part,
          from,
          to,
          page,
          includeOperator,
          machineClass,
          city,
          items_per_page,
          query,
          timer,
        },
      })
      putDataArr(city, "TimerLog", res.data.logs)
      return res.data
    } else {
      return getLocalTimerLogs(
        machine,
        part,
        from,
        to,
        page,
        includeOperator,
        machineClass,
        city,
        items_per_page,
        query,
        timer,
      )
    }
  } catch (e) {
    console.log("You take too long period to get the log.")
    return "You take too long period to get the log."
  }
}

export const getLogsToPrintAction = async (
  machine,
  part,
  from,
  to,
  page,
  includeOperator,
  machineClass = 0,
  city = 0,
  items_per_page = 4
) => {
  const res = await axios.get("/timer/timer-logs-to-print", {
    params: {
      machine,
      part,
      from,
      to,
      page,
      includeOperator,
      machineClass,
      city,
      items_per_page,
    },
  })
  return res.data
}

export const startProductionTimeAction = async (city, isOnline = true) => {
  try {
    if (isOnline) {
      const res = await axios.get("/timer/start-of-production-time", {
        params: { city },
      })
      return res.data.log
    } else {
      //TODO
    }
  } catch (exception) {
    console.log("----startProductionTimeAction----", exception)
  }
}

export const refreshIndexedDB = async (city, type, page = 1, filters) => {
  // const res = await axios.post("/timer/get-products", { type, page, filters })
  // const products = res.data.products
  // await addLocalProducts(city, type, products)
  // return res.data
}

export const hardRefreshIndexedDB = async () => {
  // getProducts() timers, parts, machines => IndexedDB page: -1 to get all the data at the first time.
  // LOGS is not available just for today
}

export const uploadMigrationData = async (city, type, data) => {
  const res = await axios.post("/timer/upload-migration-data", {
    city,
    type,
    data,
  })
  return res
}

export const getLocalTimerLogs = async (
  machine,
  part,
  from,
  to,
  page,
  includeOperator,
  machineClass,
  city,
  items_per_page,
  query,
  timer = "",
) => {
  const offset = Math.max(0, (page - 1) * items_per_page)
  const limit = items_per_page || 8
  let res = []
  const res_all = await getStoreData(city, "TimerLog")
  const res_filtered = res_all.filter((item, idx) => {
    return item.timer?.machine?._id == machine
  })
  if (limit) res = res_filtered.slice(offset, offset + limit)

  if (!res) res = []

  return {
    logs: res,
    total: res_filtered.length,
    totalFloat: 0, //TODO
    totalGain: 0, //TODO
    totalLoss: 0, //TODO
    totalPage: Math.ceil(res_filtered.length / limit), //TODO
    totalTime: 0, //TODO
    totalTons: 0, //TODO
  }
}
