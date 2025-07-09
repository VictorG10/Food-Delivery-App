import { CustomInputProps } from "@/type";
import cn from "clsx";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";

const CustomInput = ({
  placeholder = "Enter text",
  value,
  onChangeText,
  label,
  secureTextEntry = false,
  keyboardType = "default",
}: CustomInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="w-full">
      <Text className="label">{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "input",
          isFocused ? "border-primary" : "border-gray-300"
        )}
      />
    </View>
  );
};

export default CustomInput;
