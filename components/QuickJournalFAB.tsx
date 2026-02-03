import { PlatformFAB } from "@/components/fab";
import { useRouter } from "expo-router";
import React from "react";

export default function QuickJournalFAB() {
  const router = useRouter();

  const handlePress = () => {
    router.push("/journal/new");
  };

  return (
    <PlatformFAB
      onPress={handlePress}
      icon="create"
      label="Journal"
      extended={false}
    />
  );
}
