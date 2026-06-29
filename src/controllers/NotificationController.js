import http from "../common/HttpSerivce";
import { getAccessTokenPayload } from "../utils/auth";

const fetchNotificationList = async (path, page = 1, limit = 10) => {
  try {
    const payload = await getAccessTokenPayload();
    const userId = payload?.memberId || payload?.userId || payload?.id;
    const res = await http.get(path, { page, limit, userId });

    if (res.success && res.data) {
      return {
        notifications: Array.isArray(res.data.notifications)
          ? res.data.notifications
          : [],
        pagination: {
          total: res.data.total || 0,
          page: res.data.page || page,
          limit: res.data.limit || limit,
          totalPages: res.data.totalPages || 1,
        },
      };
    }

    console.log("Notifications failed:", res);
    return { notifications: [], pagination: null };
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return { notifications: [], pagination: null };
  }
};

export const fetchGeneralNotifications = (page = 1, limit = 10) => (
  fetchNotificationList("/notifications/general", page, limit)
);

export const fetchPaymentNotifications = (page = 1, limit = 10) => (
  fetchNotificationList("/notifications/payment", page, limit)
);
