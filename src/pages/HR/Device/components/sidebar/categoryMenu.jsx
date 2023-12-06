import { useDevice } from '../../context/device.js'

export default ({
    tabs,
    tab,
    setTab,
}) => {

    const {
        device_types,
        devices,
        requests,
        consts,
    } = useDevice ()

    const onSetTab = (index) => {
        setTab(tabs[index])
    }

    return (
        <div className='category-menu'>
            {tabs?.map((item, index) => (
            <div key={`category-item-${item.id}`} className={`category-menu-item ${tab?.id==item?.id?'active':''}`} onClick={()=>onSetTab(item?.id)}>
                {item?.name}
                {item?.pending > 0 && (
                    <span className='badge badge-sx badge-error badge-color-secondary'>{item?.pending}</span>
                )}
            </div>
            ))}
        </div>
    )
}