import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import {
  getCurrentUser,
  getSavedMoviesCount,
  logoutUser,
  updateUsername,
} from "@/services/appwrite";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [newUsername, setNewUsername] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndData = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        const count = await getSavedMoviesCount();
        setSavedCount(count);
      }
    };
    fetchUserAndData();
  }, []);

  const handleUpdateUsername = async () => {
    if (!newUsername) {
      setError("Please enter a new username");
      return;
    }
    setUpdateLoading(true);
    setError(null);
    try {
      await updateUsername(newUsername);
      setUser((prev: any) => ({ ...prev, name: newUsername }));
      setNewUsername("");
    } catch (error: any) {
      setError(error.message || "Failed to update username");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (!user) {
    return (
      <View className="flex-1 bg-primary">
        <Image source={images.bg} className="absolute w-full z-0 h-full" />
        <Image
          source={icons.logo}
          className="absolute z-5 w-12 h-10"
          style={{ top: 80, alignSelf: "center" }}
          resizeMode="contain"
        />
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-white text-xl mb-5">You are not logged in</Text>
          <TouchableOpacity
            className="bg-accent px-4 py-3 rounded mb-3 w-full"
            onPress={() => router.push("/login")}
          >
            <Text className="text-white text-center font-bold">Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-gray-700 px-4 py-3 rounded w-full"
            onPress={() => router.push("/register")}
          >
            <Text className="text-white text-center font-bold">
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const firstLetter = user.name?.charAt(0).toUpperCase() || "?";

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0 h-full" />
      <View className="w-full flex-row justify-center mt-20 items-center">
        <Image source={icons.logo} className="w-12 h-10" />
      </View>
      <View className="flex-row items-center mb-5 mt-5">
        <View className="w-12 h-12 bg-accent rounded-full justify-center items-center">
          <Text className="text-white text-2xl font-bold">{firstLetter}</Text>
        </View>
        <Text className="text-white text-xl font-bold ml-3">{user.name}</Text>
      </View>
      <Text className="text-white mb-3">
        You have saved {savedCount} {savedCount === 1 ? "movie" : "movies"}
      </Text>
      <View className="flex-row items-center mb-5">
        <TextInput
          className="bg-gray-800 text-white p-3 rounded flex-1 mr-2"
          placeholder="New username"
          placeholderTextColor="#999"
          value={newUsername}
          onChangeText={setNewUsername}
        />
        <TouchableOpacity
          className={`bg-accent px-4 py-3 rounded ${
            updateLoading ? "opacity-50" : ""
          }`}
          onPress={handleUpdateUsername}
          disabled={updateLoading}
        >
          <Text className="text-white font-bold">
            {updateLoading ? "Updating..." : "Update"}
          </Text>
        </TouchableOpacity>
      </View>
      {error && <Text className="text-red-500 mb-3">{error}</Text>}
      <TouchableOpacity
        className="bg-red-500 px-4 py-3 rounded mt-auto mb-[7.5rem]"
        onPress={async () => {
          await logoutUser();
          setUser(null);
          router.push("/profile");
        }}
      >
        <Text className="text-white text-center font-bold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
