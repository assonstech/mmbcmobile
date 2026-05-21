import http from "../common/HttpSerivce";

const getErrorMessage = (err, fallback) => {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
};

const normalizeEmailStatus = (res) => {
  const data = res?.data || {};
  const rawStatus = (
    data.status ||
    data.type ||
    data.accountType ||
    data.userType ||
    data.existsAs ||
    data.role ||
    ""
  )
    .toString()
    .toLowerCase();
  const message = (res?.message || "").toLowerCase();

  if (
    data.isMember ||
    data.userType === "MEMBER" ||
    message.includes("registered as a member") ||
    (rawStatus.includes("member") && !rawStatus.includes("non"))
  ) {
    return "member";
  }

  if (
    data.isNonMember ||
    data.isNonmember ||
    data.userType === "NON_MEMBER" ||
    rawStatus.includes("non-member") ||
    rawStatus.includes("nonmember") ||
    rawStatus.includes("non_member")
  ) {
    return "nonMember";
  }

  if (data.exists === true || data.isExisting === true) {
    return "nonMember";
  }

  return "new";
};

export const checkNonMemberEmail = async (email) => {
  try {
    const response = await http.apiClient.post("/member/check-non-member-email", { email });
    const res = response.data;

    if (!res?.success) {
      const status = normalizeEmailStatus(res);
      return {
        success: status === "member" || status === "nonMember" || status === "new",
        message: res?.message || "Failed to check email",
        data: res?.data,
        status,
      };
    }

    return {
      success: true,
      message: res.message,
      data: res.data,
      status: normalizeEmailStatus(res),
    };
  } catch (err) {
    const message = getErrorMessage(err, "Network error");
    const status = normalizeEmailStatus({ message, data: err?.response?.data?.data });

    return {
      success: status === "member" || status === "nonMember",
      message,
      data: err?.response?.data?.data,
      status,
    };
  }
};

export const sendNonMemberOTP = async (email) => {
  try {
    const response = await http.apiClient.post("/otp/send-non-member-otp", { email });
    return response.data;
  } catch (err) {
    return { success: false, message: getErrorMessage(err, "Failed to send OTP") };
  }
};

export const verifyNonMemberOTP = async ({
  email,
  otp,
  representiveName,
  phone,
}) => {
  try {
    const response = await http.apiClient.post("/otp/verify-non-member-otp", {
      email,
      otp,
      representiveName,
      companyOrIndividualName: representiveName,
      phone,
    });
    return response.data;
  } catch (err) {
    return { success: false, message: getErrorMessage(err, "Failed to verify OTP") };
  }
};
