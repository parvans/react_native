import { useAuth, useClerk, useUser } from '@clerk/expo';
import { Link, Redirect, useLocalSearchParams } from 'expo-router';
import { styled } from 'nativewind';
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { getUserDisplayName } from '@/lib/auth';

const SafeAreaView = styled(RNSafeAreaView);

const Onboarding = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const params = useLocalSearchParams<{ task?: string }>();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="rounded-[32px] border border-border bg-card p-6">
        <Text className="text-3xl font-sans-extrabold text-primary">
          You&apos;re in, {getUserDisplayName(user)}
        </Text>
        <Text className="mt-3 text-base font-sans-medium leading-7 text-muted-foreground">
          Your account is active. There&apos;s still an open account task, so we paused here before
          sending you deeper into the app.
        </Text>

        <View className="mt-6 rounded-3xl bg-background p-4">
          <Text className="text-sm font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
            Pending task
          </Text>
          <Text className="mt-2 text-lg font-sans-bold text-primary">
            {params.task ?? 'Account setup'}
          </Text>
        </View>

        <Link href="/(tabs)" asChild>
          <Pressable
            className="mt-6 items-center rounded-2xl bg-accent py-4"
            style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
          >
            <Text className="font-sans-bold text-background">Go to dashboard</Text>
          </Pressable>
        </Link>

        <Pressable
          className="mt-3 items-center rounded-2xl border border-accent/30 bg-accent/10 py-4"
          onPress={() => signOut()}
          style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
        >
          <Text className="font-sans-semibold text-accent">Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

export default Onboarding
