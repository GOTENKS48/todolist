/**
 * TaskOrbit - React Native To-Do Application
 * Features user authentication (JWT), MongoDB Node.js backend integration,
 * Redux Toolkit state management, and Smart Urgency & Priority mixing algorithm.
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, useAppDispatch, useAppSelector } from './src/redux/store';
import { loadStoredSession } from './src/redux/slices/authSlice';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { Colors } from './src/theme/colors';
import { CustomIcon } from './src/components/CustomIcon';

const MainNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isInitializing } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Attempt session hydration from AsyncStorage
    dispatch(loadStoredSession());
  }, [dispatch]);

  // Splash / Loading State
  if (isInitializing) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.splashBadge}>
          <CustomIcon name="flame" size={40} color={Colors.primaryLight} />
        </View>
        <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
      </View>
    );
  }

  // Render AuthScreen or HomeScreen based on Redux authentication state
  return isAuthenticated ? <HomeScreen /> : <AuthScreen />;
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <MainNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashBadge: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  spinner: {
    marginTop: 10,
  },
});
