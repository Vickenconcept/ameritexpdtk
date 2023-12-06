import React, { useState, useRef, useEffect } from "react"

import { Dropdown, DropdownToggle, DropdownMenu, Row, Col } from "reactstrap"
import SimpleBar from "simplebar-react"

export default (props) => {
    const [menu, setMenu] = useState(false)
    const {children, toggler} = props

    return (
        <Dropdown
            isOpen={menu}
            toggle={() => setMenu(!menu)}
            className="flex-1 d-flex align-items-center"
            tag="div"
            direction="down"

            {...props}
        >
            <DropdownToggle
            className="d-flex align-items-center"
            tag="div"
            id="page-header-notifications-dropdown"
            // disabled={true}
            >
                {toggler}
            </DropdownToggle>

            <DropdownMenu className="dropdown-menu dropdown-menu-lg dropdown-mega-menu-lg dropdown-menu-start p-0 sidebar-header-dropdown">
                
                <a className="close-popout" onClick={() => {setMenu(false)}}>
                    &times;
                </a>

                {children}

            </DropdownMenu>
        </Dropdown>
        )
    }