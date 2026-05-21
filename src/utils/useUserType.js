import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  getAccessTokenPayload,
  getCurrentUserType,
  getNonMemberProfile,
  isMemberUser,
  isNonMemberUser,
} from "./auth";

export const useUserType = () => {
  const [userType, setUserType] = useState(null);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadUserType = async () => {
        setLoading(true);
        const decodedPayload = await getAccessTokenPayload();
        const currentUserType = await getCurrentUserType();
        const nonMemberProfile = await getNonMemberProfile();
        const mergedPayload =
          currentUserType === "NON_MEMBER"
            ? { ...decodedPayload, ...nonMemberProfile }
            : decodedPayload;

        if (isActive) {
          setPayload(mergedPayload);
          setUserType(currentUserType);
          setLoading(false);
        }
      };

      loadUserType();

      return () => {
        isActive = false;
      };
    }, [])
  );

  return {
    loading,
    payload,
    userType,
    isMember: isMemberUser(userType),
    isNonMember: isNonMemberUser(userType),
  };
};
