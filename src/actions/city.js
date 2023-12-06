import axios from "axios"

export const updateCityAction = async (
  city,
  productionTime,
  isOnline = true
) => {
  if (!isOnline) return // in offline can't update city
  const res = axios.post("/city/update-city", { city, productionTime })
  return res.data
}

export const getCityAction = async (city, isOnline = true) => {
  if (isOnline) {
    const res = await axios.get("/city/get-city", {
      params: { city },
    })
    return res.data.city
  }
  else {
    //TODO
  }
}
