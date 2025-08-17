import axios from "axios";
import { create } from "zustand";
import { API_URL } from "../constants/api";

export const useCartStore = create((set, get) => ({
  cartItems: [],
  totalAmount: 0,

  // Helper function to calculate total amount
  calculateTotal: (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  fetchCart: async (token) => {
    try {
      const { data } = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({
        cartItems: data.cartItems || data,
        totalAmount: data.totalAmount || 0,
      });
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
      await get().fetchCart(token); // refresh cart
    } catch (err) {
      console.log("Error adding to cart:", err.message);
    }
  },

  removeFromCart: async (productId, token) => {
    // OPTIMISTIC UPDATE: Remove item immediately
    const currentItems = get().cartItems;
    const updatedItems = currentItems.filter((item) => item._id !== productId);
    const newTotal = get().calculateTotal(updatedItems);

    set({
      cartItems: updatedItems,
      totalAmount: newTotal,
    });

    try {
      await axios.delete(`${API_URL}/api/cart/${productId}`, {
        data: { productId },
        headers: { Authorization: `Bearer ${token}` },
      });
      // Optionally refresh to ensure sync with server
      // await get().fetchCart(token);
    } catch (error) {
      console.log("Error removing from cart:", error.message);
      // ROLLBACK: Restore original state on error
      set({
        cartItems: currentItems,
        totalAmount: get().calculateTotal(currentItems),
      });
    }
  },

  incrementQuantity: async (productId, token) => {
    // OPTIMISTIC UPDATE: Increment immediately
    const currentItems = get().cartItems;
    const updatedItems = currentItems.map((item) =>
      item._id === productId ? { ...item, quantity: item.quantity + 1 } : item
    );
    const newTotal = get().calculateTotal(updatedItems);

    set({
      cartItems: updatedItems,
      totalAmount: newTotal,
    });

    try {
      await axios.patch(
        `${API_URL}/api/cart/${productId}/increment`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.log("Error incrementing quantity:", error.message);
      // ROLLBACK: Restore original state on error
      set({
        cartItems: currentItems,
        totalAmount: get().calculateTotal(currentItems),
      });
    }
  },

  decrementQuantity: async (productId, token) => {
    // OPTIMISTIC UPDATE: Decrement immediately
    const currentItems = get().cartItems;
    const updatedItems = currentItems
      .map((item) =>
        item._id === productId ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0); // Remove items with 0 quantity

    const newTotal = get().calculateTotal(updatedItems);

    set({
      cartItems: updatedItems,
      totalAmount: newTotal,
    });

    try {
      await axios.patch(
        `${API_URL}/api/cart/${productId}/decrement`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.log("Error decrementing quantity:", error.message);
      // ROLLBACK: Restore original state on error
      set({
        cartItems: currentItems,
        totalAmount: get().calculateTotal(currentItems),
      });
    }
  },

  clearCart: async (token) => {
    // OPTIMISTIC UPDATE: Clear immediately
    const currentItems = get().cartItems;
    const currentTotal = get().totalAmount;

    set({
      cartItems: [],
      totalAmount: 0,
    });

    try {
      await axios.delete(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.log("Error clearing cart:", error.message);
      // ROLLBACK: Restore original state on error
      set({
        cartItems: currentItems,
        totalAmount: currentTotal,
      });
    }
  },
}));
