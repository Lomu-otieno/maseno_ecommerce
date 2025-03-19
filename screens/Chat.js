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
