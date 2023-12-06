import React, { useEffect } from 'react'
import MetaTags from 'react-meta-tags';

import Slider from './components/Slider';

import {SignupProvider} from './contexts/signTwo'

import "react-responsive-carousel/lib/styles/carousel.min.css"

const Home = (props) => {

  const {lock, up} = props

  useEffect (()=>{
    console.log ("Locking: ", lock, up)
  }, [lock, up])

  return <React.Fragment>
    <div className="m-0 p-0 h-100" style={{display:'flex', justifyContent:'space-between', alignItems:'center', overflow:'hidden'}}>
      <MetaTags>
        <title>Ameritex Production Management</title>
      </MetaTags>
      <div className="p-0" style={{maxWidth:'100vw', width:'fit-content', overflow:'hidden' }}>
        <SignupProvider sign={lock} up={up}></SignupProvider>
      </div>
      <div className="p-0" style={{flex:1, height:'100%'}}>
        <Slider />
      </div>
    </div>
  </React.Fragment>
}

export default Home
