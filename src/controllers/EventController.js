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
        console.log('Fetch Events failed:', res.message);
        return [];
    } catch (err) {
        console.log('Events API error:', err);
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
        console.log('Fetch Event detail failed:', res.message);
        return [];
    } catch (err) {
        console.log('Event Detail API error:', err);
        return [];
    }
};

export const unRegisterEvent = async (eventId) => {
    try {
        const res = await http.post(`/mobile/events/unregister`, {
            eventId: eventId
        });
        console.log("unRegisterEvent response:", res);
        if (res.success && res.data) {
            return {
                success: true,
                data: res?.data,
            };
        }
        return [];
    } catch (err) {
        console.log('Event Detail API error:', err);
        return [];
    }
};
export const registerEvent = async (postBody) => {
    try {
        console.log("registerEvent postBody:", postBody);
        const res = await http.post(`/mobile/events/register`, postBody);
        console.log("register response:", res);
        if (res.success) {
            return {
                success: true,
                data: res?.data,
            };
        }
        return [];
    } catch (err) {
        console.log('Register Event API error:', err);
        return [];
    }
};

export const updateAttandence = async (postBody) => {
    try {
        const res = await http.put(`/mobile/events/update`, postBody);
        console.log("update event response:", res);
        if (res.success) {
            return {
                success: true,
                data: res?.data,
            };
        }
        return [];
    } catch (err) {
        console.log('update Event API error:', err);
        return [];
    }
}
