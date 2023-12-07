import PropTypes from 'prop-types'
import { Component } from "react"

import { connect } from "react-redux"
import { withRouter } from "react-router-dom"
import {
  changeLayout,
  changeSidebarTheme,
  changeSidebarType,
  changeTopbarTheme,
  changeLayoutWidth,
} from "../../store/actions"

// Layout Related Components
import Header from "./Header"
import Sidebar from "./Sidebar"
import Footer from "./Footer"
import Rightbar from "../CommonForBoth/Rightbar"

import LockScreen from "../../pages/Home"
import Tracker from "./Tracker"

class Layout extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    }
    this.toggleMenuCallback = this.toggleMenuCallback.bind(this)
  }

  capitalizeFirstLetter = string => {
    return string.charAt(1).toUpperCase() + string.slice(2)
  }

  componentDidMount() {

    // Scroll Top to 0
    window.scrollTo(0, 0)
    // let currentage = this.capitalizeFirstLetter(this.props.location.pathname)

    // document.title =
    //   currentage + " | Veltrix - Responsive Bootstrap 5 Admin Dashboard"
    if (this.props.leftSideBarTheme) {
      this.props.changeSidebarTheme(this.props.leftSideBarTheme)
    }

    if (this.props.layoutWidth) {
      this.props.changeLayoutWidth(this.props.layoutWidth)
    }

    if (this.props.leftSideBarType) {
      this.props.changeSidebarType(this.props.leftSideBarType)
    }
    if (this.props.topbarTheme) {
      this.props.changeTopbarTheme(this.props.topbarTheme)
    }
  }
  toggleMenuCallback = () => {
    if (this.props.leftSideBarType === "default") {
      this.props.changeSidebarType("condensed", this.state.isMobile)
    } else if (this.props.leftSideBarType === "condensed") {
      this.props.changeSidebarType("default", this.state.isMobile)
    }
  }

  render() {
    return (
      <React.Fragment>
        <div id="layout-wrapper" style={{
          display:this.props.up?"block":"none"
        }}>
          <Tracker/>
          <Header toggleMenuCallback={this.toggleMenuCallback} />
          <Sidebar
            theme={this.props.leftSideBarTheme}
            type={this.props.leftSideBarType}
            isMobile={this.state.isMobile}
          />
          <div className="main-content">{this.props.children}</div>
          <Footer />
        </div>
        {this.props.showRightSidebar ? <Rightbar /> : null}
        <div style={{opacity:this.props.up?"0":"1", position: "fixed", backgroundColor:'white', width:"100vw", height:"100vh", bottom:(this.props.up?"100vh":0), zIndex: 9999, transition: 'all .4s cubic-bezier(0.37, 1.01, 0.63, 1.02) 0s'}}>
          <LockScreen lock={this.props.lock} up={this.props.up}></LockScreen>
        </div>
      </React.Fragment>
    )
  }
}

Layout.propTypes = {
  changeLayoutWidth: PropTypes.func,
  changeSidebarTheme: PropTypes.func,
  changeSidebarType: PropTypes.func,
  changeTopbarTheme: PropTypes.func,
  children: PropTypes.object,
  layoutWidth: PropTypes.any,
  leftSideBarTheme: PropTypes.any,
  leftSideBarType: PropTypes.any,
  location: PropTypes.object,
  showRightSidebar: PropTypes.any,
  topbarTheme: PropTypes.any
}

const mapStatetoProps = state => {
  return {
    ...state.Layout,
    lock: state.Login.loggedIn,
    up: !state.Login.locked
  }
}
export default connect(mapStatetoProps, {
  changeLayout,
  changeSidebarTheme,
  changeSidebarType,
  changeTopbarTheme,
  changeLayoutWidth,
})(withRouter(Layout))
