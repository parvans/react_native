import "@/global.css";
import { Link } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import {styled} from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">

      <Text className="text-xl font-bold text-success font-mono">
        Welcome to Nativewind!
      </Text>
      <Link href="/Onboarding" className="mt-4 text-lg text-accent">
        Go to Onboarding
      </Link>
      <Link href="/(auth)/sign-in" className="mt-4 text-lg text-accent">
        Go to Sign In
      </Link>
      <Link href="/(auth)/sign-up" className="mt-4 text-lg text-accent">
        Go to Sign Up
      </Link>
      <Link href="/subscriptions/12332" className="mt-4 text-lg text-destructive">
        Go to Subscription Details
      </Link>
      <Link href={{
        pathname: "/subscriptions/[id]",
        params: { id: "12332" },
      }} className="mt-4 text-lg text-accent">
        Claude Max Go to Subscription 
      </Link>
    </SafeAreaView>

      
  );
}
