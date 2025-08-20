import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { completePasswordRecovery } from "@/services/appwrite";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Recover() {
  const router = useRouter();
  const { userId, secret } = useLocalSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!userId || !secret) {
      setError("Invalid recovery link");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await completePasswordRecovery(
        userId as string,
        secret as string,
        newPassword
      );
      setError("Password reset successful! Please log in.");
      setTimeout(() => router.push("/login"), 2000); // Redirect after 2 seconds
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full h-full z-0" />
      <View className="w-full flex-row justify-center mt-20 items-center">
        <Image source={icons.logo} className="w-12 h-10" resizeMode="contain" />
      </View>
      <Text className="text-2xl text-white font-bold mt-10 text-center">
        Reset Password
      </Text>
      <View className="mt-5 px-5">
        <TextInput
          className="bg-gray-800 text-white p-3 rounded mb-3"
          placeholder="New Password"
          placeholderTextColor="#999"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <TextInput
          className="bg-gray-800 text-white p-3 rounded mb-3"
          placeholder="Confirm Password"
          placeholderTextColor="#999"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity
          className={`bg-accent px-4 py-3 rounded mb-3 ${
            loading ? "opacity-50" : ""
          }`}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text className="text-white text-center font-bold">
            {loading ? "Resetting..." : "Reset Password"}
          </Text>
        </TouchableOpacity>
        {error && (
          <Text
            className={`text-center mb-3 ${
              error.includes("successful") ? "text-green-500" : "text-red-500"
            }`}
          >
            {error}
          </Text>
        )}
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text className="text-gray-400 text-center">Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
