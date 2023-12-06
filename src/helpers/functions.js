import moment from "moment"
import { BACKEND, FILE_BACKEND } from "./helpers/axiosConfig"

export const formatMSeconds = val => {
  val = Math.floor(val * 1000);
  let values = []
  let cnt = 0;
  values.push(Math.floor(val % 1000 / 10));
  val = Math.floor((val - val % 1000) / 1000);

  while(val) {
    cnt = cnt + 1;
    if(cnt == 3) {
      values.push(val);
      break;
    }
    values.push(Math.floor(val % 60))
    val = (val - val % 60) / 60
  }

  while(values.length < 4) {
    values.push(0)
  }
  values.reverse()
  return values.reduce((p, c, index) => {
    if (!index) return formatTimeValue(c)
    return p + ":" + formatTimeValue(c)
  }, "")
}
export const formatSeconds = val => {
  let values = []
  let cnt = 0;
  while(val) {
    cnt = cnt + 1;
    if(cnt == 3) {
      values.push(val);
      break;
    }
    values.push(parseInt(val % 60))
    val = (val - val % 60) / 60
  }

  while(values.length < 3) {
    values.push(0)
  }
  values.reverse()
  return values.reduce((p, c, index) => {
    if (!index) return formatTimeValue(c)
    return p + ":" + formatTimeValue(c)
  }, "")
}
export const formatSecondsLetter = val => {
  let values = []
  let cnt = 0;
  while(val) {
    cnt = cnt + 1;
    if(cnt == 3) {
      values.push(val);
      break;
    }
    values.push(parseInt(val % 60))
    val = (val - val % 60) / 60
  }

  while(values.length < 3) {
    values.push(0)
  }
  values.reverse()
  let str = ''
  if (values[0] > 0) {
    str += values[0] + 'h '
  }
  if (values[1] > 0) {
    str += values[1] + 'm '
  }
  if (values[2] > 0) {
    str += values[2] + 's'
  }
  return str
  // return values.reduce((p, c, index) => {
  //   if (!index) return formatTimeValue(c)
  //   return p + ":" + formatTimeValue(c)
  // }, "")
}

export const formatTimeValue = val => {
  if(!val) val = 0;
  return val >= 10 ? val : '0'+val
}

export const extractFormData = form => {
  let data = {}
  for (const pair of form) {
    data = {
      ...data,
      [[pair[0]]]: pair[1]
    }
  }
  return data
}

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

export const getCurrentTime = (offsetByHour) => {
  const offset = offsetByHour * 60 * 60 * 1000
  const now = new Date()
  const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
  return new Date(utc.getTime() + offset)
}

export const lbsToTons = lbs => (lbs * 0.0005).toFixed(3)

export const avatar2url = (avatar) => {
  if (avatar==null || avatar == '') return null
  if (avatar.startsWith('data:image/')) return avatar
  return FILE_BACKEND + "apms/client" + avatar
}

export const getFormattedDate = (date) => {
  return moment(date).format('YYYY-MM-DD')
}

export const getFormattedTime = (date) => {
  return moment(date).format('YYYY-MM-DD HH:mm:ss')
}
