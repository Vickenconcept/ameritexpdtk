import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import deviceAction from "../action";

import { useModal, ModalProvider } from "../../../../components/Common/Modal/promise-modal/index.jsx"
import { EditModal } from '../components/EditModal';
import TypeModal from '../components/TypeModal';
import { AlertModal } from '../../../../components/Common/Modal/AlertModal';


export const DeviceContext = createContext(null);

export const useDevice = () => useContext(DeviceContext);

export const DeviceProvider = ({
    children,
    user,
    canEdit,
}) => {
    const [device, setDevice] = useState(null)
    const [devices, setDevices] = useState([])
    const [device_type, setDeviceType] = useState(null);
    const [device_types, setDeviceTypes] = useState([])
    const [loading, setLoading] = useState(false);
    const [consts, setConsts] = useState({})
    const [user_history, setUserHistory] = useState([])
    const [requests, setRequests] = useState({})
    const [now, setNow] = useState(0);


    const { create: createAlert, resolve: resolveAlert } = useModal(AlertModal, {
        instanceId: "alert",
        title: "Alert!",
        text: "Some Information",
        confirmText: "Done",
        showConfirmButton: true,
    })

    const deviceActions = useMemo(() => {
        return deviceAction(consts)
    }, [consts])

    const openAlert = (title, text) => {
        createAlert({ title, text })
    }

    const closeAlert = () => {
        resolveAlert()
    }

    const onSuccess = (res) => {
        console.log(res)
        if (res?.device) {
            reloadAll()
        }
    }

    const onError = (err) => {
        console.log(err)
    }

    const { create: createEditModal, resolve: destroyEditModal } = useModal(EditModal, {
        instanceId: "edit-device",
        // backdrop: "static",
        // keyboard: false,
        deviceContext: DeviceContext,
        edit: false,
        item: null,
        resolve: onSuccess,
        reject: onError,
        openAlert,
        closeAlert,
        device_types,
        deviceAction: deviceActions,
    })

    const openNewModal = () => {
        console.log('open')
        createEditModal({
            edit: false,
            item: null,
        }).then(onSuccess).catch(onError)
    }

    const openEditModal = (item) => {
        console.log('open')
        createEditModal({
            edit: true,
            item,
        }).then(onSuccess).catch(onError)
    }

    const { create: createTypeModal, resolve: destroyTypeModal } = useModal(TypeModal, {
        instanceId: "edit-device-type",
        backdrop: "static",
        keyboard: false,
        openAlert,
        closeAlert,
        device_types,
        deviceAction,
    })

    const openDevTypeModal = () => {
        createTypeModal({
            edit: false,
            item: null,
        }).then((res) => {
            console.log(res)
            reloadAll()
        }).catch(onError)
    }

    const onChangeDeviceType = (e) => {
        setDeviceType(e.target.value)
    }

    const onChangeDevice = (e) => {
        let dId = e.target.value;
        if (dId && dId != '') {
            setDevice(devices.find(item => item._id == dId))
        } else {
            setDevice(null)
        }
    }

    const loadDeviceTypes = async (dependent = false) => {
        if (!dependent) setLoading(true)
        const { deviceTypes: res_device_types } = await deviceActions.getDeviceTypes()
        if (res_device_types) {
            setDeviceTypes(res_device_types)
        }
        if (!dependent) setLoading(false)
    }

    const loadDevices = async (dependent = false) => {
        if (!dependent) setLoading(true)
        const { devices: res_devices, constants } = await deviceActions.getDevices()
        if (res_devices) {
            setDevices(res_devices)
        } else {
            setDevices([])
        }
        if (constants && constants !== {}) {
            setConsts(constants)
        }
        if (!dependent) setLoading(false)
    }

    const loadUserHistory = async (dependent = false) => {
        if (!dependent) setLoading(true)
        const { data: res_user_history } = await deviceActions.getUserHistory(user._id)
        if (res_user_history) {
            setUserHistory(res_user_history)
        }
        if (!dependent) setLoading(false)
    }

    const loadRequests = async (dependent = false) => {
        if (!canEdit) return setRequests({})
        if (!dependent) setLoading(true)
        let res = await deviceActions.getHistory({
            status: 'pending'
        })
        console.log(res.data)
        setRequests(res.data || {})
        if (!dependent) setLoading(false)
    }

    const reloadAll = async () => {
        setLoading(true)
        try {
            await loadDevices(true)
            // after this, constants are ready so that we can user them for loading other data
            await Promise.all([
                loadDeviceTypes(true),
                loadUserHistory(true),
                loadRequests(true),
            ])
        } catch (error) {
            console.error(error)
        }
        setLoading(false)
    }

    const device_options = useMemo(() => {
        if (device_type && devices && consts && user_history) {
            let options = devices.filter(
                item => item.type?._id == device_type
                    && item.status == consts['DEVICE_STATUS_IDLE']
            )
            return options
        }
        return []
    }, [device_type, devices, consts, user_history])

    const user_devices = useMemo(() => {
        if (devices && consts) {
            let options = devices.filter(
                item => item.user?._id == user._id
                    && item.status == consts['DEVICE_STATUS_USING']
            )
            return options
        }
        return []
    }, [devices, consts])

    const getDeviceType = useCallback((id) => {
        if (device_types && device_types.length > 0) {
            return device_types.find(item => item._id == id)
        }
        return null
    }, [device_types])

    useEffect(() => {
        // if (device_types.length > 0) {
        //     setDeviceType(device_types[0]._id)
        // }
        setDeviceType(null)
    }, [device_types])

    useEffect(() => {
        setDevice(prev => {
            if (!device_options || device_options.length == 0) return null;
            if (prev) {
                return device_options.find(item => item._id == prev._id) || device_options[0]
            } else {
                // return device_options[0]
                return null
            }
        })
    }, [device_options])

    useEffect(async () => {
        await reloadAll()
    }, [])

    return (
        <DeviceContext.Provider value={{
            canEdit,
            consts,
            devices,
            device_types,
            device,
            user_history,
            device_type,
            device_options,
            user_devices,
            requests,
            reloadAll,
            loading,
            setLoading,
            deviceAction: deviceActions,
            onChangeDeviceType,
            onChangeDevice,

            getDeviceType,

            openNewModal,
            openEditModal,
            openAlert,
        }}>
            {children}
        </DeviceContext.Provider>
    )
}