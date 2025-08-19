import mitt from "mitt";

export const emitter = mitt<{ refetchSavedMovies: void }>();
