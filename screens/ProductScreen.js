import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRoute } from "@react-navigation/native";
import { supabase } from "../supabase";
import { useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

const ProductScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { categoryId, categoryName } = route.params;
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from("products")
                .select("id, name, price, category_id, image_url")
                .eq("category_id", categoryId);

            if (error) throw error;

            console.log("Fetched Products:", data);
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{categoryName}</Text>
            {products.length === 0 ? (
                <Text style={styles.noProducts}>No products found.</Text>
            ) : (

                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    renderItem={({ item }) => (

                        <TouchableOpacity onPress={() => navigation.navigate('ProductDetails', { productId: item.id })} style={styles.productCard}>
                            <Image
                                source={{ uri: item.image_url }}
                                style={styles.productImage}
                                onError={() => console.log("Image failed to load:", item.image_url)}
                            />
                            <Text style={styles.productName}>{item.name}</Text>
                            <Text style={styles.productPrice}>Kshs. {item.price}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: "#fff" },
    header: { fontSize: 24, fontWeight: "bold", marginBottom: 10, textAlign: "center", padding: 20 },
    noProducts: { textAlign: "center", marginTop: 20, fontSize: 16 },
    row: { justifyContent: "space-between" },
    productCard: {
        flex: 1,
        margin: 5,
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 10,
        alignItems: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    productImage: {
        width: "100%",
        height: 180,
        borderRadius: 10,
        resizeMode: "contain",
    },
    productName: { fontSize: 16, fontWeight: "bold", marginTop: 5 },
    productPrice: { fontSize: 14, color: "green", marginTop: 3 },
});

export default ProductScreen;