// app/(payment)/success.js
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import COLORS from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { usePaymentStore } from "../../store/paymentStore";

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { clearCart } = useCartStore();
  const { confirmPayment } = usePaymentStore();
  const [isProcessing, setIsProcessing] = useState(true);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  useEffect(() => {
    // In a real app, you'd get this from the redirect URL
    // For now, we'll simulate it
    handlePaymentSuccess();
  }, []);

  const handlePaymentSuccess = async () => {
    try {
      // In a real app, you'd extract session_id from the URL
      // For now, we'll use the stored session data
      const sessionId = "dummy_session_id"; // This would come from URL params

      // Confirm payment with backend
      await confirmPayment(sessionId, token);

      // Clear the cart
      await clearCart(token);

      setOrderConfirmed(true);
    } catch (error) {
      console.log("Error confirming payment:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const goToHome = () => {
    router.replace("/(tabs)");
  };

  const goToOrders = () => {
    router.push("/(tabs)/orders"); // Assuming you have an orders screen
  };

  if (isProcessing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.processingText}>Confirming your payment...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        </View>

        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.message}>
          Thank you for your purchase. Your order has been confirmed and will be
          processed shortly.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={goToOrders}>
            <Text style={styles.primaryButtonText}>View Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={goToHome}>
            <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    maxWidth: 300,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  processingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
  buttonContainer: {
    width: "100%",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
