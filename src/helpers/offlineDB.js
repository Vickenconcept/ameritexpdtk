let request
let db
let version = 4
import { cities } from "./globals"
import { openDB } from "idb"

const dbPromise = async (city) =>
  await openDB(city, version, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log ('open db', {city, version, db, oldVersion, newVersion, transaction})
      // create object stores
      for (var key in Stores) {
        // console.log("Initing " + city + "/" + Stores[key])
        if (!db.objectStoreNames.contains(Stores[key])) {
          // console.log("Creating offline store for city:" + city + "...")
          const os = db.createObjectStore(Stores[key], { keyPath: "_id", autoIncrement: true })
          os.createIndex("mgr", "mgr", { unique: false })
          os.createIndex("updatedAt", "updatedAt", { unique: false })
          if (Stores[key] == "Timer") {
            os.createIndex("machine", "machine", { unique: false })
          }
          else if (Stores[key] == "TimerLog") {
            // os.createIndex("id", "id", { unique: true, autoIncrement: true })
            os.createIndex("_id", "_id", { unique: true, autoIncrement: true })
            // os.createIndex("timer", "timer", { unique: false })
            // os.createIndex("machine", "machine", { unique: false })
            // os.createIndex("machineClass", "machineClass", { unique: false })
          }
        }
      }
    },
    blocked(currentVersion, blockedVersion, event) {
      console.log ('blocked', {currentVersion, blockedVersion, event})
    },
    blocking(currentVersion, blockedVersion, event) {
      console.log ('blocking', {currentVersion, blockedVersion, event})
    },
    terminated() {
      console.log ('terminated')
    }
  })

export const Stores = {
  Timers: "Timer",
  TimerLogs: "TimerLog",
  Parts: "Part",
  Machines: "Machine",
  Jobs: "Job",
}

export const initDB = async city => {
  try {
    console.log ('initDB', city)
    const db = await dbPromise(city)
    console.log (db)
    version = db.version
    console.log ('dbVersion',city,version)
    return true
  } catch (error) {
    console.log (error)
    return undefined
  }
}

export const putData = async (city, storeName, data) => {
  try {
    // console.log(city + '.' + storeName + ' request.onsuccess - putData', data._id);
    const db = await dbPromise(city)
    const tx = db.transaction(storeName, "readwrite")
    const store = tx.objectStore(storeName)
    const res = await store.put(data)
    return res // returns put id
  } catch (error) {
    if (error) {
      console.log ('Put data error', city, storeName, data, error)
      return undefined
    } else {
      return "Unknown error"
    }
  }
}

export const putDataArr = async (city, storeName, data) => {
  try {
    let result = []
    await data.forEach(async element => {
      let res = await putData(city, storeName, element)
      result.push (res)
    });
    return result // returns put id
  } catch (error) {
    if (error) {
      console.log ('Put data error', city, storeName, data, error)
      return undefined
    } else {
      return "Unknown error"
    }
  }
}

export const updateData = async (city, storeName, data) => {
  try {
    const db = await dbPromise(city)
    // console.log(
    //   city + "." + storeName + " request.onsuccess - updateDate",
    //   data._id
    // )
    const tx = db.transaction(storeName, "readwrite")
    const store = tx.objectStore(storeName)
    const res = await store.put(data)
    // console.log("updateData result", res);
    return res
  } catch {
    error => {
      if (error) {
        console.log ('Update data error', city, storeName, data, error)
        return undefined
      } else {
        return "Unknown error"
      }
    }
  }
}

export const insertData = async (city, storeName, data) => {
  try {
    const db = await dbPromise(city)
    const tx = db.transaction(storeName, "readwrite")
    const store = tx.objectStore(storeName)
    const res = await store.add(data)
    // console.log("insertData result", res);
    return res.result
  } catch (error) {
    console.log ('Insert Data error', error)
    if (error) {
      console.log ('Insert data error', city, storeName, data, error)
      return undefined
    } else {
      return "Unknown error"
    }
  }
}

export const deleteData = async (city, storeName, key) => {
  try {
    const db = await dbPromise(city)
    // console.log(city + "." + storeName + " request.onsuccess - deleteData", key)
    const tx = db.transaction(storeName, "readwrite")
    const store = tx.objectStore(storeName)
    const res = await store.delete(key)
    return true
  } catch {
    error => {
      return false
    }
  }
}

export const getStoreData = async (city, storeName, offset=0, limit=0) => {
  try {
    const db = await dbPromise(city)
    // console.log(city + "." + storeName + " request.onsuccess - getAllData")
    const tx = db.transaction(storeName, "readonly")
    const store = tx.objectStore(storeName)
    if (limit > 0) {
      offset = offset || 0;
      const cursor = await store.openCursor();
      if (!cursor) return [];
      let count = 0;
      const res = [];
      while (true) {
        if (count > limit) break
        if (count) {
          try {
            const req = await cursor.continue()
            res.push(req.value)
          } catch (err) {
            break
          }
        } else res.push(cursor.value)
        count++
      }
      return res;
    } else {
      const res = await store.getAll();
      return res;
    }
  } catch (error) {
    console.log(error)
    return []
  }
}
export const getLastUpdatedData = async (city, type) => {
  try{
    const db = await dbPromise(city)
    const tx = db.transaction(type, "readonly")
    const store = tx.objectStore(type)
    const index = store.index('updatedAt');
    const request = await index.openCursor(null, 'prev');
    if (!request) return null
    return request.value?.updatedAt || null;
  } catch(e) {
    console.log("getLastUpdatedData error", e);
  }
}

export const getStoreItem = async (city, storeName, key) => {
  try {
    const db = await dbPromise(city)
    // console.log(
    //   city + "." + storeName + " request.onsuccess - getStoreItem",
    //   key
    // )
    const tx = db.transaction(storeName, "readonly")
    const store = tx.objectStore(storeName)
    const res = await store.get(key)
    // console.log(res)
    return res
  } catch {
    error => {
      return null
    }
  }
}

export const clearStore = async (city, storeName) => {
  try {
    const db = await dbPromise(city)
    // console.log(city + "." + storeName + " request.onsuccess - clearStore")
    const tx = db.transaction(storeName, "readwrite")
    const store = tx.objectStore(storeName)
    const res = await store.clear()
    return true
  } catch {
    ;() => {
      return false
    }
  }
}
