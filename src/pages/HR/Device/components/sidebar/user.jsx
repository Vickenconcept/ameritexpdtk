import { avatar2url } from "../../../../../helpers/functions"
import sampleAvatar from "../../../../../assets/images/users/avatar-2.jpg"

export default ({ user, name = null }) => {
    const { firstName, lastName, avatar } = (user || {
        firstName: 'John',
        lastName: 'Doe',
        avatar: null,
    })

    return (<div className="device-user">
        <div className='avatar'>
            <img src={avatar2url(avatar) || sampleAvatar} alt='avatar' />
        </div>
        <div className='name'>
            <span>{name == null ? `${firstName}${lastName}` : name}</span>
        </div>
    </div>
    )
}