const API_KEY = "ed2feec0a16fb18e4de0f89679a402c0";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// Şehir durumuna göre veri al
export const getWeatherData = async (city, units = "metric") => {
	// Tam yolu oluştur
	const url = `${BASE_URL}?q=${city}&units=${units}&appid=${API_KEY}&lang=tr`;

	// Api istek atma
	const res = await fetch(url);

	// Gelen response dan json verisini al
	const data = await res.json();

	console.log(data);

	return data;
};

// Koordinatıma göre veri al
export const getWeatherByCoords = async (lat, lon, units = "metric") => {
	const url = `${BASE_URL}?lat=${lat}&long=${lon}&units=${units}&appid=${API_KEY}`;

	const res = await fetch(url);

	return res.json;
};

// Bayrak isteği
export const getFlagUrl = (countryCode) =>
	`https://flagcdn.com/108x81/${countryCode.toLowerCase()}.png`;
