import type { FieldError, SignInFutureResource, UserResource } from '@clerk/expo/types';
import type { Href } from 'expo-router';

const EMAIL_ADDRESS_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RouterLike = {
  replace: (href: Href) => void;
};

type FinalizeNavigationContext = {
  session?: {
    currentTask?: {
      key?: string | null;
    } | null;
  } | null;
  decorateUrl: (url: string) => string;
};

export type SignInValidationErrors = Partial<Record<'emailAddress' | 'password' | 'code', string>>;
export type SignUpValidationErrors = Partial<
  Record<'emailAddress' | 'password' | 'confirmPassword' | 'code', string>
>;

export function validateSignIn(values: {
  emailAddress: string;
  password: string;
  code?: string;
}): SignInValidationErrors {
  const errors: SignInValidationErrors = {};

  if (!EMAIL_ADDRESS_PATTERN.test(values.emailAddress.trim())) {
    errors.emailAddress = 'Enter a valid email address.';
  }

  if (!values.password.trim()) {
    errors.password = 'Enter your password.';
  }

  if (values.code !== undefined && values.code.trim().length < 6) {
    errors.code = 'Enter the latest verification code.';
  }

  return errors;
}

export function validateSignUp(values: {
  emailAddress: string;
  password: string;
  confirmPassword: string;
  code?: string;
}): SignUpValidationErrors {
  const errors: SignUpValidationErrors = {};

  if (!EMAIL_ADDRESS_PATTERN.test(values.emailAddress.trim())) {
    errors.emailAddress = 'Enter a valid email address.';
  }

  if (!values.password.trim()) {
    errors.password = 'Create a password to continue.';
  } else if (values.password.length < 8) {
    errors.password = 'Use at least 8 characters.';
  } else if (!/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) {
    errors.password = 'Include at least one letter and one number.';
  }

  if (!values.confirmPassword.trim()) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (values.code !== undefined && values.code.trim().length < 6) {
    errors.code = 'Enter the latest verification code.';
  }

  return errors;
}

export function getFieldErrorMessage(error?: FieldError | null) {
  return error?.message ?? null;
}

export function getGlobalErrorMessage(errors?: Array<{ longMessage?: string; message: string }> | null) {
  return errors?.[0]?.longMessage ?? errors?.[0]?.message ?? null;
}

export function hasPendingEmailVerification(signUp: {
  status: string;
  unverifiedFields: string[];
  missingFields: string[];
}) {
  return (
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0
  );
}

export function getPreferredSecondFactor(signIn: SignInFutureResource) {
  const strategies = signIn.supportedSecondFactors.map((factor) => factor.strategy);

  if (strategies.includes('email_code')) return 'email_code';
  if (strategies.includes('phone_code')) return 'phone_code';
  if (strategies.includes('totp')) return 'totp';
  if (strategies.includes('backup_code')) return 'backup_code';

  return null;
}

export function getUserDisplayName(user?: UserResource | null) {
  if (!user) return 'there';
  if (user.fullName?.trim()) return user.fullName;
  if (user.firstName?.trim()) return user.firstName;
  if (user.username?.trim()) return user.username;

  const email = user.primaryEmailAddress?.emailAddress;
  if (email) return email.split('@')[0];

  return 'there';
}

export function getUserEmailAddress(user?: UserResource | null) {
  return user?.primaryEmailAddress?.emailAddress ?? 'Signed in';
}

export function getUserInitials(user?: UserResource | null) {
  if (!user) return 'U';

  const displayName =
    user.fullName?.trim() ||
    user.firstName?.trim() ||
    user.username?.trim() ||
    user.primaryEmailAddress?.emailAddress?.split('@')[0] ||
    '';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'U';
}

export function completeAuthNavigation(router: RouterLike, context: FinalizeNavigationContext) {
  const taskKey = context.session?.currentTask?.key;

  if (taskKey) {
    router.replace((`/Onboarding?task=${encodeURIComponent(taskKey)}`) as Href);
    return;
  }

  const homeUrl = context.decorateUrl('/');
  if (homeUrl.startsWith('http') && typeof window !== 'undefined') {
    window.location.href = homeUrl;
    return;
  }

  router.replace('/' as Href);
}
