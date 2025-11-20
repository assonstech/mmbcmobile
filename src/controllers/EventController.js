// src/controllers/KnowledgeController.js
import http from '../common/HttpSerivce';

export const fetchAllEvents = async () => {
    try {
        const res = await http.get('/mobile/events');
        if (res.success && res.data) {
            return {
                success: true,
                data: res.data,
            };
        }
        return [];
    } catch (err) {
        return [];
    }
};

export const fetchEventDetail = async (eventId) => {
    try {
        const res = await http.get(`/mobile/events/detail/${eventId}`);
        if (res.success && res.data) {
            return {
                success: true,
                data: res.data,
            };
        }
        return [];
    } catch (err) {
        return [];
    }
};

export const unRegisterEvent = async (eventId) => {
    try {
        const res = await http.post(`/mobile/events/unregister`, {
            eventId: eventId
        });
        if (res.success && res.data) {
            return {
                success: true,
                data: res?.data,
            };
        }
        return [];
    } catch (err) {
        return [];
    }
};
export const registerEvent = async (postBody) => {
    try {
        const res = await http.post(`/mobile/events/register`, postBody);
        if (res.success) {
            return {
                success: true,
                data: res?.data,
            };
        }
        return [];
    } catch (err) {
        return [];
    }
};

export const updateAttandence = async (postBody) => {
    try {
        const res = await http.put(`/mobile/events/update`, postBody);
        if (res.success) {
            return {
                success: true,
                data: res?.data,
            };
        }
        return [];
    } catch (err) {
        return [];
    }
}
