import React, { useEffect, useState } from 'react';
import {
    View, TextInput, Button, FlatList, Text,
    StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import supabase from '../supabase';

const ChatScreen = ({ route }) => {
    const { senderId, receiverId } = route.params || {};

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [typing, setTyping] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // // Show loading if IDs are missing
    // if (!senderId || !receiverId) {
    //     return <ActivityIndicator size="large" color="#0000ff" />;
    // }

    // // Fetch authenticated user
    // useEffect(() => {
    //     const fetchUser = async () => {
    //         try {
    //             const { data, error } = await supabase.auth.getUser();
    //             if (error || !data.user) {
    //                 console.warn("User not found, using fallback...");
    //                 setUser({ id: "123", email: "test@example.com" }); // Hardcoded user
    //             } else {
    //                 setUser(data.user);
    //             }
    //         } catch (err) {
    //             console.error("Unexpected error:", err);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchUser();
    // }, []);

    // if (loading) {
    //     return <ActivityIndicator size="large" color="#0000ff" />;
    // }

    // if (!user) {
    //     return <Text>Failed to load user.</Text>;
    // }

    // // Fetch messages
    // const fetchMessages = async () => {
    //     const { data, error } = await supabase
    //         .from('chats')
    //         .select('*')
    //         .or(`sender_id.eq.${senderId},receiver_id.eq.${senderId}`)
    //         .order('created_at', { ascending: true });

    //     if (error) console.error('Error fetching messages:', error);
    //     else setMessages(data || []);
    // };

    // useEffect(() => {
    //     fetchMessages();

    //     const subscription = supabase
    //         .channel('realtime-chat')
    //         .on(
    //             'postgres_changes',
    //             { event: 'INSERT', schema: 'public', table: 'chats' },
    //             (payload) => {
    //                 setMessages((prevMessages) => [...prevMessages, payload.new]);
    //             }
    //         )
    //         .subscribe();

    //     return () => {
    //         supabase.removeChannel(subscription);
    //     };
    // }, []);

    // // Handle "Typing..." indicator
    // const handleTyping = async (isTyping) => {
    //     setTyping(isTyping);

    //     await supabase
    //         .from('typing_status')
    //         .upsert([{ user_id: senderId, is_typing: isTyping }]);
    // };

    // // Listen for typing status changes
    // useEffect(() => {
    //     const subscription = supabase
    //         .channel('typing-indicator')
    //         .on(
    //             'postgres_changes',
    //             { event: 'UPDATE', schema: 'public', table: 'typing_status' },
    //             (payload) => {
    //                 if (payload.new.user_id === receiverId) {
    //                     setTyping(payload.new.is_typing);
    //                 }
    //             }
    //         )
    //         .subscribe();

    //     return () => {
    //         supabase.removeChannel(subscription);
    //     };
    // }, []);

    // // Send message
    // const sendMessage = async () => {
    //     if (message.trim() === '') return;

    //     const { error } = await supabase
    //         .from('chats')
    //         .insert([{ sender_id: senderId, receiver_id: receiverId, message, created_at: new Date().toISOString() }]);

    //     if (error) console.error('Error sending message:', error);
    //     else {
    //         setMessage('');
    //         handleTyping(false);
    //     }
    // };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={[
                        styles.messageContainer,
                        item.sender_id === senderId ? styles.myMessage : styles.theirMessage
                    ]}>
                        <Text style={styles.messageText}>{item.message}</Text>
                        <Text style={styles.timestamp}>{moment(item.created_at).format('h:mm A')}</Text>
                    </View>
                )}
            />

            {typing && <Text style={styles.typingIndicator}>Typing...</Text>}

            <View style={styles.inputContainer}>
                <TextInput
                    value={message}
                    onChangeText={(text) => {
                        setMessage(text);
                        handleTyping(true);
                    }}
                    placeholder="Type a message..."
                    style={styles.input}
                />
                <Button title="Send" />
            </View>
            <View>
                <Text>Welcome, {user?.email || "Guest"}!</Text>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f0f0f0',
    },
    messageContainer: {
        padding: 10,
        marginVertical: 5,
        borderRadius: 10,
        maxWidth: '80%',
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#DCF8C6',
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#EAEAEA',
    },
    messageText: {
        fontSize: 16,
    },
    timestamp: {
        fontSize: 12,
        color: 'gray',
        textAlign: 'right',
    },
    typingIndicator: {
        fontStyle: 'italic',
        color: 'gray',
        textAlign: 'left',
        paddingHorizontal: 10,
        marginBottom: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#ccc',
        padding: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginRight: 10,
    },
});

export default ChatScreen;
