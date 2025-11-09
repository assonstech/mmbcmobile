import http from "../common/HttpSerivce";

export const fetchMemberInfo = async () => {
  try {
    const res = await http.get("/member/info");
    console.log("Response:", res);

    if (res?.success && res?.data) {
      return {
        success: true,
        data: res.data,
      };
    }

    console.log("Fetch member info failed:", res?.message);
    return { success: false, message: res?.message || "Unknown error" };
  } catch (err) {
    console.log("Member info API error:", err);
    return { success: false, message: err.message || "Network error" };
  }
};

export const fetchCEO = async () => {
  try {
    const res = await http.get("/member/ceo");
    console.log("Response:", res);

    if (res?.success && res?.data) {
      return {
        success: true,
        data: res.data,
      };
    }

    console.log("Fetch ceo info failed:", res?.message);
    return { success: false, message: res?.message || "Unknown error" };
  } catch (err) {
    console.log("Member ceo info API error:", err);
    return { success: false, message: err.message || "Network error" };
  }
};

export const getMemberTypes = async () => {
  try {
    const res = await http.get("/member-types");

    if (res?.success && res?.data) {
      return {
        success: true,
        data: res.data,
      };
    }

    console.log("Fetch member types info failed:", res?.message);
    return { success: false, message: res?.message || "Unknown error" };
  } catch (err) {
    console.log("Member types info API error:", err);
    return { success: false, message: err.message || "Network error" };
  }
};


export const resetPassword = async (postBody) => {
  try {
    const res = await http.post("/member/reset-password",postBody);
    return res
  } catch (err) {
    console.log("reset password  API error:", err);
    return { success: false, message: err.message || "Network error" };
  }
};


export const changePassword = async (postBody) => {
  try {
    const res = await http.post("/member/change-password",postBody);
    return res
  } catch (err) {
    console.log("change password info API error:", err);
    return { success: false, message: err.message || "Network error" };
  }
};
