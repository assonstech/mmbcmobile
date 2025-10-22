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
