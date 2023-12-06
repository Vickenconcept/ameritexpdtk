import PropTypes from 'prop-types'
import React, { useEffect } from "react"
import { connect } from "react-redux"
import { withRouter } from "react-router-dom"

import { logoutUser } from "../../store/actions"
import { useNetStatus } from 'context/net'

const Logout = props => {
  const history = props.history
  const {isOnline} = useNetStatus()
  useEffect(() => {
    props.logoutUser(props.history, isOnline)
    history.push("/")
  },[])

  return <></>
}

Logout.propTypes = {
  history: PropTypes.object,
  logoutUser: PropTypes.func
}

export default withRouter(connect(null, { logoutUser })(Logout))
