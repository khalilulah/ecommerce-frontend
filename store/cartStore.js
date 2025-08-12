import axios from "axios";
import { create } from "zustand";
import { API_URL } from "../constants/api";

export const useCartStore = create((set, get) => ({
  cartItems: [],

  fetchCart: async (token) => {
    try {
      const { data } = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log("API response:", data);
      set({ cartItems: data });
      // console.log(get().cartItems);
    } catch (error) {
      console.log("Error fetching cart:", error.message);
    }
  },

  addToCart: async (productId, token) => {
    try {
      await axios.post(
        `${API_URL}/api/cart`,
        { productId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // console.log(token);
      // console.log(productId);

      await get().fetchCart(token); // refresh cart
    } catch (err) {
      console.log("Error adding to cart:", err.message);
    }
  },
  removeFromCart: async (productId, token) => {
    try {
      await axios.delete(`${API_URL}/api/cart/${productId}`, {
        data: { productId },
        headers: { Authorization: `Bearer ${token}` },
      });
      await get().fetchCart(token); // refresh cart
    } catch (error) {
      console.log("Error removing from cart:", error.message);
    }
  },

  // NEW: Increment quantity
  incrementQuantity: async (productId, token) => {
    try {
      await axios.patch(
        `${API_URL}/api/cart/${productId}/increment`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await get().fetchCart(token); // refresh cart
    } catch (error) {
      console.log("Error incrementing quantity:", error.message);
    }
  },

  // NEW: Decrement quantity
  decrementQuantity: async (productId, token) => {
    try {
      await axios.patch(
        `${API_URL}/api/cart/${productId}/decrement`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await get().fetchCart(token); // refresh cart
    } catch (error) {
      console.log("Error decrementing quantity:", error.message);
    }
  },
}));
