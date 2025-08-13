import axios from "axios";
import { create } from "zustand";
import { API_URL } from "../constants/api";

export const usePaymentStore = create((set, get) => ({
  isLoading: false,
  sessionData: null,

  createCheckoutSession: async (products, token) => {
    set({ isLoading: true });
    try {
      const { data } = await axios.post(
        `${API_URL}/api/payment/create-checkout-session`,
        { products },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      set({ sessionData: data });
      return data;
    } catch (error) {
      console.log("Error creating checkout session:", error.message);
      throw new Error(error.response?.data?.message || "Payment failed");
    } finally {
      set({ isLoading: false });
    }
  },

  confirmPayment: async (sessionId, token) => {
    set({ isLoading: true });
    try {
      const { data } = await axios.post(
        `${API_URL}/api/payment/checkout-success`,
        { sessionId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    } catch (error) {
      console.log("Error confirming payment:", error.message);
      throw new Error(
        error.response?.data?.message || "Payment confirmation failed"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  // Add this one function to your existing usePaymentStore
  createPaymentSheet: async (products, token) => {
    set({ isLoading: true });
    try {
      const { data } = await axios.post(
        `${API_URL}/api/payment/payment-sheet`,
        { products },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    } catch (error) {
      console.log("Error creating payment sheet:", error.message);
      throw new Error(error.response?.data?.message || "Payment failed");
    } finally {
      set({ isLoading: false });
    }
  },

  clearSession: () => {
    set({ sessionData: null });
  },
}));
