import { StatusBar } from 'expo-status-bar';
import { supabase } from '../supabase';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ImageBackground, TouchableOpacity, Alert } from 'react-native';

const image = { uri: 'https://i.pinimg.com/474x/d3/5a/6a/d35a6aa5a6df2a3c9ee33262a7431c2d.jpg' };
//https://i.pinimg.com/736x/11/78/c2/1178c29f5583d756c10be715ee789933.jpg
const SignupScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [focusedInput, setFocusedInput] = useState(null);

    const handleSignup = async () => {
        if (!email || !password || !username) {
            setErrorMessage("Please enter all required fields");
            return;
        }

        try {
            // Sign up user with Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { username } }
            });

            if (error) throw error;
            if (!data?.user?.id) throw new Error("Signup failed. Try again.");

            // Store additional user details in 'users_details' table
            const { error: profileError } = await supabase
                .from('users_details')
                .insert([{ email, username }]);

            if (profileError) throw profileError;

            // Redirect to Login Screen
            Alert.alert("Link sent to your email dress", "Confirm your registration")
            navigation.navigate('Login');
        } catch (error) {
            setErrorMessage(error.message || "Signup failed. Check your internet connection.");
        }
    };

    return (
        <>
            <StatusBar style='dark' />
            <ImageBackground source={image} resizeMode='contain' style={styles.backgroundImage}>
                <View style={styles.container}>
                    <Text style={styles.header}>Sign Up</Text>
                    <View style={styles.subcontainer}>
                        <Text style={styles.text}>Username</Text>
                        <TextInput
                            style={[styles.input, { color: focusedInput === 'input1' ? '#360568' : 'blue' }]}
                            value={username}
                            placeholder='Enter your username'
                            placeholderTextColor='#360568'
                            onChangeText={setUsername}
                            onFocus={() => setFocusedInput('input1')}
                            onBlur={() => setFocusedInput(null)}
                        />

                        <Text style={styles.text}>Email</Text>
                        <TextInput
                            style={[styles.input, { color: focusedInput === 'input2' ? '#360568' : 'blue' }]}
                            value={email}
                            placeholder='example@gmail.com'
                            placeholderTextColor='#360568'
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onChangeText={setEmail}
                            onFocus={() => setFocusedInput('input2')}
                            onBlur={() => setFocusedInput(null)}
                        />

                        <Text style={styles.text}>Password</Text>
                        <TextInput
                            style={[styles.input, { color: focusedInput === 'input3' ? '#360568' : 'blue' }]}
                            value={password}
                            placeholder='********'
                            placeholderTextColor='#360568'
                            secureTextEntry
                            autoCorrect={false}
                            onChangeText={setPassword}
                            onFocus={() => setFocusedInput('input3')}
                            onBlur={() => setFocusedInput(null)}
                        />

                        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                    </View>

                    <TouchableOpacity onPress={handleSignup} style={styles.button}>
                        <Text style={styles.buttonText}>Signup</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginText}>
                            Already have an account? <Text style={styles.loginLink}>Login</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </>
    );
};

export default SignupScreen;

// 🔹 Styles
const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        justifyContent: "center"
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center',
    },
    header: {
        marginBottom: 40,
        color: "#fff",
        backgroundColor: "#000",
        width: "80%",
        height: 40,
        textAlign: 'center',
        fontSize: 25,
        borderRadius: 5,
        padding: 4,
    },
    input: {
        fontSize: 18,
        padding: 10,
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        borderColor: "#000",
    },
    text: {
        color: "#000",
        fontSize: 18,
    },
    subcontainer: {
        width: "80%",
        padding: 15,
    },
    button: {
        backgroundColor: "green",
        borderRadius: 10,
        width: 200,
        alignItems: 'center',
        paddingVertical: 10,
        marginTop: 10,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: "#fff",
    },
    errorText: {
        backgroundColor: "#fff",
        color: "red",
        fontSize: 16,
        textAlign: 'center',
        borderRadius: 5,
        padding: 5,
        marginTop: 5,
    },
    loginText: {
        marginTop: 30,
        fontSize: 18,
        color: "#000",
    },
    loginLink: {
        color: "darkblue",
        fontSize: 20,
        fontWeight: "bold",
    },
});
