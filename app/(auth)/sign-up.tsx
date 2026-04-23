import { AuthField } from '@/components/auth/AuthField';
import { AuthShell } from '@/components/auth/AuthShell';
import { colors } from '@/constants/theme';
import {
  completeAuthNavigation,
  getFieldErrorMessage,
  getGlobalErrorMessage,
  hasPendingEmailVerification,
  validateSignUp,
} from '@/lib/auth';
import { useSignUp } from '@clerk/expo';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

const SignUp = () => {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [localErrors, setLocalErrors] = React.useState<{
    emailAddress?: string;
    password?: string;
    confirmPassword?: string;
    code?: string;
  }>({});

  const isSubmitting = fetchStatus === 'fetching';
  const needsEmailVerification = hasPendingEmailVerification(signUp);
  const globalError = getGlobalErrorMessage(errors.global);

  const handleSubmit = async () => {
    const nextErrors = validateSignUp({
      emailAddress,
      password,
      confirmPassword,
    });
    setLocalErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const { error } = await signUp.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      return;
    }

    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: (context) => completeAuthNavigation(router, context),
      });
      return;
    }

    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    const nextErrors = validateSignUp({
      emailAddress,
      password,
      confirmPassword,
      code,
    });
    setLocalErrors((current) => ({ ...current, code: nextErrors.code }));

    if (nextErrors.code) {
      return;
    }

    const { error } = await signUp.verifications.verifyEmailCode({
      code: code.trim(),
    });

    if (error) {
      return;
    }

    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: (context) => completeAuthNavigation(router, context),
      });
    }
  };

  const handleReset = async () => {
    await signUp.reset();
    setCode('');
    setPassword('');
    setConfirmPassword('');
    setLocalErrors({});
  };

  return (
    <AuthShell
      title={needsEmailVerification ? 'Confirm your email' : 'Create your account'}
      subtitle={
        needsEmailVerification
          ? 'Enter the verification code we sent to finish setting up your account securely.'
          : 'Set up access once and keep your subscriptions, renewals, and billing details in sync.'
      }
      alternateCopy="Already have an account?"
      alternateLabel="Sign in"
      alternateHref="/(auth)/sign-in"
      footerNote="A quick email check helps protect your account before we open the dashboard."
    >
      {globalError ? (
        <View className="auth-status-banner">
          <Text className="auth-status-title">We couldn&apos;t finish setup</Text>
          <Text className="auth-status-copy">{globalError}</Text>
        </View>
      ) : null}

      {needsEmailVerification ? (
        <View className="auth-form">
          <AuthField
            label="Verification code"
            icon="shield"
            value={code}
            onChangeText={(value) => {
              setCode(value);
              setLocalErrors((current) => ({ ...current, code: undefined }));
            }}
            error={localErrors.code ?? getFieldErrorMessage(errors.fields.code)}
            helper="Use the most recent code from your inbox."
            placeholder="Enter your code"
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable
            className={['auth-button', isSubmitting && 'auth-button-disabled'].filter(Boolean).join(' ')}
            disabled={isSubmitting}
            onPress={handleVerify}
            style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="auth-button-text">Verify email</Text>
            )}
          </Pressable>

          <Pressable
            className="auth-secondary-button"
            disabled={isSubmitting}
            onPress={() => signUp.verifications.sendEmailCode()}
            style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
          >
            <Text className="auth-secondary-button-text">Send a new code</Text>
          </Pressable>

          <Pressable
            className="auth-secondary-button"
            disabled={isSubmitting}
            onPress={handleReset}
            style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
          >
            <Text className="auth-secondary-button-text">Edit account details</Text>
          </Pressable>
        </View>
      ) : (
        <View className="auth-form">
          <AuthField
            label="Email"
            icon="mail"
            value={emailAddress}
            onChangeText={(value) => {
              setEmailAddress(value);
              setLocalErrors((current) => ({ ...current, emailAddress: undefined }));
            }}
            error={localErrors.emailAddress ?? getFieldErrorMessage(errors.fields.emailAddress)}
            placeholder="Enter your email"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <AuthField
            label="Password"
            icon="lock"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setLocalErrors((current) => ({ ...current, password: undefined }));
            }}
            error={localErrors.password ?? getFieldErrorMessage(errors.fields.password)}
            helper="Use 8 or more characters with at least one number."
            placeholder="Create a password"
            textContentType="newPassword"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            trailing={
              <Pressable onPress={() => setShowPassword((current) => !current)} hitSlop={8}>
                <Text className="auth-link">{showPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            }
          />

          <AuthField
            label="Confirm password"
            icon="check-circle"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              setLocalErrors((current) => ({ ...current, confirmPassword: undefined }));
            }}
            error={localErrors.confirmPassword}
            placeholder="Confirm your password"
            textContentType="newPassword"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            trailing={
              <Pressable onPress={() => setShowConfirmPassword((current) => !current)} hitSlop={8}>
                <Text className="auth-link">{showConfirmPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            }
          />

          <Pressable
            className={
              [
                'auth-button',
                (!emailAddress || !password || !confirmPassword || isSubmitting) &&
                  'auth-button-disabled',
              ]
                .filter(Boolean)
                .join(' ')
            }
            disabled={!emailAddress || !password || !confirmPassword || isSubmitting}
            onPress={handleSubmit}
            style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="auth-button-text">Create account</Text>
            )}
          </Pressable>

          <View nativeID="clerk-captcha" />
        </View>
      )}
    </AuthShell>
  )
}

export default SignUp
