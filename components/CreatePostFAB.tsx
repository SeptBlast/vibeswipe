import { PlatformFAB } from "@/components/fab";
import { useRouter } from "expo-router";
import React from "react";

export default function CreatePostFAB() {
  const router = useRouter();

  const handlePress = () => {
    router.push("/post/new");
  };

  return <PlatformFAB onPress={handlePress} icon="add" label="New Vibe" />;
}
