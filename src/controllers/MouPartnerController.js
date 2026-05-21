import http from "../common/HttpSerivce";

export const fetchMobileMouPartners = async (page = 1, pageSize = 20) => {
  try {
    const res = await http.get("/mou-partners/mobile/list", { page, pageSize });

    if (res.success && Array.isArray(res.data)) {
      return {
        items: res.data,
        pagination: res.pagination || null,
      };
    }

    console.log("MOU partners failed:", res);
    return { items: [], pagination: null };
  } catch (err) {
    console.error("Error fetching MOU partners:", err);
    return { items: [], pagination: null };
  }
};
