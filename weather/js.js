const cityInput = document.querySelector('.city_input');
const searchBtn = document.querySelector('.seacrh_btn');

const weatherInfoSection = document.querySelector('.weather_info');
const searchCitySection = document.querySelector('.search_city');
const notFoundSection = document.querySelector('.not_found');

const countryTxt = document.querySelector('.country_txt');
const tempTxt = document.querySelector('.temp_txt'); 
const conditionTxt = document.querySelector('.condition_txt');
const humidityTxt = document.querySelector('.humidity_value_txt');
const windTxt = document.querySelector('.wind_value_txt');
const weatherSummaryImg = document.querySelector('.weather_summary_img');
const currentDataTxt = document.querySelector('.current_date_txt');

const apiKey = '1b449920497534dc085c801b953b4599';

searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

async function getFetchData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('City not found'); 
    return response.json();
}

async function updateWeatherInfo(city) {
	try {
	    const weatherData = await getFetchData(city);
	    const {
		   name: country,
		   main: { temp, humidity },
		   weather: [{ main, icon }],
		   wind: { speed }
	    } = weatherData;
 
	    countryTxt.textContent = country;
	    tempTxt.textContent = Math.round(temp) + '°C';
	    conditionTxt.textContent = main;
	    humidityTxt.textContent = humidity + '%';
	    windTxt.textContent = speed + ' M/s';
 
	    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
	    weatherSummaryImg.src = iconUrl;
	    weatherSummaryImg.alt = main;
 
	    displayCurrentDate();
	    await updateForecast(city); 
	    displaySection(weatherInfoSection);
	} catch (error) {
	    console.error("Error fetching weather data:", error.message);
	    displaySection(notFoundSection);
	}
 }
 

function displayCurrentDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    currentDataTxt.textContent = now.toLocaleDateString('en-GB', options);
}

async function updateForecast(city) {
	const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
	const response = await fetch(apiUrl);
	const forecastData = await response.json();
 
	if (forecastData.cod !== '200') {
	    console.error("Error fetching forecast data:", forecastData.message);
	    return;
	}
 
	const forecastItemsContainer = document.querySelector('.forecast_items_container');
	forecastItemsContainer.innerHTML = ''; 
 
	const dailyForecasts = {};
	forecastData.list.forEach(item => {
	    const date = new Date(item.dt * 1000).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
	    if (!dailyForecasts[date]) {
		   dailyForecasts[date] = item; 
	    }
	});
 
	Object.values(dailyForecasts).forEach(forecast => {
	    const date = new Date(forecast.dt * 1000).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
	    const temp = Math.round(forecast.main.temp) + '°C';
	    const iconUrl = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
 
	    const forecastItem = document.createElement('div');
	    forecastItem.classList.add('forecast_item');
	    forecastItem.innerHTML = `
		   <h5 class="forecast_item_date">${date}</h5>
		   <img src="${iconUrl}" class="forecast_item_img" alt="${forecast.weather[0].description}">
		   <h5 class="forecast_item_temp">${temp}</h5>
	    `;
	    forecastItemsContainer.appendChild(forecastItem);
	});
}

async function getWeatherById(id) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);
    return response.json();
}

function displaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection].forEach(sec => sec.style.display = 'none');
    section.style.display = 'flex';
}
