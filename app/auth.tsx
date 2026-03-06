import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAuth(type: 'LOGIN' | 'SIGNUP') {
    setLoading(true);
    const { error } = type === 'LOGIN' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) Alert.alert("Auth Error", error.message);
    else if (type === 'SIGNUP') Alert.alert("Success", "Check your email for a confirmation link!");
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Sign in to manage your tasks</Text>
      
      <TextInput 
        placeholder="Email" 
        style={styles.input} 
        onChangeText={setEmail} 
        autoCapitalize="none" 
        keyboardType="email-address"
      />
      <TextInput 
        placeholder="Password" 
        style={styles.input} 
        onChangeText={setPassword} 
        secureTextEntry 
      />
      
      <TouchableOpacity onPress={() => handleAuth('LOGIN')} disabled={loading} style={styles.btnPrimary}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => handleAuth('SIGNUP')} disabled={loading} style={styles.btnSecondary}>
        <Text style={styles.btnTextDark}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: '800', color: '#1a1a1a' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30, marginTop: 5 },
  input: { backgroundColor: '#f5f5f5', padding: 18, borderRadius: 12, marginBottom: 15, fontSize: 16 },
  btnPrimary: { backgroundColor: '#000', padding: 18, borderRadius: 12, marginBottom: 10, height: 60, justifyContent: 'center' },
  btnSecondary: { padding: 18 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  btnTextDark: { color: '#000', textAlign: 'center', fontWeight: '500' }
});