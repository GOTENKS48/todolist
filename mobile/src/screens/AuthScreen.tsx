import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { loginUser, registerUser, clearAuthError } from '../redux/slices/authSlice';
import { CustomIcon } from '../components/CustomIcon';

export const AuthScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleToggleMode = (newMode: 'LOGIN' | 'REGISTER') => {
    setMode(newMode);
    dispatch(clearAuthError());
    setValidationError('');
  };

  const handleQuickDemo = () => {
    setMode('LOGIN');
    setEmail('test@example.com');
    setPassword('password123');
    dispatch(clearAuthError());
    setValidationError('');
  };

  const handleSubmit = async () => {
    setValidationError('');
    dispatch(clearAuthError());

    // Basic Validation
    if (!email.trim() || !password.trim()) {
      setValidationError('Please fill in both email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'LOGIN') {
      await dispatch(loginUser({ email: email.trim(), password }));
    } else {
      await dispatch(
        registerUser({
          email: email.trim(),
          password,
          name: name.trim() || 'Task Champion',
        })
      );
    }
  };

  const displayError = validationError || error;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <CustomIcon name="flame" size={32} color={Colors.primaryLight} />
          </View>
          <Text style={styles.brandTitle}>TaskOrbit</Text>
          <Text style={styles.brandSubtitle}>
            Smart Task Priority & Deadline Management
          </Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          {/* Segmented Auth Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, mode === 'LOGIN' && styles.tabActive]}
              onPress={() => handleToggleMode('LOGIN')}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.tabText, mode === 'LOGIN' && styles.tabTextActive]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, mode === 'REGISTER' && styles.tabActive]}
              onPress={() => handleToggleMode('REGISTER')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === 'REGISTER' && styles.tabTextActive,
                ]}
              >
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {displayError ? (
            <View style={styles.errorBanner}>
              <CustomIcon name="alert" size={14} color={Colors.danger} />
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          ) : null}

          {/* Name Field (Register only) */}
          {mode === 'REGISTER' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <CustomIcon name="user" size={16} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Alex Mercer"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <CustomIcon name="mail" size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  setValidationError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <CustomIcon name="lock" size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  setValidationError('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.showPassText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {mode === 'LOGIN' ? 'Sign In to Dashboard' : 'Register Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Quick Demo Credentials shortcut */}
          <View style={styles.demoDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or test instantly</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleQuickDemo}
            activeOpacity={0.7}
          >
            <CustomIcon name="sparkles" size={14} color={Colors.secondary} />
            <Text style={styles.demoButtonText}>Fill Demo Credentials</Text>
          </TouchableOpacity>
        </View>

        {/* Feature Highlights Footer */}
        <View style={styles.featuresFooter}>
          <Text style={styles.featureItem}>⚡ Smart Algorithm Sorting</Text>
          <Text style={styles.featureDot}>•</Text>
          <Text style={styles.featureItem}>⏰ Deadline Alerts</Text>
          <Text style={styles.featureDot}>•</Text>
          <Text style={styles.featureItem}>🔒 JWT Protected</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.bgInput,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerGlow,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 10,
    fontWeight: '500',
  },
  showPassText: {
    color: Colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  demoDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.4)',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 8,
  },
  demoButtonText: {
    color: Colors.secondary,
    fontSize: 13,
    fontWeight: '700',
  },
  featuresFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  featureItem: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  featureDot: {
    color: Colors.textMuted,
    fontSize: 10,
  },
});
