import http from "../common/HttpSerivce";

export const fetchMobileMemberDirectories = async (page = 1, pageSize = 20) => {
  try {
    const res = await http.get("/member-directories/mobile/list", { page, pageSize });

    if (res.success && Array.isArray(res.data)) {
      return {
        items: res.data,
        pagination: res.pagination || null,
      };
    }

    console.log("Member directories failed:", res);
    return { items: [], pagination: null };
  } catch (err) {
    console.error("Error fetching member directories:", err);
    return { items: [], pagination: null };
  }
};

export const fetchMobileMemberDirectoryDetail = async (id) => {
  try {
    const res = await http.get(`/member-directories/mobile/detail/${id}`);
    console.log("res",res)

    if (res.success && res.data) {
      return res.data;
    }

    console.log("Member directory detail failed:", res);
    return null;
  } catch (err) {
    console.error("Error fetching member directory detail:", err);
    return null;
  }
};
