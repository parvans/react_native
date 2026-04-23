import { icons } from '@/constants/icons';
import { StatusBar } from 'expo-status-bar';
import { Link, type Href } from 'expo-router';
import { styled } from 'nativewind';
import type { ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

type AuthShellProps = {
  title: string;
  subtitle: string;
  alternateCopy: string;
  alternateLabel: string;
  alternateHref: Href;
  footerNote: string;
  children: ReactNode;
};

export function AuthShell({
  title,
  subtitle,
  alternateCopy,
  alternateLabel,
  alternateHref,
  footerNote,
  children,
}: AuthShellProps) {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="auth-safe-area">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Image source={icons.wallet} resizeMode="contain" className="auth-logo-icon" />
              </View>
              <View>
                <Text className="auth-wordmark">Subscriptions</Text>
                <Text className="auth-wordmark-sub">SMART BILLING</Text>
              </View>
            </View>

            <View className="auth-copy-block">
              <Text className="auth-title">{title}</Text>
              <Text className="auth-subtitle">{subtitle}</Text>
            </View>
          </View>

          <View className="auth-card">{children}</View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">{alternateCopy}</Text>
            <Link href={alternateHref} asChild>
              <Pressable hitSlop={8}>
                <Text className="auth-link">{alternateLabel}</Text>
              </Pressable>
            </Link>
          </View>

          <Text className="auth-note">{footerNote}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
