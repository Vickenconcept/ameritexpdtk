import {Card, Row, Col} from "reactstrap"

import { useModal } from "../../../../components/Common/Modal/promise-modal/index.js"
import {AlertModal} from "../../../components/Common/Modal/AlertModal"
import {ConfirmModal} from "../../../components/Common/Modal/ConfirmModal"

const PhotoItem = ({name, image, tag, removeItem, updateItem, edit=true, removed=false, modified=false, idx, redoItem, uploading=false}) => {

    const { create: createAlert } = useModal(AlertModal, {
      instanceId: "alert",
      title: "Alert!",
      text: "Some Information",
      confirmText: "OK",
    })

    const alert = (text) => {
      createAlert({text}).then(()=>{}).catch(()=>{})
    }
    const updateItemAction = (e) => {
        const {name, value} = e.target
        if (name === 'name' && (value.length > 50 || value.trim() == '')) return
        updateItem(idx, name, value.trim())
    }

    const onChangeName = (e) => {
      e.stopPropagation()
      e.preventDefault()
      const userInput = prompt ("Please enter a new name", name)
      if (userInput != null && userInput.trim() !== '') {
          updateItemAction ({target: {name: 'name', value: userInput.trim()}})
      } else {
          alert ('Please enter a valid name')
      }
    }

    const onRedo = () => {
        redoItem (idx)
    }

    return (
      <Card
        className={`photos-list-item mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete ${removed?'removed':''} ${modified?'modified':''}`}
      >
        <div className="p-0">
            <Row className="align-items-center">
              <Col className="col-auto">
                  <img
                  data-dz-thumbnail=""
                  height="80"
                  className="avatar-sm rounded bg-light"
                  alt={'IMG'}
                  src={image}
                  />
              </Col>
              <Col>
                  <div
                  className="text-muted font-weight-bold singlelinedotted"
                  >
                  {tag}
                  </div>
                  <p className="mb-0 singlelinedotted">
                    <strong>{name}</strong>
                  </p>
              </Col>
              <div className="actions-container">
                {edit && !uploading &&
                  <div className='action-item modify-item' onClick={onChangeName}><i className='mdi mdi-pencil'></i></div>
                }
                {edit &&
                    (removed ? 
                    <div className='action-item recover-item' onClick={()=>removeItem(idx, false)}><i className="fa fa-recycle"></i></div> 
                    : 
                    <div className='action-item remove-item' onClick={()=>removeItem(idx, true)}><i className='fa fa-trash'></i></div>
                    )
                }
                {/* {
                    modified && 
                    <div className='action-item modify-item' onClick={onRedo}><i className='fa fa-exclamation'></i></div>
                } */}
              </div>
            </Row>
        </div>
      </Card>
    )
}

export default PhotoItem
