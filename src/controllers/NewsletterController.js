import http from "../common/HttpSerivce";

const getAuthConfig = async () => {
  const token = await http.getAccessToken();
  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
};

export const fetchMobileLast90DaysNewsletters = async (page = 1, pageSize = 10) => {
  try {
    const res = await http.get(
      "/newsletters/mobile/last-90-days",
      { page, pageSize },
      await getAuthConfig()
    );
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    console.log("Newsletter last 90 days failed:", res);
    return [];
  } catch (err) {
    console.error("Error fetching newsletters:", err);
    return [];
  }
};

export const fetchMobileNewslettersByDate = async (date) => {
  try {
    const res = await http.get(
      "/newsletters/mobile/by-date",
      { date },
      await getAuthConfig()
    );
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    console.log("Newsletter by date failed:", res);
    return [];
  } catch (err) {
    console.error("Error fetching newsletters by date:", err);
    return [];
  }
};

export const fetchNewsletterById = async (id) => {
  try {
    const res = await http.get(
      `/newsletters/${id}`,
      {},
      await getAuthConfig()
    );
    if (res.success && res.data) {
      return res.data;
    }
    return null;
  } catch (err) {
    console.error("Error fetching newsletter detail:", err);
    return null;
  }
};
