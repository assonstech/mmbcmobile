import http from "../common/HttpSerivce";

export const fetchNotifications = async (page = 1, limit = 10) => {
  try {
    const res = await http.get("/notifications", { page, limit });

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
