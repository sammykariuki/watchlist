import { icons } from "@/constants/icons";
import { fetchMovieDetails } from "@/services/api";
import {
  getCurrentUser,
  isMovieSaved,
  removeSavedMovie,
  saveMovie,
} from "@/services/appwrite";
import { emitter } from "@/services/events";
import useFetch from "@/services/useFetch";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

export default function MovieDetails() {
  const { id } = useLocalSearchParams();
  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string)
  );
  const [user, setUser] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const checkUserAndSaved = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser && id) {
        const saved = await isMovieSaved(id as string);
        setIsSaved(saved);
      }
    };
    checkUserAndSaved();
  }, [id]);

  const handleSaveToggle = async () => {
    if (!user) {
      router.push("/profile");
      return;
    }
    if (
      !movie ||
      !movie.poster_path ||
      !movie.title ||
      !movie.vote_average ||
      !movie.release_date
    ) {
      console.error("Cannot save movie: missing required fields");
      return;
    }
    setSaveLoading(true);
    try {
      if (isSaved) {
        await removeSavedMovie(id as string);
        setIsSaved(false);
        emitter.emit("refetchSavedMovies");
      } else {
        await saveMovie({
          movie_id: String(movie.id),
          poster_path: movie.poster_path,
          title: movie.title,
          vote_average: movie.vote_average,
          release_date: movie.release_date,
        });
        setIsSaved(true);
        emitter.emit("refetchSavedMovies");
      }
    } catch (error: any) {
      console.error("Error toggling save:", error.message);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <View className="bg-primary flex-1">
      {loading && (
        <View className="flex flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      {!loading && movie && (
        <>
          <ScrollView
            contentContainerStyle={{
              paddingBottom: 80,
            }}
          >
            <View>
              <Image
                source={{
                  uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                }}
                className="w-full h-[550px]"
                resizeMode="stretch"
              />
            </View>
            <View className="flex-col items-start justify-center mt-5 px-5">
              <Text className="text-white font-bold text-xl">
                {movie.title}
              </Text>
              <View className="flex-row items-center gap-x-1 mt-2">
                <Text className="text-light-200 text-sm">
                  {movie.release_date?.split("-")[0]}
                </Text>
                <Text className="text-light-200 text-sm">{movie.runtime}m</Text>
              </View>
            </View>
            <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2 mx-5">
              <Image source={icons.star} className="size-4" />
              <Text className="text-white font-bold text-sm">
                {(movie.vote_average ?? 0).toFixed(1)}/10
              </Text>
              <Text className="text-light-200 text-sm">
                ({movie.vote_count} votes)
              </Text>
            </View>
            <MovieInfo label="Overview" value={movie.overview} />
            <MovieInfo
              label="Genres"
              value={movie.genres?.map((g) => g.name).join(" • ") || "N/A"}
            />
            <View className="flex-row justify-between w-1/2 px-5">
              <MovieInfo
                label="Budget"
                value={`$${(movie.budget ?? 0) / 1_000_000} million`}
              />
              <MovieInfo
                label="Revenue"
                value={`$${Math.round(
                  (movie.revenue ?? 0) / 1_000_000
                )} million`}
              />
            </View>
            <MovieInfo
              label="Production Companies"
              value={
                movie.production_companies.map((c) => c.name).join(" - ") ||
                "N/A"
              }
            />
          </ScrollView>

          <TouchableOpacity
            className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
            onPress={router.back}
          >
            <Image
              source={icons.arrow}
              className="size-5 mr-1 mt-0.5 rotate-180"
              tintColor="#fff"
            />
            <Text className="text-white font-semibold text-base">Go back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`absolute top-5 right-5 rounded-lg px-4 py-2 z-50 ${
              isSaved ? "bg-red-500" : "bg-accent"
            }`}
            onPress={handleSaveToggle}
            disabled={saveLoading}
          >
            <Text className="text-white font-semibold">
              {saveLoading ? "Processing..." : isSaved ? "Remove" : "Save"}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
