import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Colors } from '../theme/colors';
import { User } from '../types';
import { CustomIcon } from './CustomIcon';

interface Props {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (data: { name: string; avatar?: string; bio?: string }) => Promise<void>;
  isLoading?: boolean;
}

const AVATAR_PRESETS = [
  { id: '1', name: 'Cyber Bot', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: '2', name: 'Minimal Neo', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: '3', name: 'Studio Pro', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { id: '4', name: 'Creative Aura', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { id: '5', name: 'Vanguard', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
  { id: '6', name: 'Architect', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80' },
];

export const ProfileModal: React.FC<Props> = ({
  visible,
  user,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setSelectedAvatar(user.avatar || AVATAR_PRESETS[0].url);
      setCustomAvatarUrl(user.avatar || '');
    }
  }, [user, visible]);

  const handleSelectPreset = (url: string) => {
    setSelectedAvatar(url);
    setCustomAvatarUrl(url);
  };

  const handleApplyCustomUrl = () => {
    if (customAvatarUrl.trim().startsWith('http')) {
      setSelectedAvatar(customAvatarUrl.trim());
    } else {
      Alert.alert('Invalid URL', 'Please enter a valid image web link starting with http:// or https://');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }

    try {
      await onSave({
        name: name.trim(),
        avatar: selectedAvatar.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update profile');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Edit Profile</Text>
              <Text style={styles.subtitle}>Customize your public identity and avatar</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <CustomIcon name="close" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.formScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar Preview Hero */}
            <View style={styles.avatarHero}>
              <View style={styles.avatarBorder}>
                {selectedAvatar ? (
                  <Image
                    source={{ uri: selectedAvatar }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <CustomIcon name="user" size={36} color={Colors.primaryLight} />
                  </View>
                )}
                <View style={styles.verifiedBadge}>
                  <CustomIcon name="check" size={10} color={Colors.white} />
                </View>
              </View>

              <Text style={styles.previewName}>{name || 'Your Name'}</Text>
              <Text style={styles.previewEmail}>{user?.email || 'user@proflow.io'}</Text>
            </View>

            {/* Avatar Preset Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Choose Avatar Preset</Text>
              <View style={styles.presetGrid}>
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = selectedAvatar === preset.url;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[
                        styles.presetItem,
                        isSelected && styles.presetItemSelected,
                      ]}
                      onPress={() => handleSelectPreset(preset.url)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: preset.url }} style={styles.presetThumb} />
                      {isSelected && (
                        <View style={styles.presetActiveCheck}>
                          <CustomIcon name="check" size={10} color={Colors.white} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Image URL Option */}
              <TouchableOpacity
                style={styles.customToggle}
                onPress={() => setShowCustomInput(!showCustomInput)}
                activeOpacity={0.7}
              >
                <CustomIcon name="camera" size={14} color={Colors.primaryLight} />
                <Text style={styles.customToggleText}>
                  {showCustomInput ? 'Hide Custom Image URL' : 'Or Paste Custom Image URL'}
                </Text>
              </TouchableOpacity>

              {showCustomInput && (
                <View style={styles.customInputRow}>
                  <TextInput
                    style={styles.customTextInput}
                    placeholder="https://example.com/avatar.jpg"
                    placeholderTextColor={Colors.textMuted}
                    value={customAvatarUrl}
                    onChangeText={setCustomAvatarUrl}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={handleApplyCustomUrl}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.applyBtnText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Full Name Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Display Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your name"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
                maxLength={50}
              />
            </View>

            {/* Bio Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Bio / Status</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Write a brief intro or current focus..."
                placeholderTextColor={Colors.textMuted}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
              <Text style={styles.charCount}>{bio.length}/200</Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, isLoading && styles.saveBtnDisabled]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>Save Profile</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 22,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formScroll: {
    maxHeight: 460,
  },
  avatarHero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarBorder: {
    position: 'relative',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: Colors.primary,
    padding: 3,
    backgroundColor: Colors.bgCard,
    marginBottom: 10,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.success,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  previewEmail: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  section: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  presetGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  presetItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: 2,
    position: 'relative',
    backgroundColor: Colors.bgCard,
  },
  presetItemSelected: {
    borderColor: Colors.primary,
  },
  presetThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  presetActiveCheck: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  customToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primaryLight,
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  customTextInput: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  applyBtn: {
    backgroundColor: Colors.bgCardHover,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
