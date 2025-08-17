import axios from "axios";
import { Alert } from "react-native";
import { useAuthStore } from "../store/authStore";

let isRedirecting = false;
let alertShown = false;
export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && !isRedirecting && !alertShown) {
        isRedirecting = true;
        alertShown = true;
        const { logout } = useAuthStore.getState();
        logout();
        Alert.alert("Session Expired", "Please log in again.", [
          {
            text: "OK",
            onPress: async () => {
              // router.replace("/(auth)"); // ✅ redirect just once
              setTimeout(() => {
                isRedirecting = false;
                alertShown = false;
              }, 1000);
              // ✅ NOW ROUTER IS USED
            },
          },
        ]);
      }
      return Promise.reject(error);
    }
  );
};
