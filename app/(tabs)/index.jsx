import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import styles from "../../assets/styles/login.styles";
import Loader from "../../components/Loader";
import { API_URL } from "../../constants/api";
import COLORS from "../../constants/colors";

import { TouchableOpacity } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

const index = () => {
  const { token, logout } = useAuthStore();
  const addToCart = useCartStore((state) => state.addToCart);

  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [allCategoryProducts, setAllCategoryProducts] = useState([]); // Products for current category
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasmore] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Search states
  const [searchQuery, setSearchQuery] = useState("");

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => logout(), style: "destructive" },
    ]);
  };

  const categories = ["All", "Electronics", "Clothing", "Sports", "Furniture"];

  // SEARCH FUNCTION - filters current category's products locally
  const handleSearch = (text) => {
    setSearchQuery(text);

    if (text.trim() === "") {
      // Show all products from current category
      setProducts(allCategoryProducts);
    } else {
      // Filter current category's products by search term
      const searchResults = allCategoryProducts.filter(
        (item) =>
          item.name.toLowerCase().includes(text.toLowerCase()) ||
          item.description.toLowerCase().includes(text.toLowerCase())
      );
      setProducts(searchResults);
    }
  };

  // FETCH DATA - fetches products for specific category from server
  const fetchGoods = async (
    pageNum = 1,
    isRefreshing = false,
    category = selectedCategory
  ) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      // Use server-side category filtering
      const categoryParam =
        category && category !== "All" ? `&category=${category}` : "";
      const res = await axios.get(
        `${API_URL}/api/products/featured?page=${pageNum}&limit=6${categoryParam}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const goods = res.data.featuredProducts;

      let updatedProducts;
      if (pageNum === 1 || isRefreshing) {
        // First page or refresh - replace all products
        updatedProducts = goods;
      } else {
        // Subsequent pages - merge with existing, avoid duplicates
        updatedProducts = [
          ...new Map(
            [...allCategoryProducts, ...goods].map((p) => [p._id, p])
          ).values(),
        ];
      }

      setAllCategoryProducts(updatedProducts);
      setHasmore(pageNum < res.data.totalPages);
      setPage(pageNum);

      // Apply search filter if active
      if (searchQuery.trim() !== "") {
        const searchResults = updatedProducts.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setProducts(searchResults);
      } else {
        setProducts(updatedProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      if (error.response) {
        Alert.alert(
          "Error",
          error.response.data.message || "Failed to fetch products"
        );
      } else {
        Alert.alert("Error", "Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // CALL FETCHGOODS ANYTIME THIS PAGE LOADS
  useEffect(() => {
    fetchGoods();
  }, []);

  const loadMore = async () => {
    // Only load more if:
    // 1. There are more pages available
    // 2. Not currently loading
    // 3. Not currently searching (search works on loaded data)
    if (hasMore && !loading && searchQuery.trim() === "") {
      await fetchGoods(page + 1);
    }
  };

  // FUNCTION THAT HANDLES CATEGORY SELECTION
  const handleCategoryPress = async (category) => {
    if (category === selectedCategory) return; // Don't refetch if same category

    setSelectedCategory(category);
    setSearchQuery(""); // Clear search when changing category
    setPage(1);

    // Fetch new category data from server
    await fetchGoods(1, false, category);
  };

  // HANDLE REFRESH
  const handleRefresh = async () => {
    setPage(1);
    await fetchGoods(1, true, selectedCategory);
  };
  // Navigate to product details
  const handleProductPress = (productId) => {
    console.log("pressed");

    router.push(`/products/${productId}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setProducts(allCategoryProducts); // Show all products from current category
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleProductPress(item._id)}
      activeOpacity={0.7}
    >
      <View
        style={{
          backgroundColor: COLORS.cardBackground,
          borderWidth: 1,
          borderColor: COLORS.border,
          padding: 10,
          margin: 4,
          borderRadius: 16,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <View style={styles.bookHeader}></View>
        <View style={styles.bookImageContainer}>
          <Image
            source={{ uri: item.image }}
            style={{
              height: 200,
              width: 150,
              borderRadius: 12,
              marginVertical: 8,
            }}
            contentFit="cover"
          />
        </View>
        <View style={{ width: 150 }}>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{item.name}</Text>
          </View>
          <Text
            style={{ fontWeight: "bold", fontSize: 12, marginVertical: 20 }}
          >
            ${item.price}
          </Text>
          <Text
            style={{ fontSize: 13, color: COLORS.textSecondary }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.description}
          </Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.primary,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 12,
            paddingVertical: 10,
            elevation: 2,
            marginTop: 10,
          }}
          onPress={(event) => {
            // Prevent the parent TouchableOpacity from being triggered
            event.stopPropagation();
            console.log("Product ID being sent:", item._id);
            addToCart(item._id, token);
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "600",
            }}
          >
            Add to cart
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <Loader />;

  return (
    <View style={{ paddingHorizontal: 10 }}>
      {/* <TouchableOpacity onPress={confirmLogout}>
        <Text>LOGOUT</Text>
      </TouchableOpacity> */}

      {/* SEARCH BAR */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: COLORS.cardBackground,
          borderRadius: 25,
          paddingHorizontal: 15,

          marginVertical: 15,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={{
            flex: 1,
            marginLeft: 10,
            fontSize: 16,
            color: COLORS.textPrimary,
          }}
          placeholder={`Search in ${
            selectedCategory === "All" ? "all products" : selectedCategory
          }...`}
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Ionicons
              name="close-circle"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* SEARCH RESULTS INDICATOR */}
      {searchQuery.trim() !== "" && (
        <Text
          style={{
            fontSize: 14,
            color: COLORS.textSecondary,
            marginBottom: 10,
          }}
        >
          {products.length} result(s) for "{searchQuery}" in{" "}
          {selectedCategory === "All" ? "all categories" : selectedCategory}
        </Text>
      )}

      {/* CATEGORY FILTERS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 10 }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => handleCategoryPress(category)}
            style={{
              backgroundColor:
                selectedCategory === category ? COLORS.primary : COLORS.border,
              paddingHorizontal: 15,

              paddingTop: 3,
              paddingBottom: 8,
              borderRadius: 20,
              marginRight: 10,
            }}
          >
            <Text
              style={{
                alignSelf: "center",
                color:
                  selectedCategory === category
                    ? "white"
                    : COLORS.textSecondary,
              }}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* PRODUCTS LIST */}
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: 120 }}
        columnWrapperStyle={{
          justifyContent: "space-between",
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>BookWorm 🐛</Text>
            <Text style={styles.headerSubtitle}>
              Discover great reads from the community👇
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore && !loading && searchQuery.trim() === "" ? (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
              style={{ margin: 20 }}
            />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name={searchQuery.trim() !== "" ? "search" : "book-outline"}
              size={60}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>
              {searchQuery.trim() !== ""
                ? `No results for "${searchQuery}" in ${selectedCategory}`
                : `No ${
                    selectedCategory === "All" ? "" : selectedCategory
                  } products yet`}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery.trim() !== ""
                ? "Try a different search term or category"
                : "Check back later for new products!"}
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default index;
