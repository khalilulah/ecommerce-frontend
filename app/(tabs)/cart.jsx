import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import COLORS from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

export default function CartScreen() {
  const { token } = useAuthStore();
  const {
    cartItems,
    fetchCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
  } = useCartStore();

  useEffect(() => {
    fetchCart(token);
  }, [token]);

  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId, token);
  };

  const handleIncrement = async (productId) => {
    await incrementQuantity(productId, token);
  };

  const handleDecrement = async (productId) => {
    await decrementQuantity(productId, token);
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.productImage} />

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>

        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Qty: {item.quantity}</Text>

          {/* Quantity Controls */}
          <View style={styles.quantityControls}>
            {/* Decrement Button */}
            <TouchableOpacity
              style={[styles.quantityButton, styles.decrementButton]}
              onPress={() => handleDecrement(item._id)}
            >
              <Ionicons name="remove" size={18} color="white" />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            {/* Increment Button */}
            <TouchableOpacity
              style={[styles.quantityButton, styles.incrementButton]}
              onPress={() => handleIncrement(item._id)}
            >
              <Ionicons name="add" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleRemoveItem(item._id)}
      >
        <Ionicons name="trash-outline" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="cart-outline"
            size={80}
            color={COLORS.textSecondary}
          />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>
            Add some items to get started!
          </Text>
        </View>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  listContainer: {
    padding: 16,
  },
  cartItem: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityLabel: {
    fontSize: 14,
    color: "#666",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  decrementButton: {
    backgroundColor: "#ff6b6b",
  },
  incrementButton: {
    backgroundColor: "#51cf66",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 12,
    minWidth: 30,
    textAlign: "center",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
