import { BACKEND, FILE_BACKEND } from "../../../helpers/axiosConfig"

const getYoutubeId = url => {
  return url.replace("yt:", "")
}

export const getMediaType = url => {
  if (url == null || url == "") return null
  else if (url.startsWith("yt:")) return "youtube"
  else if (url.endsWith("mp4")) return "video"
  else return "image"
}

export const getMediaUrl = url => {
  if (getMediaType(url) == "youtube") {
    // return "https://youtu.be/"+(getYoutubeId(url))
    return "https://youtube.com/embed/" + getYoutubeId(url)
  } else {
    return FILE_BACKEND + "apms/client" + url
  }
}

export const getMediaPreview = url => {
  if (getMediaType(url) == "video") {
    return "https://i.ytimg.com/vi/" + getYoutubeId(url) + "/default.jpg"
  } else {
    return FILE_BACKEND + "apms/client" + url
  }
}
