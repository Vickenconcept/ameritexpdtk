import axios from 'axios';

export default (consts) => ({
    getDevices: async () => {
        try {
            const res = await axios.get('/device');
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    getDevice: async (id) => {
        try {
            const res = await axios.get(`/device/${id}`);
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    createDevice: async (data) => {
        try {
            const res = await axios.post('/device', data);
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    updateDevice: async (id, data) => {
        try {
            const res = await axios.post(`/device/${id}`, data);
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    deleteDevice: async (id, data) => {
        try {
            const res = await axios.delete(`/device/${id}`, data);
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    decommissionDevice: async (id) => {
        try {
            const res = await axios.post (`/device/${id}`, {
                action: 'decommission'
            })
            return res.data
        } catch (error) {
            throw error
        }
    },
    recommissionDevice: async (id) => {
        try {
            const res = await axios.post (`/device/${id}`, {
                action: 'recommission'
            })
            return res.data
        } catch (error) {
            throw error
        }
    },
    getDeviceTypes: async () => {
        try {
            const res = await axios.get('/device/type');
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    getDeviceType: async (id) => {
        try {
            const res = await axios.get(`/device/type/${id}`);
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    createDeviceType: async (data) => {
        try {
            const res = await axios.post('/device/type', data);
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    updateDeviceType: async (id, data) => {
        try {
            const res = await axios.post(`/device/type/${id}`, data);
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    getDeviceHistory: async (id) => {
        try {
            const res = await axios.get(`/device/${id}/history`);
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    getDeviceHistoryByDate: async (id, date) => {
        try {
            const res = await axios.get(`/device/${id}/history/${date}`);
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    getDeviceHistoryByUser: async (id, user_id) => {
        try {
            const res = await axios.get(`/device/${id}/history/user/${user_id}`);
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    getHistory: async (data) => {
        try {
            const res = await axios.get('/device/history', { params: data });
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    getLogs: async (data) => {
        try {
            const res = await axios.get('/device/logs', { params: data });
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    getDeviceLogs: async (id) => {
        try {
            const res = await axios.get(`/device/${id}/logs/`);
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    getUserHistory: async (id) => {
        try {
            const url = id? `/device/user/${id}/history` : '/user/history';
            const res = await axios.get(url);
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    checkoutDeviceRequest: async (id, city, data) => {
        try {
            const res = await axios.put(`/device/${id}`, {
                type: consts.DEVICE_ACTION_TYPE_OUT,
                action: consts.DEVICE_ACTION_VALUE_REQUEST,
                approval: null,
                note: 'Please check out this device',
                city: city,
                ...data
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    checkoutDeviceCancel: async (id, _id, data) => {
        try {
            const res = await axios.put(`/device/${id}`, {
                type: consts.DEVICE_ACTION_TYPE_OUT,
                action: consts.DEVICE_ACTION_VALUE_CANCEL,
                approval: null,
                _id,
                ...data
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    checkoutDeviceAllow: async (id, _id, data) => {
        try {
            const res = await axios.put(`/device/${id}`, {
                type: consts.DEVICE_ACTION_TYPE_OUT,
                action: consts.DEVICE_ACTION_VALUE_ALLOW,
                _id,
                ...data
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    checkoutDeviceDeny: async (id, _id, data) => {
        try {
            const res = await axios.put(`/device/${id}`, {
                type: consts.DEVICE_ACTION_TYPE_OUT,
                action: consts.DEVICE_ACTION_VALUE_DENY,
                _id,
                ...data
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    checkinDeviceRequest: async (id, data) => {
        try {
            const res = await axios.put(`/device/${id}`, {
                type: consts.DEVICE_ACTION_TYPE_IN,
                action: consts.DEVICE_ACTION_VALUE_REQUEST,
                approval: null,
                note: 'Please check in this device',
                ...data
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    checkinDeviceCancel: async (id, data) => {
        try {
            const res = await axios.put(`/device/${id}`, {
                type: consts.DEVICE_ACTION_TYPE_IN,
                action: consts.DEVICE_ACTION_VALUE_CANCEL,
                ...data
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    checkinDeviceAllow: async (id, _id, data) => {
        try {
            const res = await axios.put(`/device/${id}`, {
                type: consts.DEVICE_ACTION_TYPE_IN,
                action: consts.DEVICE_ACTION_VALUE_ALLOW,
                _id,
                ...data
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    },
    checkinDeviceDeny: async (id, _id, data) => {
        try {
            const res = await axios.put(`/device/${id}`, {
                type: consts.DEVICE_ACTION_TYPE_IN,
                action: consts.DEVICE_ACTION_VALUE_DENY,
                _id,
                ...data
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    },
})