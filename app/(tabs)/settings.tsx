import { useClerk, useUser } from '@clerk/expo';
import React from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import {styled} from "nativewind";
import { colors } from '@/constants/theme';
import { getUserDisplayName, getUserEmailAddress, getUserInitials } from '@/lib/auth';

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="rounded-[28px] border border-border bg-card p-5">
        <View className="flex-row items-center gap-4">
          <View className="size-16 items-center justify-center rounded-full bg-accent">
            <Text className="text-2xl font-sans-extrabold text-background">
              {getUserInitials(user)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-sans-bold text-primary">{getUserDisplayName(user)}</Text>
            <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
              {getUserEmailAddress(user)}
            </Text>
          </View>
        </View>

        <View className="mt-6 rounded-3xl bg-background p-4">
          <Text className="text-lg font-sans-bold text-primary">Account access</Text>
          <Text className="mt-2 text-sm font-sans-medium leading-6 text-muted-foreground">
            Your session keeps subscription activity, reminders, and account details synced across
            the app.
          </Text>
        </View>

        <Pressable
          className="mt-6 items-center rounded-2xl bg-primary py-4"
          disabled={isSigningOut}
          onPress={handleSignOut}
          style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
        >
          {isSigningOut ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className="font-sans-bold text-background">Sign out</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

export default Settings
