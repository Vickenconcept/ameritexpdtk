import { useState, useRef, useEffect, useCallback } from "react"

import { Dropdown, DropdownToggle, DropdownMenu, Row, Col } from "reactstrap"
import SimpleBar from "simplebar-react"

export default () => {
    const [menu, setMenu] = useState(false)

    const onMenuClick = (func) => {
        setMenu(prev => !prev)
        if (func) func()
    }

    return (
        <Dropdown
            isOpen={menu}
            toggle={() => setMenu(!menu)}
            className="dropdown d-inline-block"
            tag="li"
        // style={{ left: "10%" }}
        >
            <DropdownToggle
                className="d-flex align-items-center justify-content-center"
                tag="a"
            // disabled={true}
            >
                <h5 className='text-second' style={{ fontSize: '1rem', margin: 'auto' }}>
                    <i className='mdi mdi-chevron-down'></i>
                </h5>
                {/* <span className="badge bg-danger rounded-pill">0</span> */}
            </DropdownToggle>

            <DropdownMenu className="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0 sidebar-header-dropdown">
                <div className="p-3">
                    <Row className="align-items-center">
                        <Col>
                            <a onClick={() => onMenuClick()} className="mb-1"> Edit </a>
                        </Col>
                    </Row>
                    <Row className="align-items-center">
                        <Col>
                            <a onClick={() => onMenuClick()} className="mb-1"> Refresh </a>
                        </Col>
                    </Row>
                </div>
            </DropdownMenu>
        </Dropdown>
    )
}