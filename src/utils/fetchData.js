export const exerciseOptions = {
  method: "GET",
  url: "https://exercisedb.p.rapidapi.com/exercises/bodyPartList",
  headers: {
      "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      "X-RapidAPI-Key": "11b4d6f032msh386aca822c0b025p110251jsnaf9a980bd21a"
  },
};

export const fetchData = async (url, options) => {
  const response = await fetch(url, options);
  const data = await response.json();

  return data;
};
