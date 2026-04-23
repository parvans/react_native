import { AuthField } from '@/components/auth/AuthField';
import { AuthShell } from '@/components/auth/AuthShell';
import { colors } from '@/constants/theme';
import {
  completeAuthNavigation,
  getFieldErrorMessage,
  getGlobalErrorMessage,
  getPreferredSecondFactor,
  validateSignIn,
} from '@/lib/auth';
import { useSignIn } from '@clerk/expo';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

const SignIn = () => {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [localErrors, setLocalErrors] = React.useState<{
    emailAddress?: string;
    password?: string;
    code?: string;
  }>({});

  const isSubmitting = fetchStatus === 'fetching';
  const isVerificationStep =
    signIn.status === 'needs_client_trust' || signIn.status === 'needs_second_factor';
  const preferredSecondFactor =
    signIn.status === 'needs_client_trust' ? 'email_code' : getPreferredSecondFactor(signIn);
  const globalError = getGlobalErrorMessage(errors.global);

  const verificationCopy =
    preferredSecondFactor === 'phone_code'
      ? 'We sent a fresh code to your trusted phone number.'
      : preferredSecondFactor === 'totp'
        ? 'Enter the latest code from your authenticator app.'
        : preferredSecondFactor === 'backup_code'
          ? 'Enter one of your saved backup codes to continue.'
          : 'We sent a fresh code to your email to keep the sign-in secure.';

  const handleSubmit = async () => {
    const nextErrors = validateSignIn({ emailAddress, password });
    setLocalErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const { error } = await signIn.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      return;
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: (context) => completeAuthNavigation(router, context),
      });
      return;
    }

    if (signIn.status === 'needs_client_trust') {
      await signIn.mfa.sendEmailCode();
      return;
    }

    if (signIn.status === 'needs_second_factor') {
      const nextSecondFactor = getPreferredSecondFactor(signIn);

      if (nextSecondFactor === 'email_code') {
        await signIn.mfa.sendEmailCode();
      }

      if (nextSecondFactor === 'phone_code') {
        await signIn.mfa.sendPhoneCode();
      }
    }
  };

  const handleVerify = async () => {
    const nextErrors = validateSignIn({ emailAddress, password, code });
    setLocalErrors((current) => ({ ...current, code: nextErrors.code }));

    if (nextErrors.code) {
      return;
    }

    let result: { error: unknown | null } = { error: null };

    if (preferredSecondFactor === 'phone_code') {
      result = await signIn.mfa.verifyPhoneCode({ code: code.trim() });
    } else if (preferredSecondFactor === 'totp') {
      result = await signIn.mfa.verifyTOTP({ code: code.trim() });
    } else if (preferredSecondFactor === 'backup_code') {
      result = await signIn.mfa.verifyBackupCode({ code: code.trim() });
    } else {
      result = await signIn.mfa.verifyEmailCode({ code: code.trim() });
    }

    if (result.error) {
      return;
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: (context) => completeAuthNavigation(router, context),
      });
    }
  };

  const handleResend = async () => {
    if (preferredSecondFactor === 'phone_code') {
      await signIn.mfa.sendPhoneCode();
      return;
    }

    if (preferredSecondFactor === 'email_code') {
      await signIn.mfa.sendEmailCode();
    }
  };

  const handleReset = async () => {
    await signIn.reset();
    setCode('');
    setPassword('');
    setLocalErrors({});
  };

  return (
    <AuthShell
      title={isVerificationStep ? 'Verify your sign in' : 'Welcome back'}
      subtitle={
        isVerificationStep
          ? verificationCopy
          : 'Sign in to continue managing your subscriptions with a secure, streamlined flow.'
      }
      alternateCopy="New here?"
      alternateLabel="Create an account"
      alternateHref="/(auth)/sign-up"
      footerNote="Your session stays encrypted on device and only the screens you need are shown."
    >
      {globalError ? (
        <View className="auth-status-banner">
          <Text className="auth-status-title">We couldn&apos;t continue</Text>
          <Text className="auth-status-copy">{globalError}</Text>
        </View>
      ) : null}

      {isVerificationStep ? (
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
            helper="Use the most recent code you received."
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
              <Text className="auth-button-text">Verify and continue</Text>
            )}
          </Pressable>

          {(preferredSecondFactor === 'email_code' || preferredSecondFactor === 'phone_code') ? (
            <Pressable
              className="auth-secondary-button"
              disabled={isSubmitting}
              onPress={handleResend}
              style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
            >
              <Text className="auth-secondary-button-text">Send a new code</Text>
            </Pressable>
          ) : null}

          <Pressable
            className="auth-secondary-button"
            disabled={isSubmitting}
            onPress={handleReset}
            style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
          >
            <Text className="auth-secondary-button-text">Start over</Text>
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
            error={localErrors.emailAddress ?? getFieldErrorMessage(errors.fields.identifier)}
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
            placeholder="Enter your password"
            textContentType="password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            trailing={
              <Pressable onPress={() => setShowPassword((current) => !current)} hitSlop={8}>
                <Text className="auth-link">{showPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            }
          />

          <Pressable
            className={
              ['auth-button', (!emailAddress || !password || isSubmitting) && 'auth-button-disabled']
                .filter(Boolean)
                .join(' ')
            }
            disabled={!emailAddress || !password || isSubmitting}
            onPress={handleSubmit}
            style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="auth-button-text">Sign in</Text>
            )}
          </Pressable>
        </View>
      )}
    </AuthShell>
  )
}

export default SignIn
