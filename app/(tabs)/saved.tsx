import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { getCurrentUser, getSavedMovies } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Saved() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: savedMovies,
    loading: savedLoading,
    error: savedError,
    refetch: loadSaved,
  } = useFetch(getSavedMovies);

  // Filter movies based on search query
  const filteredMovies =
    savedMovies?.filter((movie) =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

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

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0 h-full" />
      <FlatList
        data={filteredMovies}
        renderItem={({ item }) => (
          <MovieCard
            id={Number(item.movie_id)}
            poster_path={item.poster_path}
            title={item.title}
            vote_average={item.vote_average}
            release_date={item.release_date}
          />
        )}
        keyExtractor={(item) => item.movie_id}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "center",
          gap: 20,
          paddingHorizontal: 10,
          marginBottom: 10,
        }}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListHeaderComponent={
          <View>
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image
                source={icons.logo}
                className="w-12 h-10"
                resizeMode="contain"
              />
            </View>
            <View className="my-5 px-5">
              <SearchBar
                placeholder="Search saved movies..."
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
              />
            </View>
            {savedLoading && (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="my-3"
              />
            )}
            {savedError && (
              <View className="flex-row justify-center items-center gap-4 px-5 my-3">
                <Text className="text-red-500">
                  Error: {savedError.message}
                </Text>
                <TouchableOpacity
                  onPress={loadSaved}
                  className="bg-gray-700 px-4 py-2 rounded"
                >
                  <Text className="text-white">Retry</Text>
                </TouchableOpacity>
              </View>
            )}
            {!savedLoading && !savedError && searchQuery.trim() && (
              <Text className="text-xl text-white font-bold px-5 mb-3">
                Search Results for{" "}
                <Text className="text-accent">{searchQuery}</Text>
              </Text>
            )}
            {!savedLoading && !savedError && !searchQuery.trim() && (
              <Text className="text-xl text-white font-bold px-5 mb-3">
                Your Saved Movies
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          !savedLoading && !savedError ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                {searchQuery.trim() ? "No movies found" : "No movies saved yet"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
