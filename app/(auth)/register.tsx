import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { createUser } from "@/services/appwrite";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    try {
      await createUser(form.email, form.password, form.username);
      router.push("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
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
        Create an Account
      </Text>
      <View className="mt-5">
        <TextInput
          className="bg-gray-800 text-white p-3 rounded mb-3"
          placeholder="Username"
          placeholderTextColor="#999"
          value={form.username}
          onChangeText={(text) => setForm({ ...form, username: text })}
        />
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
          className={`bg-accent px-4 py-3 rounded ${
            loading ? "opacity-50" : ""
          }`}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text className="text-white text-center font-bold">
            {loading ? "Creating..." : "Register"}
          </Text>
        </TouchableOpacity>
        {error && (
          <Text className="text-red-500 text-center mt-3">{error}</Text>
        )}
        <TouchableOpacity
          className="mt-3"
          onPress={() => router.push("/login")}
        >
          <Text className="text-light-100 text-center">
            Already have an account? Log in
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
