import { Redirect, Tabs } from "expo-router";
import React from "react";

const TabsLayout = () => {
  const isAuthenticated = true;

  if (!isAuthenticated) return <Redirect href={"/sign-in"} />;

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="cart" options={{ title: "Cart" }} />
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
};

export default TabsLayout;
