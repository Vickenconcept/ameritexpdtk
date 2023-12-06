import { openDB } from "idb"

const cities = ['Seguin', 'Conroe', 'Gunter']

const dbPromise = openDB("MyDB", 1, {
  upgrade(db) {
    // create object stores
    for (var i=0; i<cities.length; i++) {
      db.createObjectStore("Timer."+cities[i], { keyPath: "_id" })
      db.createObjectStore("timerlogs."+cities[i], { keyPath: "_id" })
      db.createObjectStore("Part."+cities[i], { keyPath: "_id" })
      db.createObjectStore("Machine."+cities[i], { keyPath: "_id" })
    }
  },
})

const addLocalProducts = async (city, type, timers) => {
  const _timers = timers.length ? timers : [timers]
  for (const _timer of _timers) {
    dbPromise.then(async db => {
      const tx = db.transaction(type+'.'+city, "readwrite")
      await tx.objectStore(type+'.'+city).put(_timer)
      return tx.success
    })
  }
}

const getLocalProducts = (city, type, page, filters) => {
  return new Promise((resolve, reject) => {
    dbPromise
      .then(async db => {
        const tx = await db.transaction(type+'.'+city, "readonly")
        const store = await tx.objectStore(type+'.'+city)

        let res = []

        let records = []
        let recordCount = 0
        const pageSize = 9

        if (page == -1) page = 1

        let pageStart = (page - 1) * pageSize
        let pageEnd = pageStart + pageSize - 1

        let request = await store.openCursor()
        while (true) {
          if (recordCount > pageSize) break
          if (recordCount) {
            try {
              const req = await request.continue()
              res.push(req.value)
            } catch (err) {
              break
            }
          } else res.push(request.value)
          recordCount++
        }
        resolve(res);
      })
      .catch(error => {
        reject(error);
      })
  })
}

export { addLocalProducts, getLocalProducts }
