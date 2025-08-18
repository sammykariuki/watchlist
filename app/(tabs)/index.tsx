import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";
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

export default function Index() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [allMovies, setAllMovies] = useState<any[]>([]);

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = useFetch(getTrendingMovies);

  const {
    data: moviesResponse,
    loading: moviesLoading,
    error: moviesError,
    refetch,
  } = useFetch(() => fetchMovies({ query: "", page }), true);

  useEffect(() => {
    if (moviesResponse?.results) {
      if (page === 1) {
        setAllMovies(moviesResponse.results);
      } else {
        setAllMovies((prev) => [...prev, ...moviesResponse.results]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moviesResponse]);

  const loadMoreMovies = () => {
    if (moviesResponse && page < moviesResponse.total_pages && !moviesLoading) {
      setPage((prev) => prev + 1);
      refetch();
    }
  };

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0 h-full" />

      <FlatList
        data={allMovies}
        renderItem={({ item }) => <MovieCard {...item} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          gap: 20,
          paddingRight: 5,
          marginBottom: 10,
        }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
          paddingTop: 40,
        }}
        onEndReached={loadMoreMovies}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          moviesLoading ? (
            <ActivityIndicator size="large" color="#fff" className="my-4" />
          ) : null
        }
        ListHeaderComponent={
          <>
            <Image
              source={icons.logo}
              className="w-12 h-10 mb-5 mx-auto"
              resizeMode="contain"
            />

            <SearchBar
              onPress={() => router.push("/search")}
              placeholder="Search for a movie"
              value=""
            />

            {/* Show loading or error messages inline */}
            {(moviesLoading && page === 1) || trendingLoading ? (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="mt-10 self-center"
              />
            ) : moviesError || trendingError ? (
              <View className="mt-5 flex-row justify-center items-center gap-4">
                <Text className="text-red-500 text-center">
                  Error: {moviesError?.message || trendingError?.message}
                </Text>
                <TouchableOpacity
                  onPress={refetch}
                  className="bg-gray-700 px-4 py-2 rounded"
                >
                  <Text className="text-white">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {trendingMovies && (
                  <View className="mt-10">
                    <Text className="text-lg text-white font-bold mb-3">
                      Trending Movies
                    </Text>
                    <FlatList
                      data={trendingMovies}
                      renderItem={({ item, index }) => (
                        <TrendingCard movie={item} index={index} />
                      )}
                      keyExtractor={(item) => item.movie_id.toString()}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      ItemSeparatorComponent={() => <View className="w-4" />}
                    />
                  </View>
                )}

                <Text className="text-lg text-white font-bold mt-5 mb-3">
                  Latest Movies
                </Text>
              </>
            )}
          </>
        }
      />
    </View>
  );
}
