const movies = [
  {
    title: "Borat",
    genre: "Comedy",
    year: "2006",
    rating: "4 Stars",
    mpaaRating: "R",
    gross: "$376,678",
  },
];

class MovieApi {
  static getMovieData() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(Object.assign([], movies));
      }, 1000);
    });
  };
}

export default MovieApi;
