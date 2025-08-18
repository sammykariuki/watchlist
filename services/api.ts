import axios from "axios";

export const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
  },
};

export const fetchMovies = async ({
  query,
  page = 1,
}: {
  query: string;
  page?: number;
}) => {
  try {
    const endpoint = query
      ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(
          query
        )}&page=${page}`
      : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;

    const response = await axios.get(endpoint, {
      headers: TMDB_CONFIG.headers,
    });

    return response.data; // 👈 return full TMDB response, not just results
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw new Error("Failed to fetch movies");
  }
};

export const fetchMovieDetails = async (
  movieId: string
): Promise<MovieDetails> => {
  try {
    const endpoint = `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`;
    const response = await axios.get(endpoint, {
      headers: TMDB_CONFIG.headers,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
