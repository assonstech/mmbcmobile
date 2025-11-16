import { ht } from "date-fns/locale";
import http from "../common/HttpSerivce";
import axios from "axios";

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
    const res = await http.post("/member/reset-password", postBody);
    return res
  } catch (err) {
    console.log("reset password  API error:", err);
    return { success: false, message: err.message || "Network error" };
  }
};


export const changePassword = async (postBody) => {
  try {
    const res = await http.post("/member/change-password", postBody);
    return res
  } catch (err) {
    console.log("change password info API error:", err);
    return { success: false, message: err.message || "Network error" };
  }
};

export const getECMembers = async () => {
  try {
    const res = await http.get('/member/ecmembers');
    return res;
  } catch (err) {
    console.error('Error fetching ECmembers:', err);
    return [];
  }
};

export const updateIsDefaultPassword = async (isDefaultPassword) => {
  try {
    const res = await http.post('/member/update-is-default-password', {
      isDefaultPassword,
    });
    return res;
  } catch (err) {
    console.error('Error updating isDefaultPassword:', err);
    return { success: false, message: err.message };
  }
};

export const updateCompanyOrIndividualImage = async (imagePath) => {
  try {
    const res = await http.post('/member/update-member-image', {
      imagePath,
    });
    return res;
  } catch (err) {
    console.error('Error updating member image:', err);
    return { success: false, message: err.message };
  }
};

export const deleteImage = async (filename) => {
  console.log("filename", filename)
  if (!filename) return;

  try {
    const res = await api.delete("member/member-upload", {
      data: { filename }  // Axios requires "data" for DELETE body
    });

    return res.data;
  } catch (err) {
    console.error("Error deleting image:", err);
  }
};

export const changeProfileImage = async (file, fieldName = "profileImage") => {
    if (!file) return null;

    try {
        let uri = file.path || file.uri;
        if (!uri) return null;

        // iOS fix
        if (Platform.OS === "ios" && uri.startsWith("file://")) {
            uri = uri.replace("file://", "");
        }

        const formData = new FormData();
        formData.append(fieldName, {
            uri,
            type: file.mime || "image/jpeg",
            name: file.filename || `upload_${Date.now()}.jpg`,
        });

        const res = await http.post(`/member/single-upload/${fieldName}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (res?.data?.success) return res.data;

        console.error("Upload failed. API response:", res?.data);
        return null;
    } catch (err) {
        console.error("Profile image upload failed:", err);
        return null;
    }
};

export const getTownshipsByCode = async (code) => {
  try {
    const res = await http.get(`/nrc/townships/${code}`);
    console.log("res",res)
    return res.data;
  } catch (err) {
    console.error('Error fetching townships:', err);
    return [];
  }
};

export const getNrcTypes = async () => {
  try {
    const res = await http.get('/nrc/types');
    console.log("res",res)
    return res.data;
  } catch (err) {
    console.error('Error fetching NRC types:', err);
    return [];
  }
};

export const createMember = async (postBody) => {
  try {
    console.log("post",postBody)
    const res = await http.post("/member/register-member", postBody)
    return res
  } catch (err) {
    console.log(err)
  }
}

async function validateEmailZeroBounce(email) {
    const apiKey = "12cb3b1fdc9e48caabea46ce34c40537"; 
    const url = `https://api.zerobounce.net/v2/validate?api_key=${apiKey}&email=${email}`;

    try {
        const res = await axios.get(url);
        return res.data;
    } catch (err) {
        console.error("ZeroBounce error:", err);
        return null;
    }
}

