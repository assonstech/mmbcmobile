import http from '../common/HttpSerivce';

export const sendOTP = async (email) => {
    try {
        const res = await http.post('/otp/send', {
            email: email
        });
        return res;
    } catch (err) {
        console.log('sendOTP API error:', err?.response?.data || err.message || err);
        return { success: false, message: err.message || "Network error" };
    }
};

export const verifyOTP = async (email, otp) => {
    try {
        const res = await http.post('/otp/verify', {
            email: email,
            otp: otp
        });
        return res;
    } catch (err) {
        console.log('verifyOTP API error:', err?.response?.data || err.message || err);
        return { success: false, message: err.message || "Network error" };
    }
};
