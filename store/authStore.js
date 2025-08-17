// import { isLoading } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { API_URL } from "../constants/api";
// const router = useRouter();
export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,
  isAuthenticated: false,

  // register user authentication
  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "something went wrong");
      const safeUser = {
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
      };

      await AsyncStorage.setItem("user", JSON.stringify(safeUser));
      await AsyncStorage.setItem("token", data.data.token);
      set({ token: data.data.token, user: safeUser, isLoading: false });
      // if (router) {
      //   router.replace("/(tabs)");
      // }
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  //login
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      // console.log(response);

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "something went wrong");
      const safeUser = {
        id: data.data.user._id,
        name: data.data.user.name,
        email: data.data.user.email,
      };

      await AsyncStorage.setItem("user", JSON.stringify(safeUser));
      await AsyncStorage.setItem("token", data.data.token);
      // ("");
      console.log(data.data.token);
      console.log(safeUser, "safe");

      set({ token: data.data.token, user: safeUser, isLoading: false });
      // if (router) {
      //   router.replace("/(tabs)");
      // }

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      const errorMessage = error.message || "An unexpected error occurred";
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  forceLogout: async () => {
    const { logout } = get();
    await logout();

    // You can add additional logic here like showing notifications
    console.log("User logged out due to token expiry");
  },

  //check Authentication
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("user");

      const jsonUser = user ? JSON.parse(user) : null;

      set({
        token,
        user: jsonUser,
        isLoading: false,
        isInitialized: true,
        isAuthenticated: !!token,
      });
    } catch (error) {
      console.log(error);
      set({
        token: null, // ✅ Add these
        user: null,
        isLoading: false,
        isInitialized: true,
        isAuthenticated: false,
      });
    }
  },

  //logout
  logout: async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      // const jsonUser = user ? JSON.parse(user) : null;
      // if (router) {
      //   router.replace("/(auth)");
      // }
      set({
        token: null, // ✅ This was broken before
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.log(error);
    }
  },
}));
