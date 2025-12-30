import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import io from 'socket.io-client';
import axios from 'axios';

// Replace '192.168.1.10' with your machine's local IP address when testing on device
const BACKEND_URL = 'http://192.168.1.10:3000';
const socket = io(BACKEND_URL);

export default function App() {
  const [region, setRegion] = useState({
    latitude: 41.3275, // Tirana
    longitude: 19.8187,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [token, setToken] = useState(null);
  const [phone, setPhone] = useState('0690000001');
  const [ride, setRide] = useState(null);

  // Simple Login
  const login = async () => {
      try {
          const res = await axios.post(`${BACKEND_URL}/auth/login`, { phone, password: 'password' });
          setToken(res.data.access_token);
          // Reconnect socket with token
          socket.disconnect();
          socket.auth = { token: res.data.access_token }; // or headers
          socket.io.opts.extraHeaders = {
              authorization: `Bearer ${res.data.access_token}`
          };
          socket.connect();
      } catch (e) {
          Alert.alert("Login Failed", "Make sure user exists");
      }
  };

  useEffect(() => {
      socket.on('rideUpdate', (data) => {
          console.log('Ride Update:', data);
          setRide(data);
          if (data.status === 'ACCEPTED') Alert.alert("Driver Found!");
      });
  }, []);

  const requestRide = async () => {
      if (!token) return Alert.alert("Please login first");
      try {
          const res = await axios.post(`${BACKEND_URL}/rides/request`, {
              originLat: region.latitude,
              originLng: region.longitude,
              destLat: region.latitude + 0.01, // Mock dest
              destLng: region.longitude + 0.01,
              originAddress: "Tirana Center",
              destAddress: "Blloku"
          }, { headers: { Authorization: `Bearer ${token}` } });
          setRide(res.data);
      } catch (e) {
          console.error(e);
      }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} />
      <View style={styles.ui}>
          {!token ? (
             <View>
                 <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" />
                 <Button title="Login / Register" onPress={login} />
             </View>
          ) : (
              <View>
                  <Text>Status: {ride ? ride.status : 'Idle'}</Text>
                  {ride && <Text>Price: {ride.estimatedPrice} ALL</Text>}
                  <Button title="Request Ride" onPress={requestRide} />
              </View>
          )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  ui: { position: 'absolute', bottom: 50, left: 20, right: 20, backgroundColor: 'white', padding: 20, borderRadius: 10 },
  input: { borderWidth: 1, marginBottom: 10, padding: 8 }
});
