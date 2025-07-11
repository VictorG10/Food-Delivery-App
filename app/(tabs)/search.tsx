import seed from "@/libs/seed";
import React from "react";
import { Button, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SearchScreen = () => {
  return (
    <SafeAreaView>
      <Text>SearchScreen</Text>
      <Button
        title="Seed"
        onPress={() =>
          seed().catch((error) =>
            console.log("Failed to seed the database.", error)
          )
        }
      />
    </SafeAreaView>
  );
};

export default SearchScreen;
