import { View, Text } from 'react-native'
import React from 'react'
import { Link, useLocalSearchParams } from 'expo-router'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import {styled} from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

const SubscriptionDetails = () => {
    const {id} = useLocalSearchParams<{id:string}>();

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text>SubscriptionDetails: {id}</Text>
      <Link href="/" className="mt-4 text-lg text-accent">
        Go Back
      </Link>
    </SafeAreaView>
  )
}

export default SubscriptionDetails