import React, { useState, useEffect, useMemo } from "react";

const NoughElem = () => (<span style={{color:"#fffae5"}}>0</span>)
const DigitElem = (props) => (<span style={{color:"#102135"}}>{props.digit}</span>)

function Clock() {
  const [timeString, setTimeString] = useState("");
  const [time, setTime] = useState(0)

  const getNow = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const milliseconds = now
      .getMilliseconds()
      .toString()
      .padStart(3, "0")
      .slice(0, 2);
    return {
      hours, minutes, seconds, milliseconds
    }
  }

  const getTime = (tt) => {
    let t = tt
    const hour = Math.floor (t/3600000)
    t -= hour * 3600 * 1000
    const minute = Math.floor (t/60000)
    t -= minute * 60 * 1000
    const second = Math.floor (t/1000)
    t -= second * 1000
    const millisecond = Math.floor (t/10)
    return {
      hour,
      minute,
      second,
      millisecond
    }
  }

  const getTimeString = useMemo(()=>{
    let {hour, minute, second, millisecond} = getTime (time)
    return <>
      {hour<10&&<NoughElem/>}
      <DigitElem digit={hour}/>
      <DigitElem digit={':'}/>
      {minute<10&&<NoughElem/>}
      <DigitElem digit={minute}/>
      <DigitElem digit={':'}/>
      {second<10&&<NoughElem/>}
      <DigitElem digit={second}/>
      <DigitElem digit={':'}/>
      {millisecond<10&&<NoughElem/>}
      <DigitElem digit={millisecond}/>
    </>
  }, [time])

  useEffect(() => {
    const intervalId = setInterval(() => {
      // const {hours, minutes, seconds, milliseconds} = getNow()
      // const newTimeString = `${hours}:${minutes}:${seconds}:${milliseconds}`;
      // setTimeString(newTimeString);
      setTime (time=>time+130)
    }, 130);

    return () => clearInterval(intervalId);
  }, []);

  return {getTimeString};
}

export default Clock;