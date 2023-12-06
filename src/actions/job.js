import axios from "axios"
import { extractFormData } from "helpers/functions"
import {
  getStoreData,
  updateData,
  getStoreItem,
  putData,
  insertData,
  getLastUpdatedData,
} from "helpers/offlineDB"

export const createJobAction = async data => {
  const job = extractFormData(data)
  const res = await axios.post("/job/create-job", job)
  return res.data.job
}

export const editJobAction = async (data, editID, city) => {
  const job = extractFormData(data)
  const res = await axios.post("/job/update-job", { update: job, id: editID, city })
  return res.data.job
}
export const deleteJobAction = async (id, mode = 0) => {
  const res = await axios.delete("/job/delete-job", {
    headers: {},
    data: { id, mode },
  })
  return res.data
}

export const getJobsAction = async (page, query, tab, city, factory, count = 7, order = 0) => {
  if (!city || city == '') city = 'All';
  const res = await axios.get(
    "/job/get-jobs?page=" +
      page +
      "&query=" +
      query +
      "&tab=" +
      tab +
      "&city=" +
      city +
      "&factory=" +
      factory +
      "&order=" +
      order +
      "&count=" +
      count
  )
  return res.data
}

export const getJobsForTimer = async (city, factory, machine, part, isOnline = true) => {
  if (!city || city == '') city = 'All';
  if (!factory || factory == '') factory = 'All';
  if (isOnline) {
    const res = await axios.get(
      "/job/get-jobs-timer?city=" +
        city +
        "&factory=" +
        factory +
        "&machine=" +
        machine +
        "&part=" +
        part
    )
    return res.data;
  } else {
    const res = await getStoreData(city, 'Job');
    const jobs = res.filter(job => 
      // job.factory == factory && 
      job.machine == machine && 
      job.part == part
    )
    const stock_jobs = res.filter (job=>
      job.stock  
    )
    return {jobs, stock_jobs};
  }
}

export const getJobsForMP = async (city, machines, parts) => {
  const res = await axios.post(
    "/job/get-jobs-mp", 
    { 
      city, // city name
      machines, // array of machine ids
      parts // array of part ids
    }
  )
  return res.data;
}
