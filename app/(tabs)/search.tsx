import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies } from "@/services/api";
import { updateSearchCount } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: movies,
    loading,
    error,
    refetch: loadMovies,
    reset,
  } = useFetch(() => fetchMovies({ query: searchQuery }), false);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadMovies();
      } else {
        reset();
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);
  useEffect(() => {
    if (movies?.results?.length > 0 && movies.results[0]) {
      updateSearchCount(searchQuery, movies.results[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movies]);
  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="flex-1 absolute w-full z-0" />
      <FlatList
        data={movies?.results ?? []}
        renderItem={({ item }) => <MovieCard {...item} />}
        keyExtractor={(item) => item.id.toString()}
        className="px-5"
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "center",
          gap: 20,
          paddingRight: 5,
          marginBottom: 10,
        }}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListHeaderComponent={
          <View>
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image source={icons.logo} className="w-12 h-10" />
            </View>
            <View className="my-5">
              <SearchBar
                placeholder="Search movies..."
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
              />
            </View>
            {loading && (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="my-3"
              />
            )}
            {error && (
              <View className="flex-row justify-center items-center gap-4 px-5 my-3">
                <Text className="text-red-500">Error: {error.message}</Text>
                <TouchableOpacity
                  onPress={loadMovies}
                  className="bg-gray-700 px-4 py-2 rounded"
                >
                  <Text className="text-white">Retry</Text>
                </TouchableOpacity>
              </View>
            )}
            {!loading && !error && searchQuery.trim() && movies?.length > 0 && (
              <Text className="text-xl text-white font-bold">
                Search Results for{" "}
                <Text className="text-accent">{searchQuery}</Text>
              </Text>
            )}
          </View>
        }
        stickyHeaderIndices={[0]}
        ListEmptyComponent={
          !loading && !error ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                {searchQuery.trim() ? "No movies found" : "Search for a Movie"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
