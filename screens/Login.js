import React from "react";
import { View, Text, TextInput, StyleSheet, ImageBackground, Alert, TouchableOpacity } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { useState } from "react";
import { supabase } from '../supabase';

const image = { uri: 'https://i.pinimg.com/474x/1d/5c/9a/1d5c9a929b2d8b98d62ab95f0818cfb2.jpg' };

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [focusedInput, setFocusedInput] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async () => {
        if (email && password) {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;
                navigation.navigate('Home');
            } catch (error) {
                setErrorMessage('Incorrect email or Password.');
            }

        } else {
            setErrorMessage("Please enter your email and password.")
        }


    };

    return (
        <>
            <StatusBar style='dark' />
            <ImageBackground source={image} resizeMode='cover' style={styles.backgroundImage}>
                <View style={styles.container}>
                    <Text style={styles.header}>saves your money</Text>
                    <View style={styles.subcontainer}>
                        <View>
                            <Text style={styles.text}>Enter email</Text>
                            <TextInput
                                style={[styles.input, { color: focusedInput === 'input1' ? '#F0BCD4' : 'yellow' }]}
                                value={email}
                                placeholder='example@gmail.com'
                                onChangeText={setEmail}
                                onFocus={() => setFocusedInput('input1')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>
                        <View>
                            <Text style={styles.text}>Enter Password</Text>
                            <TextInput
                                style={[styles.input, { color: focusedInput === 'input2' ? '#F0BCD4' : '#000' }]}
                                value={password}
                                placeholder='********'
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCorrect={false}
                                onFocus={() => setFocusedInput('input2')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>
                        {errorMessage ? (
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        ) : null}
                    </View>

                    <TouchableOpacity onPress={() => navigation.navigate('ForgotPassScreen')}>
                        <View style={styles.forgotPasswordContainer}>
                            <Text style={styles.forgotPasswordText}>Forgot password? <Text style={styles.resetText}>Reset</Text></Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSubmit} style={styles.loginButton}>
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>Don't have an account? <Text style={styles.signupLink}>Signup</Text></Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        justifyContent: "center",
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center',
        backgroundColor: "grey"
    },
    header: {
        marginBottom: 40,
        color: "#fff",
        width: "80%",
        backgroundColor: "#000",
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
        borderRadius: 5,
        marginBottom: 25,
        borderColor: "#000",
    },
    text: {
        color: "white",
        fontSize: 18,
    },
    subcontainer: {
        width: "80%",
        padding: 15,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 5,
        backgroundColor: "white",
        borderRadius: 5,
        padding: 5,
    },
    forgotPasswordContainer: {
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    forgotPasswordText: {
        fontSize: 15,
        fontWeight: '200',
        color: "#fff",
    },
    resetText: {
        color: "darkblue",
        fontSize: 18,
    },
    loginButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 200,
        backgroundColor: "blue",
        borderRadius: 10,
        paddingVertical: 10,
        marginTop: 10,
    },
    loginButtonText: {
        fontSize: 25,
        fontWeight: '400',
        color: "#fff",
    },
    signupContainer: {
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signupText: {
        fontSize: 18,
        fontWeight: '200',
        color: "#fff",
    },
    signupLink: {
        color: "darkblue",
        fontSize: 22,
    },
});
