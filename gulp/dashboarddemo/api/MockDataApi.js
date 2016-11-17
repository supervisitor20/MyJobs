export const initialData = [
  {id: 1, country: "USA", population: "320,000,000", states: "50", language: "English"},
  {id: 2, country: "China", population: "2,320,000,000", states: "450", language: "Chinese"},
  {id: 3, country: "Japan", population: "2,657,849,000", states: "254", language: "Japanese"},
  {id: 4, country: "Mexico", population: "75,857,000", states: "78", language: "Spanish"},
  {id: 5, country: "Germany", population: "125,467,000", states: "546", language: "German"},
  {id: 6, country: "Fiji", population: "15,000,000", states: "45", language: "Fiji Hindi"},
  {id: 7, country: "Afghanistan", population: "25,999,000", states: "50", language: "Pashto"},
  {id: 8, country: "India", population: "620,164,000", states: "450", language: "Indian"},
  {id: 9, country: "Russia", population: "437,869,000", states: "254", language: "Russian"},
];

export const changeData = [
  {id: 1, country: "STAR", population: "320,000,000", states: "50", language: "English"},
  {id: 2, country: "STAR", population: "2,320,000,000", states: "450", language: "Chinese"},
  {id: 3, country: "STAR", population: "2,657,849,000", states: "254", language: "Japanese"},
  {id: 4, country: "STAR", population: "75,857,000", states: "78", language: "Spanish"},
  {id: 5, country: "STAR", population: "125,467,000", states: "546", language: "German"},
  {id: 6, country: "STAR", population: "15,000,000", states: "45", language: "Fiji Hindi"},
  {id: 7, country: "STAR", population: "25,999,000", states: "50", language: "Pashto"},
  {id: 8, country: "STAR", population: "620,164,000", states: "450", language: "Indian"},
];

class DataApi {
  static getAllData() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(Object.assign([], initialData));
      }, 1000);
    });
  }
  static updateAllData() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(Object.assign([], changeData));
      }, 1000);
    });
  }
}

export default DataApi;
