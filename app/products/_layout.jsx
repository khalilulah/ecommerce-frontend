import { Stack } from "expo-router";
import { useEffect } from "react";
import { setupAxiosInterceptors } from "../../utils/tokenManager";

export default function AuthLayout() {
  useEffect(() => {
    // Setup axios interceptors once when app starts
    setupAxiosInterceptors();
    // Load saved auth data
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
