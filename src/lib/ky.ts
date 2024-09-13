import ky from "ky";

//? The same as axios and it has parsing functions you can remove the block of fetching and it will
//? parse the json automatically and throw error also
const kyInstance = ky.create({
  parseJson: (text) =>
    JSON.parse(text, (key, value) => {
      if (key.endsWith("At")) return new Date(value);
      return value;
    }),
});

export default kyInstance;
