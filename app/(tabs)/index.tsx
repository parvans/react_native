import "@/global.css";
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
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

      
    </View>
  );
}
