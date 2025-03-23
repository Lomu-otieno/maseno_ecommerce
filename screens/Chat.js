import React, { useState, useEffect } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    FlatList
} from "react-native";
import { supabase } from "../supabase";

const ChatScreen = ({ route, navigation }) => {
    const [email, setEmail] = useState(route.params?.email || null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchEmail = async () => {
            if (!email) {
                console.warn("No email found in route params, fetching from Supabase...");
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    console.log("Fetched email from Supabase:", user.email);
                    setEmail(user.email);
                } else {
                    console.warn("No user found in Supabase session");
                }
            }
        };

        fetchEmail();
    }, []);

    useEffect(() => {
        if (!email) return; // Stop if email is still missing

        const fetchMessages = async () => {
            console.log("Fetching messages for email:", email);

            const { data, error } = await supabase
                .from("users_messages")
                .select("message, response, timestamp")
                .eq("email", email)
                .order("timestamp", { ascending: false });

            if (error) {
                console.error("Error fetching messages:", error);
            } else {
                console.log("Fetched messages:", data);
                setMessages(data);
            }
        };

        fetchMessages();
    }, [email]);

    const handleSendMessage = async () => {
        if (!message.trim()) return;
        setLoading(true);

        if (!email) {
            Alert.alert("Error", "No email found. Please login again.");
            setLoading(false);
            return;
        }

        const { error } = await supabase
            .from("users_messages")
            .insert([{ email, message }]);

        if (error) {
            Alert.alert("Error", "Failed to send message.");
            console.error("Error sending message:", error);
        } else {
            setMessage(""); // Clear input after sending
            setMessages([{ message, response: "", timestamp: new Date() }, ...messages]); // Update UI immediately
        }

        setLoading(false);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <FlatList
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.messageContainer}>
                        <Text style={styles.userMessage}>{item.message}</Text>
                        <Text style={styles.responseMessage}>{item.response || "No response yet"}</Text>
                    </View>
                )}
                inverted // Show latest messages at the bottom
            />

            <View style={styles.inputContainer}>
                <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Type your message..."
                    style={styles.input}
                    placeholderTextColor="#aaa"
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSendMessage}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Send</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    messageContainer: {
        backgroundColor: "#252525",
        padding: 15,
        borderRadius: 10,
        marginVertical: 5,
    },
    userMessage: {
        color: "#fff",
        fontSize: 16,
    },
    responseMessage: {
        color: "#00C851",
        fontSize: 14,
        marginTop: 5,
        fontStyle: "italic",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#333",
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    input: {
        flex: 1,
        color: "#fff",
        fontSize: 16,
    },
    button: {
        backgroundColor: "#007AFF",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default ChatScreen;
