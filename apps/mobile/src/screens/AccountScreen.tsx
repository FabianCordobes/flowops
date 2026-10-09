
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ScreenHeader } from '../components/ui/ScreenHeader';
import { useAuth } from '../providers/AuthProvider';
import { colors, radius, spacing, typography } from '../theme';
import { updateMyProfile } from '../services/profile.service';

export const AccountScreen = () => {
  const { profile, session, signOut, updateProfile } = useAuth();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
const [fullName, setFullName] = useState('');
const [isSavingProfile, setIsSavingProfile] = useState(false);
const [profileError, setProfileError] = useState<string | null>(null);

const normalizedName = fullName.trim();

const canSaveProfile =
  normalizedName.length >= 2 &&
  normalizedName.length <= 100 &&
  !isSavingProfile;

const handleStartEditing = () => {
  setFullName(profile?.fullName ?? '');
  setProfileError(null);
  setIsEditingProfile(true);
};

const handleCancelEditing = () => {
  if (isSavingProfile) return;

  setIsEditingProfile(false);
  setProfileError(null);
};

const handleSaveProfile = async () => {
  if (!canSaveProfile) return;

  setIsSavingProfile(true);
  setProfileError(null);

  try {
    const updatedProfile = await updateMyProfile(normalizedName);

    updateProfile(updatedProfile);
    setIsEditingProfile(false);
  } catch (error) {
    setProfileError(
      error instanceof Error
        ? error.message
        : 'Unable to update your profile.',
    );
  } finally {
    setIsSavingProfile(false);
  }
};

  const email = profile?.email ?? session?.user.email ?? '';
  const role = profile?.role ?? 'UNKNOWN';

  const initial = (profile?.fullName || email)
  .charAt(0)
  .toUpperCase() || 'U';

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setErrorMessage(null);

    try {
      await signOut();
      setShowSignOutModal(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to sign out. Please try again.',
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  const confirmSignOut = () => {
    setErrorMessage(null);
    setShowSignOutModal(true);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <ScreenHeader
          eyebrow="FlowOps workspace"
          title="Account"
          subtitle="Manage your profile and session."
        />
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.profileDetails}>
        {profile?.fullName ? (
  <Text style={styles.profileName} numberOfLines={2}>
    {profile.fullName}
  </Text>
) : null}

<Text style={styles.profileEmail} numberOfLines={2}>
  {email}
</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{role}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Account information
        </Text>

        <View style={styles.infoCard}>
            <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                    <Ionicons
                    name="person-outline"
                    size={19}
                    color={colors.textSecondary}
                    />
                </View>

                <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Full name</Text>
                    <Text style={styles.infoValue}>
                    {profile?.fullName || 'Not configured'}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="mail-outline"
                size={19}
                color={colors.textSecondary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue} selectable>
                {email}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={19}
                color={colors.textSecondary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>{role}</Text>
            </View>
          </View>
        </View>
        {!isEditingProfile ? (
  <Pressable
    accessibilityRole="button"
    onPress={handleStartEditing}
    style={styles.editButton}
  >
    <Ionicons
      name="create-outline"
      size={18}
      color={colors.primary}
    />
    <Text style={styles.editButtonText}>Edit profile</Text>
  </Pressable>
) : (
  <View style={styles.editCard}>
    <Text style={styles.infoLabel}>Full name</Text>

    <TextInput
      style={styles.nameInput}
      value={fullName}
      onChangeText={(value) => {
        setFullName(value);
        setProfileError(null);
      }}
      placeholder="Enter your full name"
      placeholderTextColor={colors.textMuted}
      maxLength={100}
      autoCapitalize="words"
      autoCorrect={false}
      editable={!isSavingProfile}
      accessibilityLabel="Full name"
    />

    <Text style={styles.characterCount}>
      {fullName.length}/100
    </Text>

    {profileError ? (
      <Text style={styles.errorText}>{profileError}</Text>
    ) : null}

    <View style={styles.editActions}>
      <Pressable
        accessibilityRole="button"
        disabled={isSavingProfile}
        onPress={handleCancelEditing}
        style={styles.cancelEditButton}
      >
        <Text style={styles.cancelEditText}>Cancel</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        disabled={!canSaveProfile}
        onPress={() => void handleSaveProfile()}
        style={[
          styles.saveButton,
          !canSaveProfile && styles.signOutDisabled,
        ]}
      >
        {isSavingProfile ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <Text style={styles.saveButtonText}>Save changes</Text>
        )}
      </Pressable>
    </View>
  </View>
)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Session
        </Text>

        <View style={styles.sessionCard}>
          <View style={styles.sessionStatus}>
            <View style={styles.statusDot} />

            <View style={styles.sessionText}>
              <Text style={styles.sessionTitle}>
                Signed in
              </Text>

              <Text style={styles.sessionSubtitle}>
                Your FlowOps session is active.
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out of FlowOps"
            accessibilityState={{ disabled: isSigningOut }}
            disabled={isSigningOut}
            onPress={confirmSignOut}
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && styles.signOutPressed,
              isSigningOut && styles.signOutDisabled,
            ]}
          >
            {isSigningOut ? (
              <ActivityIndicator
                size="small"
                color={colors.textInverse}
              />
            ) : (
              <Ionicons
                name="log-out-outline"
                size={20}
                color={colors.textInverse}
              />
            )}

            <Text style={styles.signOutText}>
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </Text>
          </Pressable>

          {errorMessage ? (
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}
        </View>
      </View>

      <Text style={styles.footer}>
        FlowOps · Operations management
      </Text>

      <Modal
  visible={showSignOutModal}
  transparent
  animationType="fade"
  onRequestClose={() => {
    if (!isSigningOut) {
      setShowSignOutModal(false);
    }
  }}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>
        Sign out of FlowOps?
      </Text>

      <Text style={styles.modalDescription}>
        You will need to sign in again to access your workspace.
      </Text>

      {errorMessage ? (
        <Text style={styles.errorText}>
          {errorMessage}
        </Text>
      ) : null}

      <View style={styles.modalActions}>
        <Pressable
          accessibilityRole="button"
          disabled={isSigningOut}
          style={styles.cancelButton}
          onPress={() => setShowSignOutModal(false)}
        >
          <Text style={styles.cancelButtonText}>
            Cancel
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={isSigningOut}
          style={[
            styles.confirmButton,
            isSigningOut && styles.signOutDisabled,
          ]}
          onPress={() => {
            void handleSignOut();
          }}
        >
          {isSigningOut ? (
            <ActivityIndicator
              size="small"
              color={colors.textInverse}
            />
          ) : (
            <Text style={styles.confirmButtonText}>
              Sign out
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  </View>
</Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.section,
    gap: spacing.xxl,
  },

  header: {
    marginBottom: spacing.sm,
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: colors.primary,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },

  profileDetails: {
    flex: 1,
    alignItems: 'flex-start',
    gap: spacing.sm,
  },

  profileEmail: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  roleBadge: {
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },

  roleText: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wide,
  },

  section: {
    gap: spacing.md,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoContent: {
    flex: 1,
    gap: spacing.xs,
  },

  infoLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },

  infoValue: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  sessionCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    gap: spacing.lg,
  },

  sessionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
  },

  sessionText: {
    flex: 1,
    gap: spacing.xs,
  },

  sessionTitle: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  sessionSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  signOutButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.text,
  },

  signOutPressed: {
    opacity: 0.85,
  },

  signOutDisabled: {
    opacity: 0.6,
  },

  signOutText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  errorText: {
    color: colors.danger,
    fontSize: typography.fontSize.sm,
  },

  footer: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },

  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
  },

  modalTitle: {
    color: colors.text,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },

  modalDescription: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.md,
  },

  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  cancelButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cancelButtonText: {
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },

  confirmButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.text,
  },

  confirmButtonText: {
    color: colors.textInverse,
    fontWeight: typography.fontWeight.semibold,
  },
  profileName: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  editButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  editCard: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  nameInput: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    color: colors.text,
    fontSize: typography.fontSize.md,
  },
  characterCount: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    textAlign: 'right',
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelEditButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelEditText: {
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  saveButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.text,
  },
  saveButtonText: {
    color: colors.textInverse,
    fontWeight: typography.fontWeight.semibold,
  },
});
