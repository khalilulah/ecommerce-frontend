import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from "../../constants/api";
import COLORS from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

const ProductDetails = () => {
  const { id } = useLocalSearchParams(); // This should be your product ID
  const router = useRouter();
  // const navigation = useNavigation();
  const { token } = useAuthStore();
  const addToCart = useCartStore((state) => state.addToCart);

  // id from useLocalSearchParams (this is the correct approach for Expo Router)
  const productId = id;

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Fetch product details
  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProduct(res.data.product);

      // Fetch related products after getting product details
      if (res.data.product.category) {
        await fetchRelatedProducts(res.data.product.category, productId);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Already handled by axios interceptor (redirect + alert once)
        return;
      }
      console.error("Error fetching product details:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch product details"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch related products in same category
  const fetchRelatedProducts = async (category, excludeId) => {
    try {
      setRelatedLoading(true);
      const res = await axios.get(
        `${API_URL}/api/products/featured?category=${category}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Filter out the current product from related products
      const filtered = res.data.featuredProducts.filter(
        (item) => item._id !== excludeId
      );
      setRelatedProducts(filtered.slice(0, 6)); // Show max 6 related products
    } catch (error) {
      if (error.response?.status === 401) return;
      console.error("Error fetching related products:", error);
      // Don't show error for related products, just log it
    } finally {
      setRelatedLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const handleAddToCart = () => {
    addToCart(product._id, token);
    // Optional: Show success message
    Alert.alert("Success", "Product added to cart!");
  };

  const handleRelatedProductPress = (relatedProductId) => {
    // Use Expo Router navigation
    router.push(`/products/${relatedProductId}`);
  };

  const renderRelatedProduct = ({ item }) => (
    <TouchableOpacity
      style={{
        backgroundColor: COLORS.cardBackground,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 10,
        margin: 4,
        borderRadius: 12,
        width: 140,
      }}
      onPress={() => handleRelatedProductPress(item._id)}
    >
      <Image
        source={{ uri: item.image }}
        style={{
          height: 120,
          width: "100%",
          borderRadius: 8,
          marginBottom: 8,
        }}
        contentFit="cover"
      />
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: COLORS.textPrimary,
          marginBottom: 4,
        }}
        numberOfLines={2}
      >
        {item.name}
      </Text>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "bold",
          color: COLORS.primary,
        }}
      >
        ${item.price}
      </Text>
    </TouchableOpacity>
  );

  // Add a check for productId
  if (!productId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Ionicons name="alert-circle" size={60} color={COLORS.textSecondary} />
        <Text style={{ marginTop: 10, color: COLORS.textSecondary }}>
          No product ID provided
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 20,
            backgroundColor: COLORS.primary,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.textSecondary }}>
          Loading product details...
        </Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Ionicons name="alert-circle" size={60} color={COLORS.textSecondary} />
        <Text style={{ marginTop: 10, color: COLORS.textSecondary }}>
          Product not found
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 20,
            backgroundColor: COLORS.primary,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header with back button */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          paddingTop: 10, // Account for status bar
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: 8,
            borderRadius: 20,
            backgroundColor: COLORS.cardBackground,
          }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: COLORS.textPrimary,
            marginLeft: 16,
            flex: 1,
          }}
        >
          Product Details
        </Text>
      </View>

      {/* Product Image */}
      <View style={{ paddingHorizontal: 16 }}>
        <Image
          source={{ uri: product.image }}
          style={{
            width: "100%",
            height: 300,
            borderRadius: 16,
            marginBottom: 20,
          }}
          contentFit="cover"
        />
      </View>

      {/* Product Info */}
      <View style={{ paddingHorizontal: 16 }}>
        {/* Category Badge */}
        <View
          style={{
            backgroundColor: COLORS.primary + "20",
            alignSelf: "flex-start",
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: COLORS.primary,
              fontWeight: "600",
            }}
          >
            {product.category}
          </Text>
        </View>

        {/* Product Name */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: COLORS.textPrimary,
            marginBottom: 8,
          }}
        >
          {product.name}
        </Text>

        {/* Price */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: COLORS.primary,
            marginBottom: 20,
          }}
        >
          ${product.price}
        </Text>

        {/* Description */}
        <View style={{ marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: COLORS.textPrimary,
              marginBottom: 8,
            }}
          >
            Description
          </Text>
          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              color: COLORS.textSecondary,
            }}
          >
            {product.description}
          </Text>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.primary,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 30,
            elevation: 2,
          }}
          onPress={handleAddToCart}
        >
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            Add to Cart
          </Text>
        </TouchableOpacity>

        {/* You Might Also Like Section */}
        <View style={{ marginBottom: 30 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: COLORS.textPrimary,
              }}
            >
              You might also like
            </Text>
            {relatedLoading && (
              <ActivityIndicator size="small" color={COLORS.primary} />
            )}
          </View>

          {relatedProducts.length > 0 ? (
            <FlatList
              data={relatedProducts}
              renderItem={renderRelatedProduct}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
            />
          ) : (
            !relatedLoading && (
              <View
                style={{
                  padding: 20,
                  alignItems: "center",
                  backgroundColor: COLORS.cardBackground,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <Ionicons
                  name="search"
                  size={40}
                  color={COLORS.textSecondary}
                />
                <Text
                  style={{
                    marginTop: 8,
                    color: COLORS.textSecondary,
                    fontSize: 14,
                  }}
                >
                  No related products found
                </Text>
              </View>
            )
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default ProductDetails;
