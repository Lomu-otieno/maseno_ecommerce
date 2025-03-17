import { View, Text, Image, StyleSheet, Button } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import BottomBar from "./components/BottomBar";
const dummyProducts = [
    { id: 25, name: "Nike Shoes", price: 49.99, description: "Comfortable running shoes", image_url: "https://i.pinimg.com/236x/64/7c/ad/647cad16ede10f3ac32e84c8f14831e9.jpg" },
    { id: 26, name: "Samsung TV", price: 599.99, description: "Smart 4K UHD TV", image_url: "https://i.pinimg.com/236x/3c/c5/b1/3cc5b125b70261a93cb9700ae0953f97.jpg" },
];

const ProductDetails = () => {
    const route = useRoute();

    const navigation = useNavigation();

    const { productId } = route.params || {}; // Handle missing params

    const product = dummyProducts.find((p) => p.id === Number(productId));

    console.log("Received productId:", productId);
    console.log("Received productId (raw):", route.params?.productId);
    console.log("Converted productId:", Number(productId));
    console.log("Dummy product IDs:", dummyProducts.map(p => p.id));
    console.log("Matching Product:", product);



    if (!product) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Product not found</Text>
                <Button title="Go Back" onPress={() => navigation.goBack()} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Image source={{ uri: product.image_url }} style={styles.image} />
            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.description}>{product.description}</Text>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {/* <Button title="Buy Now" onPress={() => navigation.navigate("Checkout", { productId })} />
            <Button title="Back to Products" onPress={() => navigation.goBack()} /> */}
            <BottomBar />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    image: {
        width: 450,
        height: 450,
        resizeMode: "contain",
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    description: {
        fontSize: 18,
        color: "gray",
        textAlign: "center",
        marginBottom: 10,
    },
    price: {
        fontSize: 20,
        color: "#fff",
        fontWeight: "bold",
        marginBottom: 20,
        padding: 20,
        backgroundColor: "green",
        borderRadius: 10,
    },
    errorText: {
        fontSize: 20,
        color: "red",
        marginBottom: 10,
    },
});

export default ProductDetails;
