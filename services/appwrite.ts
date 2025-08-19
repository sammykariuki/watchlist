import { Account, Client, Databases, ID, Query } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const SEARCH_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const SAVED_MOVIES_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_SAVED_MOVIES_COLLECTION_ID!;

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);
const database = new Databases(client);

export async function createUser(
  email: string,
  password: string,
  username: string
) {
  try {
    await account.create(ID.unique(), email, password, username);
    await account.createEmailPasswordSession(email, password);
  } catch (error: any) {
    throw new Error(error.message || "Failed to create user");
  }
}

export async function loginUser(email: string, password: string) {
  try {
    await account.createEmailPasswordSession(email, password);
  } catch (error: any) {
    throw new Error(error.message || "Failed to log in");
  }
}

export async function logoutUser() {
  try {
    await account.deleteSession("current");
  } catch (error: any) {
    throw new Error(error.message || "Failed to log out");
  }
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function updateUsername(newName: string) {
  try {
    return await account.updateName(newName);
  } catch (error: any) {
    throw new Error(error.message || "Failed to update username");
  }
}

export async function createPasswordRecovery(email: string) {
  try {
    // Replace with your recovery URL (e.g., deep link for mobile)
    await account.createRecovery(email, "https://yourapp.com/recover");
  } catch (error: any) {
    throw new Error(error.message || "Failed to send recovery email");
  }
}

export async function saveMovie(movie: {
  movie_id: string;
  poster_path: string;
  title: string;
  vote_average: number;
  release_date: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not logged in");
  return database.createDocument(
    DATABASE_ID,
    SAVED_MOVIES_COLLECTION_ID,
    ID.unique(),
    {
      user_id: user.$id,
      ...movie,
    }
  );
}

export async function removeSavedMovie(movie_id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not logged in");
  const docs = await database.listDocuments(
    DATABASE_ID,
    SAVED_MOVIES_COLLECTION_ID,
    [Query.equal("user_id", user.$id), Query.equal("movie_id", movie_id)]
  );
  if (docs.documents.length > 0) {
    return database.deleteDocument(
      DATABASE_ID,
      SAVED_MOVIES_COLLECTION_ID,
      docs.documents[0].$id
    );
  }
}

export async function isMovieSaved(movie_id: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  const docs = await database.listDocuments(
    DATABASE_ID,
    SAVED_MOVIES_COLLECTION_ID,
    [Query.equal("user_id", user.$id), Query.equal("movie_id", movie_id)]
  );
  return docs.documents.length > 0;
}

export async function getSavedMoviesCount(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;
  const docs = await database.listDocuments(
    DATABASE_ID,
    SAVED_MOVIES_COLLECTION_ID,
    [Query.equal("user_id", user.$id)]
  );
  return docs.total;
}

export async function getSavedMovies(): Promise<SavedMovie[] | undefined> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];
    const result = await database.listDocuments(
      DATABASE_ID,
      SAVED_MOVIES_COLLECTION_ID,
      [Query.equal("user_id", user.$id)]
    );
    return result.documents as unknown as SavedMovie[];
  } catch (err) {
    console.log("Error fetching saved movies:", err);
    throw err;
  }
}

export async function updateSearchCount(query: string, movie: any) {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      SEARCH_COLLECTION_ID,
      [Query.equal("searchTerm", query)]
    );

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(
        DATABASE_ID,
        SEARCH_COLLECTION_ID,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
        }
      );
    } else {
      await database.createDocument(
        DATABASE_ID,
        SEARCH_COLLECTION_ID,
        ID.unique(),
        {
          searchTerm: query,
          movie_id: movie.id,
          count: 1,
          title: movie.title,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        }
      );
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function getTrendingMovies(): Promise<
  TrendingMovie[] | undefined
> {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      SEARCH_COLLECTION_ID,
      [Query.limit(10), Query.orderDesc("count")]
    );
    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.log(error);
    return undefined;
  }
}
