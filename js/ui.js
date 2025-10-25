import { getFlagUrl } from "./api.js";
import { cities } from "./constants.js";

// arayüz elementleri
const uiElement = {
	themeBtn: document.querySelector(".theme-btn"),
	locateBtn: document.querySelector("#locate-btn"),
	dataList: document.querySelector("#city-list"),
	searchForm: document.querySelector("#search-form"),
	searchInput: document.querySelector("#city-input"),
	errorContainer: document.querySelector("#error-message"),
	loader: document.querySelector("#loader"),
	weatherContainer: document.querySelector(".weather-container"),
	recentChips: document.querySelector("#recent-chips"),
	unitToggle: document.querySelector(".unit-toggle"),
};

// Tema iconuna güncelleme yapar. Gelen parametreye göre
const updateThemeIcon = (theme) => {
	const icon = uiElement.themeBtn.querySelector("i");
	icon.className = theme == "light" ? "bi bi-moon-fill" : "bi bi-sun-fill";
};

// Şehirleri listele
const renderCityList = () => {
	cities.forEach((city) => {
		const opt = document.createElement("option");
		opt.value = city;
		uiElement.dataList.appendChild(opt);
	});
};

// Hata mesajını ekrana bas
const renderError = (message) => {
	uiElement.errorContainer.textContent = message;
	uiElement.errorContainer.classList.add("show");
};

// Hata mesajını kaldır
const clearError = () => {
	uiElement.errorContainer.textContent = "";
	uiElement.errorContainer.classList.remove("show");
};

// Loaderi gizle/göster
const setLoader = (visiable) => {
	uiElement.loader.classList.toggle("show", visiable);
};

// Unix zaman formatında gelen veriyi fotmatlayan fonksiyon
const formatTime = (unixTime, units) => {
	const d = new Date(unixTime * 1000);
	return d.toLocaleTimeString(units == "imperial" ? "en" : "tr", {
		hour: "2-digit",
		minute: "2-digit",
	});
};

// Ekrana hava durumu bilgilerini bas
const renderWeatherData = (data, flagUrl, units = "metric") => {
	clearError();

	// Unit parametresine göre ekrana basılacak değeri belirler
	const tempUnit = units === "imperial" ? "F" : "°C";

	// Unit parametresine göre hız birimine de belirle
	const speedUnit = units === "imperial" ? "mph" : "m/s";

	uiElement.weatherContainer.innerHTML = `
      <article class="weather-card">
            <!-- header -->
            <div class="weather-header">
              <div class="location-info">
                <h2>${data.name}, ${data.sys.country}</h2>
                <div> <img src="${flagUrl}" alt="bayrak" /> </div>
              </div>
              <p id="date">${new Date().toLocaleDateString("tr", {
								day: "2-digit",
								month: "long",
								year: "numeric",
							})}</p>
            </div>

            <!-- havadurumu verisi -->
            <div class="weather-info">
              <div class="temperature">
                <h3>${data.main.temp} ${tempUnit}</h3>
                <p>Hissedilen <span>${
									data.main.feels_like
								} ${tempUnit}</span></p>
              </div>

              <div class="weather-icon">
                <img src="https://openweathermap.org/img/wn/${
									data.weather[0].icon
								}@4x.png" />
                <p>${data.weather[0].description}</p>
              </div>
            </div>

            <!-- detaylar -->
            <div class="weather-details">
              <!-- detay -->
              <div class="details">
                <i class="bi bi-arrow-down"></i>
                <div>
                  <p>Min</p>
                  <b>${data.main.temp_min} ${tempUnit}</b>
                </div>
              </div>
              <!-- detay -->
              <div class="details">
                <i class="bi bi-arrow-up"></i>
                <div>
                  <p>Max</p>
                  <b>${data.main.temp_max} ${tempUnit}</b>
                </div>
              </div>
              <!-- detay -->
              <div class="details">
                <i class="bi bi-wind"></i>
                <div>
                  <p>Rüzgar Hızı</p>
                  <b>${data.wind.speed} ${speedUnit}</b>
                </div>
              </div>
              <!-- detay -->
              <div class="details">
                <i class="bi bi-wind"></i>
                <div>
                  <p>Rüzgar Derecesi</p>
                  <b>${data.wind.deg}°</b>
                </div>
              </div>
              <!-- detay -->
              <div class="details">
                <i class="bi bi-droplet"></i>
                <div>
                  <p>Nem</p>
                  <b>${data.main.humidity} %</b>
                </div>
              </div>
              <!-- detay -->
              <div class="details">
                <i class="bi bi-speedometer2"></i>
                <div>
                  <p>Basınç</p>
                  <b>${data.main.pressure} hPa</b>
                </div>
              </div>
              <!-- detay -->
              <div class="details">
                <i class="bi bi-eye"></i>
                <div>
                  <p>Görüş</p>
                  <b>${data.visibility / 1000} ${speedUnit}</b>
                </div>
              </div>
              <!-- detay -->
              <div class="details">
                <i class="bi bi-cloud"></i>
                <div>
                  <p>Bulut</p>
                  <b>${data.clouds.all} %</b>
                </div>
              </div>
              <!-- detay -->
              <div class="details">
                <i class="bi bi-sun"></i>
                <div>
                  <p>Gün Doğumu</p>
                  <b>${formatTime(data.sys.sunrise, units)}</b>
                </div>
              </div>
              <!-- detay -->
              <div class="details">
                <i class="bi bi-moon"></i>
                <div>
                  <p>Gün Batımı</p>
                  <b>${formatTime(data.sys.sunset, units)}</b>
                </div>
              </div>
            </div>
          </article>
  `;
};

// Son aratmaları ekranda göster
const renderRecentChips = (recentCities, onSelect) => {
	uiElement.recentChips.innerHTML = "";

	recentCities.forEach((city) => {
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "chip";
		btn.textContent = city;
		btn.addEventListener("click", () => onSelect(city));
		uiElement.recentChips.appendChild(btn);
	});
};

// Seçili birimi güncelle
const updateUnitToggle = (units) => {
	uiElement.unitToggle.querySelectorAll("button").forEach((btn) => {
		// Butonun değeri seçilen birim değerine eşit mi
		const isActive = btn.value === units;
		btn.classList.toggle("active", isActive);
	});
};

// Değişken/Fonksiyonların diğer dosyalarda kullanmak için export et
export {
	uiElement,
	updateThemeIcon,
	renderCityList,
	renderError,
	clearError,
	setLoader,
	renderWeatherData,
	renderRecentChips,
	updateUnitToggle,
};
