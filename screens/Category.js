import React from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView, StyleSheet } from "react-native";

const categories = [
    { id: "1", name: "Shoes", image: "https://i.pinimg.com/236x/30/2d/cc/302dcc9247ff002e925ea60a37374004.jpg" },
    { id: "2", name: "Electronics", image: "https://i.pinimg.com/236x/e2/ac/85/e2ac8573878a0dc2e30b22b0674ce13c.jpg" },
    { id: "3", name: "Clothing", image: "https://i.pinimg.com/236x/69/12/55/6912551e5648364bc40e112a432bba29.jpg" },
    { id: "4", name: "Accessories", image: "https://i.pinimg.com/236x/7b/12/4f/7b124f42aefb35999bab0f52ebf07e85.jpg" },
    { id: "5", name: "Beauty and Hair", image: "https://i.pinimg.com/474x/d5/76/c6/d576c6e5b5c47ac557bce6ed964f3718.jpg" },
    { id: "6", name: "TVs and Woofers", image: "https://i.pinimg.com/236x/f4/c6/99/f4c699afb1fd173402398f8f770163c9.jpg" },
    { id: "7", name: "Stationary", image: "https://i.pinimg.com/236x/1c/f9/9d/1cf99d33272d0f0bba514334e86275c2.jpg" },
    { id: "8", name: "Sports", image: "https://i.pinimg.com/236x/6f/2c/5a/6f2c5a8f5b4479e5e5b4be9d927e4885.jpg" },
    { id: "9", name: "Watches and Jewellery", image: "https://i.pinimg.com/236x/78/25/92/782592b7e6d2c2308e2a0f3600e7d513.jpg" },
    { id: "10", name: "Kids Baby Products", image: "https://i.pinimg.com/236x/e0/b6/ae/e0b6aeffa213981b137c88864b36b931.jpg" },
];

const CategoryScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Categories</Text>
            <FlatList
                data={categories}
                numColumns={2}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.categoryCard}>
                        <Image source={{ uri: item.image }} style={styles.categoryImage} />
                        <Text style={styles.categoryName}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        marginTop: 30,
        backgroundColor: "#fff",
        flex: 1,
    },
    header: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color: "#333",
    },
    categoryCard: {
        flex: 1,
        margin: 10,
        backgroundColor: "#f9f9f9",
        padding: 10,
        borderRadius: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    categoryImage: {
        width: "100%",
        height: 80,
        borderRadius: 10,
        resizeMode: "cover",
    },
    categoryName: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 5,
        textAlign: "center",
    },
});

export default CategoryScreen;
