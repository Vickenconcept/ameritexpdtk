import PropTypes from 'prop-types'
import { useContext, useEffect, useState } from "react"

import { Switch, BrowserRouter as Router, Route } from "react-router-dom"
import { connect } from "react-redux"

// Import Routes all
import { userRoutes, authRoutes } from "./routes/allRoutes.js"

// Import all middleware
import Authmiddleware from "./routes/middleware/Authmiddleware.jsx"
import { setAxiosConfig } from './helpers/axiosConfig'

// layouts Format
import VerticalLayout from "./components/VerticalLayout/index.jsx"
import HorizontalLayout from "./components/HorizontalLayout/index.jsx"
import NonAuthLayout from "./components/NonAuthLayout.jsx"
import Indicator from "./components/Indicator/index.jsx"
import { setUserProfile } from './store/actions'

import { LoadingProvider } from './context/loading.js'
import { LocalDBProvider } from './context/localDB.js'
import { NetStatusProvider } from './context/net.js'
import { TimerUserProvider } from './context/timer'
import { NotificationProvider } from './context/notification'

import { useHistory } from "react-router-dom"
import { ModalProvider } from "./components/Common/Modal/promise-modal"

// Import scss
import "./assets/scss/theme.scss"
import ReportPage from './pages/Report'

setAxiosConfig()

const App = props => {
  function getLayout() {
    let layoutCls = VerticalLayout
    switch (props.layout.layoutType) {
      case "horizontal":
        layoutCls = HorizontalLayout
        break
      default:
        layoutCls = VerticalLayout
        break
    }
    return layoutCls
  }

  useEffect(() => {
    props.setUserProfile({ offline: !(navigator.onLine) })
  }, [])

  const Layout = getLayout()
  return (
    <React.Fragment>
      {/* <p style={{position:"fixed", right:"50%", zIndex:"999"}}>{isOnline ? 'Online' : 'Offline'}</p> */}
      <LoadingProvider indicator={<Indicator />} >
        <NotificationProvider>
          <TimerUserProvider>
            <NetStatusProvider>
              <LocalDBProvider user={props.authUser} userLoading={props.loading}>
                <ModalProvider>
                  <Router>
                    <Switch>
                      <Route
                        path="/report/:city/:machine/:classify/:from/:to"
                        render={props => <ReportPage {...props} />}
                      />

                      {authRoutes.map((route, idx) => (
                        <Authmiddleware
                          path={route.path}
                          layout={NonAuthLayout}
                          component={route.component}
                          isLoggedIn={props.loggedIn}
                          loading={props.loading}
                          key={idx}
                          exact
                          isAuthProtected={false}
                          admin={route.admin}
                          user={props.authUser}
                        />
                      ))}

                      {userRoutes.map((route, idx) => (
                        <Authmiddleware
                          path={route.path}
                          layout={Layout}
                          component={route.component}
                          isLoggedIn={props.loggedIn}
                          loading={props.loading}
                          key={idx}
                          isAuthProtected={true}
                          exact
                          admin={route.admin}
                          user={props.authUser}
                        />
                      ))}
                    </Switch>
                  </Router>
                </ModalProvider>
              </LocalDBProvider>
            </NetStatusProvider>
          </TimerUserProvider>
        </NotificationProvider>
      </LoadingProvider>
    </React.Fragment>
  )
}

App.propTypes = {
  layout: PropTypes.any
}

const mapStateToProps = state => {
  return {
    layout: state.Layout,
    authUser: state.Login.user,
    loggedIn: state.Login.loggedIn,
    loading: state.Login.loading,
  }
}

export default connect(mapStateToProps, { setUserProfile })(App)
