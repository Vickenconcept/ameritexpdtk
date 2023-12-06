import axios from "axios"

export const removeUser = async (id) => {
  try {
    const res = await axios.post("/auth/update-user", { id, delete: true })
    return true
  } catch (err) {
    return false
  }
}

export const updateUser = async (fields) => {
  try {
    const res = await axios.post("/auth/update-user", fields)
    return res.data
  } catch (err) {
    return false
  }
}

export const getUsers = async () => {
  try {
    const res = await axios.get("/auth/all-users")
    return res.data.users
  } catch (err) {
  }
}

export const getReports = async () => {
  try {
    const res = await axios.get("/auth/report")
    return res.data?.report
  } catch (err) {
    console.log (err)
    return null
  }
}

export const updateReport = async (action, report) => {
  try {
    const res = await axios.post("/auth/report", {
      report,
      action,
    })
    return res.data.report
  } catch (err) {
    return null
  }
}
