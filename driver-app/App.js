import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, TextInput } from 'react-native';
import * as Location from 'expo-location';
import io from 'socket.io-client';
import axios from 'axios';

// Replace '192.168.1.10' with your machine's local IP address when testing on device
const BACKEND_URL = 'http://192.168.1.10:3000';
const socket = io(BACKEND_URL);

export default function App() {
  const [token, setToken] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [incomingRide, setIncomingRide] = useState(null);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');

  const loginDriver = async () => {
       try {
          const res = await axios.post(`${BACKEND_URL}/auth/login`, { phone, password });
          setToken(res.data.access_token);
           socket.disconnect();
          socket.io.opts.extraHeaders = {
              authorization: `Bearer ${res.data.access_token}`
          };
          socket.connect();
       } catch (e) {
           Alert.alert("Login Failed", e.message);
       }
  };

  const registerDriver = async () => {
      try {
          const res = await axios.post(`${BACKEND_URL}/auth/register`, {
              phone,
              password,
              fullName,
              role: 'DRIVER'
            });
          setToken(res.access_token); // Service returns login response on register
          Alert.alert("Registered!", "Wait for admin approval.");
      } catch (e) {
          Alert.alert("Registration Failed");
      }
  };

  useEffect(() => {
      socket.on('newRideRequest', (ride) => {
          Alert.alert("New Ride!", `From: ${ride.originAddress}`);
          setIncomingRide(ride);
      });
  }, []);

  useEffect(() => {
      if (isOnline && token) {
          const interval = setInterval(async () => {
              const loc = await Location.getCurrentPositionAsync({});
              socket.emit('updateLocation', {
                  lat: loc.coords.latitude,
                  lng: loc.coords.longitude
              });
          }, 5000);
          return () => clearInterval(interval);
      }
  }, [isOnline, token]);

  const acceptRide = async () => {
      if (!incomingRide) return;
      try {
          await axios.post(`${BACKEND_URL}/rides/${incomingRide.id}/accept`, {}, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setIncomingRide(null); // Clear request, enter active mode
          Alert.alert("Ride Accepted");
      } catch (e) {
          Alert.alert("Error", "Could not accept ride");
      }
  };

  return (
    <View style={styles.container}>
      {!token ? (
          <View style={{ width: '80%' }}>
              <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} />
              <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

              {isRegistering && (
                  <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
              )}

              <Button title={isRegistering ? "Register" : "Login"} onPress={isRegistering ? registerDriver : loginDriver} />
              <Button title={isRegistering ? "Switch to Login" : "Switch to Register"} onPress={() => setIsRegistering(!isRegistering)} color="gray" />
          </View>
      ) : (
          <View>
              <Text>Driver Status: {isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
              <Button title={isOnline ? "Go Offline" : "Go Online"} onPress={() => setIsOnline(!isOnline)} />

              {incomingRide && (
                  <View style={styles.request}>
                      <Text>New Ride Request!</Text>
                      <Text>Est: {incomingRide.estimatedPrice} ALL</Text>
                      <Button title="Accept" onPress={acceptRide} />
                  </View>
              )}
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  request: { marginTop: 20, padding: 20, backgroundColor: '#eee' },
  input: { borderWidth: 1, padding: 10, marginVertical: 5, width: '100%' }
});
