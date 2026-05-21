import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

const ACCESS_TOKEN_KEY = "ACCESS_TOKEN";
const NON_MEMBER_PROFILE_KEY = "NON_MEMBER_PROFILE";

export const USER_TYPES = {
  MEMBER: "MEMBER",
  NON_MEMBER: "NON_MEMBER",
};

export const getAccessTokenPayload = async () => {
  try {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return null;
    return jwtDecode(token);
  } catch (err) {
    console.error("Failed to decode access token:", err);
    return null;
  }
};

export const setNonMemberProfile = async (profile) => {
  if (!profile) return;
  await AsyncStorage.setItem(NON_MEMBER_PROFILE_KEY, JSON.stringify(profile));
};

export const getNonMemberProfile = async () => {
  try {
    const profile = await AsyncStorage.getItem(NON_MEMBER_PROFILE_KEY);
    return profile ? JSON.parse(profile) : null;
  } catch (err) {
    console.error("Failed to read non-member profile:", err);
    return null;
  }
};

export const removeNonMemberProfile = async () => {
  await AsyncStorage.removeItem(NON_MEMBER_PROFILE_KEY);
};

export const getCurrentUserType = async () => {
  const payload = await getAccessTokenPayload();
  return payload?.userType || USER_TYPES.MEMBER;
};

export const isMemberUser = (userType) => userType === USER_TYPES.MEMBER;
export const isNonMemberUser = (userType) => userType === USER_TYPES.NON_MEMBER;
