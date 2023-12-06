import React, { useState } from 'react';
import {
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';
import { useTimerUser } from "context/timer"
import { avatar2url } from "helpers/functions"
import sampleAvatar from "../../assets/images/person.svg"

const WorkingList = (props) => {
  const { TIMER_USER } = useTimerUser()
  const [curCity, setCurCity] = useState(Object.keys(TIMER_USER)[0])
  return (
    <div className="working-list">
      <Nav tabs>
        {Object.keys(TIMER_USER).map((item_city) => {
          return (
            <NavItem key={item_city}>
              <NavLink
                className={item_city === curCity ? "active" : ""}
                onClick={() => { setCurCity(item_city) }}
              >
                {item_city}{`  `}({Object.keys(TIMER_USER[item_city]).length})
              </NavLink>
            </NavItem>
          )})
        }
      </Nav>
      <TabContent activeTab={curCity}>
        {Object.keys(TIMER_USER).map((city) => {
          return (
            <TabPane tabId={city} key={"tab_pane_"+city}>
              <h4 className='mt-3 mb-3'>{city}</h4>
              {Object.keys(TIMER_USER[city]).map((tid) => {
                return (
                  <div key={"timer_user_"+tid} className="mb-2 d-flex align-items-center">
                    <img src={avatar2url(TIMER_USER[city][tid]?.profile?.avatar) || sampleAvatar} alt="avatar" className="rounded-circle img-thumbnail avatar-sm me-2" />
                    <div className="ml-1">
                      <strong>
                        {TIMER_USER[city][tid]?.profile?.firstName}
                      </strong>
                      <span>
                        {' '} is working on {' '}
                      </span>
                      <strong className="ml-1">
                        {
                          TIMER_USER[city][tid]?.meta?.machine?.name
                        }
                      </strong>
                      <span>
                        {' '} as {' '}
                      </span>
                      <strong className="ml-1">
                        {
                          TIMER_USER[city][tid]?.meta?.operator
                        }
                      </strong>
                      <br/>
                      <span style={{color:'gray'}}>
                        {TIMER_USER[city][tid]?.time}
                      </span>
                    </div>
                  </div>
                )
              })}
            </TabPane>
          )
        })}
      </TabContent>
    </div>
  )
}

export default WorkingList