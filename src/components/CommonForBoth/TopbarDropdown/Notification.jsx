// import { Link } from "react-router-dom"
import { notification_types } from "context/notification"
import { useNotification } from "context/notification.js"

export default ({item, idx}) => {
  const {removeNotification} = useNotification()
  return (
    <div onClick={()=>{removeNotification(idx)}} className="text-reset notification-item">
      <div className="d-flex">
        <div className="avatar-xs me-3">
            {item.type==notification_types.NOTIFICATION_TYPE_TIMER_ATTATCH?
            <span className="avatar-title bg-success rounded-circle font-size-16">
              <i className="mdi mdi-clock-start"></i>
            </span>
            :
            <span className="avatar-title bg-danger rounded-circle font-size-16">
              <i className="mdi mdi-clock-end"></i>
            </span>
            }
        </div>
        <div className="flex-1">
          <h6 className="mt-0 mb-1">
          {item.type==notification_types.NOTIFICATION_TYPE_TIMER_ATTATCH?"Timer Attached":"Timer Detached"}
          </h6>
          <div className="font-size-12 text-muted">
            <p className="mb-1">
              {item.content}
            </p>
            <p className="mb-1">
              {item.time}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}