import "./style.scss"
import { formatSeconds } from "../../../helpers/functions"
import { useState } from "react"
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap"
import { deleteProductAction } from "../../../actions/timer"

import { getMediaType, getMediaPreview, getMediaUrl } from "./MediaUtils"

import { connect } from "react-redux"
import { useNetStatus } from "../../../context/net"
import { FILE_BACKEND } from '../../../helpers/axiosConfig'
const Part = props => {

  const { user } = props
  const { isOnline } = useNetStatus()

  const [pause, setPause] = useState(false)
  const [moreMenu, setMoreMenu] = useState(false)

  const toggle = () => {
    setMoreMenu(!moreMenu)
  }

  const removePart = async () => {
    const res = deleteProductAction("Part", props._id, props.city)
    props.deleteProduct("Part", props._id)
    return res;
  }

  const editPart = async () => {
    props.editPart(props.idx)
  }

  const showPart = async () => {
    props.showPart(props.idx)
  }

  // authUser loading

  return (
    <div className="col-xl-4 col-lg-4 col-md-6 p-2 d-flex align-items-stretch">
      <div className="product">
        <div className="product-header justify-content-end">
          {user.role == "Personnel" || user.role == "Accounting" ? (
            ""
          ) : (
            <Dropdown isOpen={moreMenu} toggle={toggle}>
              <DropdownToggle caret>
                <span className="mdi mdi-dots-horizontal text-black-50"></span>
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={showPart}>Show</DropdownItem>
                {isOnline &&
                  <>
                    <DropdownItem onClick={editPart}>Edit</DropdownItem>
                    <DropdownItem onClick={removePart}>Remove</DropdownItem>
                  </>
                }
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
        <div className="product-preview" onClick={showPart} style={{ cursor: "pointer" }} >
          <img src={props.preview ? getMediaPreview(props.preview) : "/placeholder.png"} className="w-100 h-100" />
        </div>
        <div className="product-info">
          <div
            className="product-name w-100"
            style={{ gap: "8px", height: 72 }}
          >
            <span className="twolinedotted">{props.name}</span>
            <span
              className="text-uppercase"
              style={{ color: "rgb(77 191 91)" }}
            >
              {props.city}
            </span>
          </div>

          <div className="production-details py-3">
            <div className="product-detail">
              <span>Pounds:</span>
              <span>{props.pounds}</span>
            </div>

            <div className="product-detail">
              <span>Avg Time:</span>
              <span>{props.avgTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStatetoProps = state => {
  const user = state.Login.user
  return { user }
}

export default connect(mapStatetoProps, {})(Part)
