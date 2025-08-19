import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import {
  createPasswordRecovery,
  getCurrentUser,
  loginUser,
} from "@/services/appwrite";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const user = await getCurrentUser();
      if (user) {
        router.push("/(tabs)");
      }
    };
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginUser(form.email, form.password);
      router.push("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!form.email) {
      setError("Please enter your email to reset password");
      return;
    }
    setError(null);
    setRecoveryLoading(true);
    try {
      await createPasswordRecovery(form.email);
      setError("Password reset email sent. Check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full h-full z-0" />
      <View className="w-full flex-row justify-center mt-20 items-center">
        <Image source={icons.logo} className="w-12 h-10" resizeMode="contain" />
      </View>
      <Text className="text-2xl text-white font-bold mt-10 text-center">
        Log In
      </Text>
      <View className="mt-5">
        <TextInput
          className="bg-gray-800 text-white p-3 rounded mb-3"
          placeholder="Email"
          placeholderTextColor="#999"
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          className="bg-gray-800 text-white p-3 rounded mb-3"
          placeholder="Password"
          placeholderTextColor="#999"
          value={form.password}
          onChangeText={(text) => setForm({ ...form, password: text })}
          secureTextEntry
        />
        <TouchableOpacity
          className={`bg-accent px-4 py-3 rounded mb-3 ${
            loading ? "opacity-50" : ""
          }`}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-white text-center font-bold">
            {loading ? "Logging in..." : "Log In"}
          </Text>
        </TouchableOpacity>
        {error && (
          <Text className="text-red-500 text-center mb-3">{error}</Text>
        )}
        <TouchableOpacity
          className="mb-3"
          onPress={handleForgotPassword}
          disabled={recoveryLoading}
        >
          <Text className="text-gray-400 text-center">
            {recoveryLoading ? "Sending..." : "Forgot Password?"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="mt-3"
          onPress={() => router.push("/register")}
        >
          <Text className="text-light-100 text-center">
            Don&apos;t have an account? Register
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
