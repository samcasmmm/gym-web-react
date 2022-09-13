export const exerciseOptions = {
  method: "GET",
  headers: {
      "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      "X-RapidAPI-Key": "11b4d6f032msh386aca822c0b025p110251jsnaf9a980bd21a"
  },
};

export const youtubeOption = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Host': 'youtube-search-and-download.p.rapidapi.com',
    'X-RapidAPI-Key': '11b4d6f032msh386aca822c0b025p110251jsnaf9a980bd21a'
  }
};

export const fetchData = async (url, options) => {
  const response = await fetch(url, options);
  const data = await response.json();

  return data;
};
