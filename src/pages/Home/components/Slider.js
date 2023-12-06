import { useEffect } from "react"
import { useState } from "react"
import SLIDER_IMAGE_1 from "../../../assets/images/home-slider/slider-image-1.jpg"
import SLIDER_IMAGE_2 from "../../../assets/images/home-slider/slider-image-2.jpg"
import SLIDER_IMAGE_3 from "../../../assets/images/home-slider/slider-image-3.jpg"
import { Carousel } from 'react-responsive-carousel';

import "./style.scss"
import axios from "axios"


const Slider = (props) => {

  const images = [SLIDER_IMAGE_1, SLIDER_IMAGE_2, SLIDER_IMAGE_3]
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [time, setTime] = useState(null)
  const units = ["DAYS", "HOURS", "MINUTES", "SECONDS"]
  const limit = [0, 24, 60, 60]
  const [rainOptions, setRainOptions] = useState([
    {
      delay: 0.1,
      height: 20,
      time: 8
    },
    {
      delay: 0.1,
      height: 20,
      time: 9
    },
    {
      delay: 0.1,
      height: 20,
      time: 10
    },
    {
      delay: 0.1,
      height: 20,
      time: 9.2
    },
  ])

  const formatNumber = (v) => {
    return v.toString().length < 2 ? "0"+v: v
  }

  useEffect(() => {
    (async() => {
      let res = await axios.get("/auth/remaining-time")
      res = res.data.time
      setTime([parseInt(res / (60 * 60 * 24)), parseInt((res % (60 * 60 * 24)) / (60 * 60)), parseInt((res % (60 * 60)) / 60), res % 60])
    })()
  }, [])

  useEffect(() => {

    if (!time) return

    const id = setInterval(() => {
      let _time = [...time]
      for (let i = 3; i >= 0; i--) {
        _time[i] --
        if (_time[i] < 0) {
          _time[i] = limit[i] - 1
        } else break
      }
      setTime(_time)
    }, 1000)

    return (() => {
      clearInterval(id)
    })
  }, [time])

  // useEffect(() => {

  //   const format = () => {
  //     setAnimation(false)
  //     setTimeout(() => {
  //       const length = Math.floor(Math.random() * 5) + 7
  //       setDelays([...Array(length)].map(v => Math.random() * 3))
  //       setHeight([...Array(length)].map(v => Math.floor(Math.random() * 15) + 20))
  //       setAnimation(true)
  //     }, 100)
  //   }

  //   const id = setInterval(format, 13000)

  //   return (() => {
  //     clearInterval(id)
  //   })
  // }, [delays])
  
  const [animation, setAnimation] = useState(true)
  const [timerId, setTimerId] = useState(-1)

  const setCurrentImage = v => {
    clearTimeout(timerId)
    const _timerId = setTimeout(() => {
      setAnimation(false)
    }, 2000)
    setTimerId(_timerId)
    setAnimation(true)
    setCurrentImageIndex(v)
  }

  return <div className="position-relative w-100 h-100 sm-vh-100 sm-vw-100 slider-container">
    <Carousel
      showThumbs={false}
      autoPlay
      infiniteLoop
      renderIndicator={(handler, selected) => {
        return <li className={`slider-dot ${selected ? 'active' : ''}`} onClick={handler}>
        </li>
      }}>
      {
        images.map((image, index) => <div className="h-100" key={`carousel-part-${index}`}><img src={image} className="h-100" /></div>)
      }
    </Carousel>
    <div className="rain-container">
      <div className="rain" style={{ animationDelay: '2s' }}></div>
      <div className="rain" style={{ animationDelay: '0.5s' }}></div>
      <div className="rain" style={{ animationDelay: '4s' }}></div>
      <div className="rain" style={{ animationDelay: '3s' }}></div>
    </div>

    <div className="h-100 w-100 position-absolute text-white d-flex align-items-center justify-content-center flex-column" style={{left: 0, top: 0}}>
      <h1 className="header-title">SUSTAINABILITY</h1>
      {/* <h5 className="text-center mt-5" style={{fontSize: "1vw"}}>We are cooking up some really awesome stuff. Hold your breath and wait for the incoming flood launch!</h5>

      <div className="timer-container">
        {
          time && time.map((v, index) => <div className="timer-number" key={`timer-${index}`}>
            <div className="number">{ formatNumber(v) }</div>
            <div className="unit">{ units[index] }</div>
          </div>)
        }
      </div> */}
    </div>
  </div>
}

export default Slider