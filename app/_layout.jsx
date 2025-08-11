import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { useAuthStore } from "../store/authStore";

export default function RootLayout() {
  const { token, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // console.log(token);
    const timeout = setTimeout(() => {
      if (token) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)");
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [token]);

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeScreen>
    </SafeAreaProvider>
  );
}
