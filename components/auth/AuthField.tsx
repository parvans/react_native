import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';

type AuthFieldProps = TextInputProps & {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  error?: string | null;
  helper?: string;
  trailing?: ReactNode;
};

export function AuthField({
  label,
  icon,
  error,
  helper,
  trailing,
  className,
  placeholderTextColor = colors.mutedForeground,
  selectionColor = colors.accent,
  ...props
}: AuthFieldProps) {
  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <View className={clsx('auth-input-wrap', error && 'auth-input-wrap-error')}>
        <Feather
          name={icon}
          size={18}
          color={error ? colors.destructive : colors.mutedForeground}
          style={{ marginRight: 10 }}
        />
        <TextInput
          className={clsx('auth-input-control', className)}
          placeholderTextColor={placeholderTextColor}
          selectionColor={selectionColor}
          {...props}
        />
        {trailing}
      </View>
      {error ? <Text className="auth-error">{error}</Text> : helper ? <Text className="auth-helper">{helper}</Text> : null}
    </View>
  );
}
