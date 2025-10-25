import { getWeatherData, getWeatherByCoords, getFlagUrl } from "./api.js";

import {
	uiElement,
	updateThemeIcon,
	renderCityList,
	renderError,
	clearError,
	setLoader,
	renderWeatherData,
	renderRecentChips,
	updateUnitToggle,
} from "./ui.js";

// Projede tutulan veriler
const STATE = {
	theme: localStorage.getItem("theme") || "dark",
	recent: JSON.parse(localStorage.getItem("recent") || "[]"),
	units: localStorage.getItem("units") || "metric",
};

//! Proje yüklendiği anda yapılacaklar
// Body elementine eriş
const body = document.body;

// Body e tema değerini attribute olarak ekle
body.setAttribute("data-theme", STATE.theme);

// Sayfa ilk yüklendiğinde doğru ikonun ekrana gelmesini sağla
updateThemeIcon(STATE.theme);

//! Fonksiyonlar
// Mevcut değerleri local storage a kaydet
const persist = () => {
	localStorage.setItem("theme", STATE.theme);
	localStorage.setItem("recent", JSON.stringify(STATE.recent));
	localStorage.setItem("units", STATE.units);
};

// Son aratılanlara ekleme yapan fonksiyon
const pushRecent = (city) => {
	// Son aratılanı diziye ekle
	// Dizide aynı şehir isminden max 1 tane olmalı
	// Yeni elemanı dizinin en başına eklemeli
	// En son aratılanı 6 şehirle sınırla
	const updated = [
		city,
		...STATE.recent.filter((c) => c.toLowerCase() !== city.toLowerCase()),
	].slice(0, 6);
	// State nesnesini güncelle
	STATE.recent = updated;
	// Son aratılanları ekrana bas
	renderRecentChips(STATE.recent, (city) => {
		uiElement.searchInput.value = city;
		handleSearch(city);
	});
	// Son güncellemeleri local storage a kaydet
	persist();
};

// Form gönderilince çalışan fonksiyon
const handleSearch = async (city) => {
	// Şehir ismini al
	const name = city.trim();

	// Şehir ismi girilmediyse ekrana hatayı bas
	if (!name) {
		renderError("Şehir ismi zorunludur");
		return;
	}

	// Önceden hata varsa temizle
	clearError();

	// Ekrana loader bas
	setLoader(true);

	try {
		// Api'dan hava durumu verilerini al
		const data = await getWeatherData(city, STATE.units);

		// Şehir bulunamazsa ekrana hatayı bas
		if (data.cod === "404") {
			return renderError("Şehir bulunamdı");
		}

		// Bayrak için url oluştur
		const flagUrl = getFlagUrl(data.sys.country);

		// Son aratılanları güncelle
		pushRecent(name);

		// Ekrana hava durumu verisini bas
		renderWeatherData(data, flagUrl, STATE.units);
	} catch (error) {
		// Api'dan hata geldiyse ekrana bas
		renderError(error.message || "Şehir bulunamadı");
	} finally {
		// api'dan cevap gelince loader'ı ekrandan kaldır
		setLoader(false);
	}
};

// Kullanıcının konumuna göre ara
const handleGeoSearch = () => {
	window.navigator.geolocation.getCurrentPosition(
		// Kullanıcı izin verirse
		async (position) => {
			const { latitude, longitude } = position.coords;

			setLoader(true);

			const data = getWeatherByCoords(latitude, longitude);
			setLoader(false);

			const flagUrl = getFlagUrl(data.sys.country);

			renderWeatherData(data, flagUrl);
		},
		() => {
			renderError("Konum bilgisi alınamadı");
		}
	);
};

// ! Events

// Form gönderildiğinde
uiElement.searchForm.addEventListener("submit", (e) => {
	e.preventDefault();

	const city = uiElement.searchInput.value;

	handleSearch(city);
});

// Tema butonuna tıklanma olayını izle
uiElement.themeBtn.addEventListener("click", () => {
	// STATE'de tutulan tema değerinin tersini al
	STATE.theme = STATE.theme === "light" ? "dark" : "light";

	// tema değerini body'e attribute olarak ekle
	body.setAttribute("data-theme", STATE.theme);

	// son temayı local storage'a kaydet
	persist();

	// iconu güncelle
	updateThemeIcon(STATE.theme);
});

// Konum butonuna tıklanma olayını izle
uiElement.unitToggle.querySelectorAll("button").forEach((btn) => {
	btn.addEventListener("click", async () => {
		// hangi birim şeçildi
		const nextUnits = btn.value;

		// aynı birim seçildiyse fonksiyonu durdur
		if (STATE.units === nextUnits) return;

		// seçili birimi tutuğumuz değişkeni güncelle
		STATE.units = nextUnits;

		// local storage'a son güncellemleri kaydet
		persist();

		// arayüzü güncelle
		updateUnitToggle(nextUnits);

		// son yapılan aratmayı yeni seçilen birime göre tekrarla
		handleSearch(STATE.recent[0]);
	});
});
