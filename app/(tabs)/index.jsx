import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Alert, FlatList, ScrollView, Text, View } from "react-native";
import styles from "../../assets/styles/login.styles";
import Loader from "../../components/Loader";
import { API_URL } from "../../constants/api";
import COLORS from "../../constants/colors";

import { TouchableOpacity } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

const index = () => {
  const { token, logout } = useAuthStore();

  // state => state.addToCart is a selector

  //That arrow function means: “From the store’s state, give me only the addToCart function.” You’re not grabbing all of state, only state.addToCart
  const addToCart = useCartStore((state) => state.addToCart);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => logout(), style: "destructive" },
    ]);
  };
  const categories = ["All", "Electronics", "Clothing", "Sports", "Furniture"];

  // FETCH DATA

  const fetchGoods = async () => {
    try {
      setLoading(true);
      console.log("Calling:", `${API_URL}/api/auth/login`);
      const res = await axios.get(`${API_URL}/api/products/featured`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Axios automatically parses JSON, so no need for response.json()
      const goods = res.data.featuredProducts;

      setProducts(goods);

      setAllProducts(goods);
    } catch (error) {
      // Axios errors may contain response data from the server
      if (error.response) {
        console.log(
          "Error fetching books:",
          error.response.data.message || error.message
        );
      } else {
        console.log("Error fetching books:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // CALL FETCHGOODS ANYTIME THIS PAGE LOADS
  useEffect(() => {
    fetchGoods();
  }, []);

  // FUNCTION THAT SORTS PRODUCT BASED ON THE CATEGORY
  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      setProducts(allProducts);
    } else {
      setProducts(allProducts.filter((item) => item.category === category));
    }
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
          numberOfLines={2} // limit to 3 lines
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
      <TouchableOpacity onPress={confirmLogout}>
        <Text>LOGOUT</Text>
      </TouchableOpacity>
      {/* START OF CATEGORY */}
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
      {/* END OF CATEGORY */}

      {/* START OF FLAT LIST */}
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 80 }}
        columnWrapperStyle={{
          justifyContent: "space-between", // space between the two columns
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>BookWorm 🐛</Text>
            <Text style={styles.headerSubtitle}>
              Discover great reads from the community👇
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={60}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>No recommendations yet</Text>
            <Text style={styles.emptySubtext}>
              Be the first to share a book!
            </Text>
          </View>
        }
      />
      {/* END OF FLAT LIST */}
    </View>
  );
};

export default index;
