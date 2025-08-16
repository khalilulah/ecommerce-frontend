import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Image } from "expo-image";
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

  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
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

  // SEARCH FUNCTION
  const handleSearch = (text) => {
    setSearchQuery(text);
    applyFilters(allProducts, text, selectedCategory);
  };

  // UNIFIED FILTER FUNCTION - applies search and category filters to the given product list
  const applyFilters = (productList, search, category) => {
    let filtered = productList;

    // Apply category filter first
    if (category !== "All") {
      filtered = filtered.filter((item) => item.category === category);
    }

    // Apply search filter
    if (search.trim() !== "") {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase()) ||
          item.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    setProducts(filtered);
  };

  // FETCH DATA - always fetches all products for client-side filtering
  const fetchGoods = async (pageNum = 1, isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      const res = await axios.get(
        `${API_URL}/api/products/featured?page=${pageNum}&limit=6`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const goods = res.data.featuredProducts;

      let uniqueGoods;
      if (pageNum === 1 || isRefreshing) {
        // First page or refresh - replace all products
        uniqueGoods = goods;
      } else {
        // Subsequent pages - merge with existing, avoid duplicates
        uniqueGoods = [
          ...new Map(
            [...allProducts, ...goods].map((p) => [p._id, p])
          ).values(),
        ];
      }

      setAllProducts(uniqueGoods);
      setHasmore(pageNum < res.data.totalPages);
      setPage(pageNum);

      // Apply current filters after fetching
      applyFilters(uniqueGoods, searchQuery, selectedCategory);
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
    // 3. Not currently searching (since search works on local data)
    if (hasMore && !loading && searchQuery.trim() === "") {
      await fetchGoods(page + 1);
    }
  };

  // FUNCTION THAT HANDLES CATEGORY SELECTION
  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    // Apply filters to existing data
    applyFilters(allProducts, searchQuery, category);
  };

  // HANDLE REFRESH
  const handleRefresh = async () => {
    setPage(1);
    await fetchGoods(1, true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    applyFilters(allProducts, "", selectedCategory);
  };

  const renderItem = ({ item }) => (
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
        <Text style={{ fontWeight: "bold", fontSize: 12, marginVertical: 20 }}>
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
        onPress={() => {
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
          paddingVertical: 0,
          marginTop: 15,
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
          placeholder="Search products..."
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
          {products.length} result(s) for "{searchQuery}"
        </Text>
      )}

      {/* CATEGORY FILTERS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 10 }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => handleCategoryPress(category)}
            style={{
              backgroundColor:
                selectedCategory === category ? COLORS.primary : COLORS.border,
              paddingHorizontal: 15,
              paddingVertical: 8,
              borderRadius: 20,
              marginRight: 10,
            }}
          >
            <Text
              style={{
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
                ? `No results for "${searchQuery}"`
                : "No recommendations yet"}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery.trim() !== ""
                ? "Try a different search term"
                : "Be the first to share a book!"}
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default index;
