import { Ionicons } from "@expo/vector-icons";
import { useStripe } from "@stripe/stripe-react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { usePaymentStore } from "../../store/paymentStore";

export default function PaymentScreen() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { cartItems, totalAmount, fetchCart } = useCartStore();
  const { createPaymentSheet, isLoading } = usePaymentStore();

  // Stripe hooks
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [paymentSheetReady, setPaymentSheetReady] = useState(false);

  useEffect(() => {
    fetchCart(token);
  }, [token]);

  // Initialize PaymentSheet
  const initializePaymentSheet = async () => {
    try {
      if (!cartItems || cartItems.length === 0) return;

      const paymentSheetData = await createPaymentSheet(cartItems, token);

      const { error } = await initPaymentSheet({
        merchantDisplayName: "Your Store Name",
        customerId: paymentSheetData.customer,
        customerEphemeralKeySecret: paymentSheetData.ephemeralKey,
        paymentIntentClientSecret: paymentSheetData.paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: "Customer Name", // You can get this from user store
        },
      });

      if (!error) {
        setPaymentSheetReady(true);
      }
    } catch (error) {
      console.log("PaymentSheet initialization error:", error);
    }
  };

  // Initialize PaymentSheet when cart is loaded
  useEffect(() => {
    if (cartItems.length > 0) {
      initializePaymentSheet();
    }
  }, [cartItems]);

  // Handle PaymentSheet payment
  const handlePaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error: ${error.code}`, error.message);
    } else {
      Alert.alert("Success", "Your payment is confirmed!");
      // Clear cart and navigate to success screen
      router.replace("/success"); // or wherever you want to navigate
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
        <Text style={styles.quantity}>Qty: {item.quantity}</Text>
      </View>
      <Text style={styles.itemTotal}>
        ${Math.round(item.price * item.quantity)}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Processing payment...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      {/* Order Summary */}
      <Text style={styles.sectionTitle}>Order Summary</Text>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No items to checkout</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            style={styles.orderList}
            showsVerticalScrollIndicator={false}
          />

          {/* Total Section */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>${totalAmount}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping:</Text>
              <Text style={styles.totalValue}>Free</Text>
            </View>
            <View style={[styles.totalRow, styles.finalTotal]}>
              <Text style={styles.finalTotalLabel}>Total:</Text>
              <Text style={styles.finalTotalValue}>${totalAmount}</Text>
            </View>
          </View>

          {/* Payment Buttons */}
          <View style={styles.paymentButtons}>
            {/* Primary: PaymentSheet (Native) */}
            <TouchableOpacity
              style={[
                styles.payButton,
                !paymentSheetReady && styles.payButtonDisabled,
              ]}
              onPress={handlePaymentSheet}
              disabled={!paymentSheetReady || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="card-outline" size={20} color="white" />
                  <Text style={styles.payButtonText}>Pay Now</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Alternative: Web Checkout */}
            {/* <TouchableOpacity
              style={[styles.webPayButton]}
              onPress={handleWebPayment}
              disabled={isLoading}
            >
              <Ionicons name="globe-outline" size={20} color={COLORS.primary} />
              <Text style={styles.webPayButtonText}>Pay in Browser</Text>
            </TouchableOpacity> */}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    margin: 16,
    color: COLORS.black,
  },
  orderList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  orderItem: {
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
    width: 60,
    height: 60,
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
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 2,
  },
  quantity: {
    fontSize: 12,
    color: "#666",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  totalSection: {
    backgroundColor: "white",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
  },
  totalValue: {
    fontSize: 16,
    color: COLORS.black,
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  paymentButtons: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  payButtonDisabled: {
    backgroundColor: "#ccc",
  },
  payButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  webPayButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    height: 48,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  webPayButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
