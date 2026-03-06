import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import AuthPage from '../auth';

export default function TodoApp() {
  const [session, setSession] = useState<any>(null);
  const [task, setTask] = useState('');
  const [todos, setTodos] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Listen for Auth Changes (Run once)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch data when session changes (Run only when user ID changes)
  useEffect(() => {
    if (session?.user?.id) fetchTodos();
  }, [session?.user?.id]);

  const fetchTodos = async () => {
    setRefreshing(true);
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setTodos(data);
    if (error) console.error(error);
    setRefreshing(false);
  };

  const addTodo = async () => {
    if (!task.trim()) return;
    const { error } = await supabase.from('todos').insert([{ task, user_id: session.user.id }]);
    if (!error) {
      setTask('');
      fetchTodos();
    }
  };

  const toggleTodo = async (id: string, is_completed: boolean) => {
    const { error } = await supabase.from('todos').update({ is_completed: !is_completed }).eq('id', id);
    if (!error) fetchTodos();
  };

  if (!session) return <AuthPage />;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>My Tasks</Text>
        <TouchableOpacity onPress={() => supabase.auth.signOut()}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput 
          value={task} 
          onChangeText={setTask} 
          placeholder="What needs to be done?" 
          style={styles.input} 
        />
        <TouchableOpacity onPress={addTodo} style={styles.addBtn}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchTodos} />}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => toggleTodo(item.id, item.is_completed)} 
            style={styles.todoItem}
          >
            <View style={[styles.checkbox, item.is_completed && styles.checked]} />
            <Text style={[styles.todoText, item.is_completed && styles.completedText]}>
              {item.task}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 25, paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  header: { fontSize: 28, fontWeight: '800' },
  logoutText: { color: '#ff4444', fontWeight: '600' },
  inputContainer: { flexDirection: 'row', marginBottom: 30 },
  input: { flex: 1, backgroundColor: '#f0f0f0', padding: 15, borderRadius: 12, marginRight: 10, fontSize: 16 },
  addBtn: { backgroundColor: '#000', paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  todoItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#000', marginRight: 15 },
  checked: { backgroundColor: '#000' },
  todoText: { fontSize: 16, color: '#333' },
  completedText: { textDecorationLine: 'line-through', color: '#aaa' },
});