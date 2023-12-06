import PropTypes from "prop-types"
import { Route, Redirect } from "react-router-dom"
import decode from "jwt-decode"
import { roleToNumber } from "common/functions"

import { useEffect } from "react"

const Authmiddleware = ({
  component: Component,
  layout: Layout,
  isAuthProtected,
  admin,
  user,
  isLoggedIn,
  loading,
  ...rest
}) => {

  const level = roleToNumber(user && user.role)

  return (
    <Route
      {...rest}
      render={props => {

        if (!isAuthProtected){
          return (
            <Layout>
              <Component {...props} />
            </Layout>
          )
        } else if (loading && isAuthProtected) {
          return (<>Now Loading...</>)
        } else if (!isLoggedIn) {
          return (
            <Redirect
              to={{ pathname: "/", state: { from: props.location } }}
            />
          )
        } else if (level < admin && isAuthProtected) {
          console.log ("here")
          return (
            <Redirect
              to={{ pathname: "/dashboard" }}
            />
          )
        } else {
          return (
            <Layout>
              <Component {...props} />
            </Layout>
          )
        }
      }}
    />
  )
}

Authmiddleware.propTypes = {
  isAuthProtected: PropTypes.bool,
  component: PropTypes.any,
  location: PropTypes.object,
  layout: PropTypes.any,
}

export default Authmiddleware;
