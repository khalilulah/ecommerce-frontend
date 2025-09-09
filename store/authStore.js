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
  // register
  register: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "something went wrong");

      // ✅ your backend sends "newUser"
      const safeUser = {
        id: data.newUser._id,
        name: data.newUser.username,
        email: data.newUser.email,
      };

      await AsyncStorage.setItem("user", JSON.stringify(safeUser));
      await AsyncStorage.setItem("token", data.token);

      set({ token: data.token, user: safeUser, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // login
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "something went wrong");

      // ✅ your backend sends "data.user"
      const safeUser = {
        id: data.data.user._id,
        name: data.data.user.username,
        email: data.data.user.email,
      };

      await AsyncStorage.setItem("user", JSON.stringify(safeUser));
      await AsyncStorage.setItem("token", data.data.token);

      set({ token: data.data.token, user: safeUser, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
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
