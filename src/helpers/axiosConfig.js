import axios from 'axios'

export const BACKEND = process.env.NODE_ENV === 'production' ? 'https://apms.global' : 'http://localhost';
export const FILE_BACKEND = 'https://www.iekomedia.com/'
export const IMAGE_STORE = 'https://www.iekomedia.com/apms/client/uploads/gallery/'


import socketIO from 'socket.io-client';
export const socket = socketIO.connect(BACKEND, {
  autoConnect: false,
  pingTimeout: 60000,
  transports: [ "websocket", "polling" ],
});

export const event_source = new EventSource(BACKEND + "/timer-updates");

export const setAxiosConfig = () => {
  const token = localStorage.getItem("token");
  axios.defaults.baseURL = BACKEND+"/api/";
  axios.defaults.headers.common["Authorization"] = token;
}
