import http from "../common/HttpSerivce";

export const fetchActiveSeasonalPromotions = async () => {
  try {
    const res = await http.get("/seasonal-promotions/active");
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  } catch (err) {
    console.error("Error fetching seasonal promotions:", err);
    return [];
  }
};

export const fetchSeasonalPromotionById = async (id) => {
  try {
    const res = await http.get(`/seasonal-promotions/${id}`);
    if (res.success && res.data) {
      return res.data;
    }
    return null;
  } catch (err) {
    console.error("Error fetching seasonal promotion:", err);
    return null;
  }
};
