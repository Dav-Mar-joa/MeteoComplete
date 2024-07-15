const cityInput = document.getElementById('city');
cityInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        getWeather();
    }
});
document.getElementById('getWeather').addEventListener('click', getWeather);
document.getElementById('found_me').addEventListener('click', locateMe);

function displayError(message) {
    document.getElementById('weatherInfo').innerHTML = `<tr><td style="background-color: blue;" colspan="7">${message}</td></tr>`;
    document.getElementById('bubble').style.display = 'none';
}

function getWeather() {
    const city = document.getElementById('city').value;
    const openWeatherApiKey = '2dec67f041a37a3333796cc816ca6b9e';
    const weatherApiKey = 'f9cc340e26b240188b2195245242805';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openWeatherApiKey}&units=metric&lang=fr`;

    if (city === '') {
        displayError("Veuillez entrer le nom d'une ville");
        return;
    }

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                displayError(data.message);
                return;
            }

            // Affichage des données brutes dans la console
            console.log('OpenWeatherMap Current Weather Data:', data);

            const dtUnix = data.dt;
            const timeZoneOffset = data.timezone;
            const dtMillis = dtUnix * 1000;
            const localTimeMillis = dtMillis + (timeZoneOffset * 1000) - 7200 * 1000;
            const localTimeDate = new Date(localTimeMillis);
            const localHours = localTimeDate.getHours();
            const localMinutes = localTimeDate.getMinutes();
            const formattedLocalTime = `${localHours.toString().padStart(2, '0')}:${localMinutes.toString().padStart(2, '0')}`;

            const dtUnix_rise = data.sys.sunrise;
            const timeZoneOffset_rise = data.timezone;
            const dtMillis_rise = dtUnix_rise * 1000;
            const localTimeMillis_rise = dtMillis_rise + (timeZoneOffset_rise * 1000) - 7200 * 1000;
            const localTimeDate_rise = new Date(localTimeMillis_rise);
            const localHours_rise = localTimeDate_rise.getHours();
            const localMinutes_rise = localTimeDate_rise.getMinutes();
            const formattedLocalTime_rise = `${localHours_rise.toString().padStart(2, '0')}:${localMinutes_rise.toString().padStart(2, '0')}`;

            const dtUnix_set = data.sys.sunset;
            const timeZoneOffset_set = data.timezone;
            const dtMillis_set = dtUnix_set * 1000;
            const localTimeMillis_set = dtMillis_set + (timeZoneOffset_set * 1000) - 7200 * 1000;
            const localTimeDate_set = new Date(localTimeMillis_set);
            const localHours_set = localTimeDate_set.getHours();
            const localMinutes_set = localTimeDate_set.getMinutes();
            const formattedLocalTime_set = `${localHours_set.toString().padStart(2, '0')}:${localMinutes_set.toString().padStart(2, '0')}`;

            // <tr>
            //     <td colspan="7" class="horizontal-line"></td>
            // </tr>

            const lat = data.coord.lat;
            const lon = data.coord.lon;
            const apiUrl_pollution = `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric&lang=fr`;

            fetchUVData(lat, lon).then(uvData => {
                fetchWeatherDataForPeriods(city).then(({ periods, moonPhase, MoonPhase_image, totalprecip, date_formatted }) => {
                    fetch(apiUrl_pollution)
                        .then(response => response.json())
                        .then(pollutionData => {
                            // Affichage des données brutes dans la console
                            console.log('OpenWeatherMap Air Pollution Data:', pollutionData);

                            const pm_2_5 = pollutionData.list[0].components.pm2_5;
                            const aqi = pollutionData.list[0].main.aqi;

                            let airQualityImage = '';
                            if (pm_2_5 >= 0 && pm_2_5 < 10) {
                                airQualityImage = 'indice_1.PNG';
                            } else if (pm_2_5 >= 10 && pm_2_5 < 25) {
                                airQualityImage = 'indice_2.PNG';
                            } else if (pm_2_5 >= 25 && pm_2_5 < 50) {
                                airQualityImage = 'indice_3.PNG';
                            } else if (pm_2_5 >= 50 && pm_2_5 < 75) {
                                airQualityImage = 'indice_4.PNG';
                            } else {
                                airQualityImage = 'indice_5.PNG';
                            }

                            const weatherInfo = `
                            <table>
                            <tr>
                                <th class="titre" colspan="5"></th>
                                <th rowspan="2" class="th_image"  style="height:5%">
    <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Icône de la météo actuelle">
</th>
                            </tr>
                            <tr> 
                                <th></th>
                                <th> Heure locale: ${formattedLocalTime}</th>
                                <div class="encadrement">
                                    <th>${date_formatted.length > 0 ? date_formatted[0] : ''}</th>
                                    <th colspan ="2"> Température actuelle : ${data.main.temp} °C</th>
                                </div>      
                            </tr>
                            <tr>
                                <td></td>
                            </tr>
                            <tr>
                                <th>${data.sys.country}</th>
                                <th class="encadrement">Lever du soleil</th>
                                <th class="encadrement">Coucher du soleil</th>
                                <th class="encadrement">Vent</th>
                                <th class="encadrement">Indice UV (/13)</th>
                                <th class="encadrement">Humidité</th>
                            </tr>
                            <tr>
                                <td>${data.name}</td>
                                <td>${formattedLocalTime_rise}</td>
                                <td>${formattedLocalTime_set}</td>
                                <td>${data.wind.speed} m/s</td>
                                <td>UV : ${uvData.uv} (Max: ${uvData.maxUv})</td>
                                <td>${data.main.humidity} %</td>
                                <td></td>
                            </tr>
 
                            
                            <tr>
                                <th colspan="7"> Météo prévisions 5 jours : </th>
                            </tr>
                            <tr>
                                <td></td>
                            </tr>
                            
                       
                            <tr>
                                <th >Jour</th>
                                <th class="encadrement" >Température Min / Max</th>
                                <th class="encadrement" >Total Précipitation</th>
                                <th class="encadrement" >Météo : Matin</th>
                                <th class="encadrement" >Météo : Midi</th>
                                <th class="encadrement" >Météo : Soir </th>
                            </tr>

                            ${date_formatted.map((date, index) => `
                                <tr>
                                    <td>${date}</td>
                                    <td>${periods[index].minTemp} / ${periods[index].maxTemp}°C</td>
                                    <td>${totalprecip[index]} mm</td>
                                    <td class = "td_image" > <img src="https:${periods[index].icon_morning}" alt="${periods[index].description}"></td>
                                    <td class = "td_image" ><img src="https:${periods[index].icon_afternoon}" alt="${periods[index].description}"></td>
                                    <td class = "td_image" ><img src="https:${periods[index].icon_evening}" alt="${periods[index].description}"></td>
                                </tr>
                            `).join('')}


                            </table>
                        `;

                            document.getElementById('weatherInfo').innerHTML = weatherInfo;
                            document.getElementById('bubble').style.display = 'block';

                        })
                        .catch(error => {
                            console.error("Erreur lors de la récupération de la pollution de l'air :", error);
                            displayError("Erreur lors de la récupération de la pollution de l'air");
                        });
                }).catch(error => {
                    console.error("Erreur lors de la récupération des prévisions météorologiques :", error);
                    displayError("Erreur lors de la récupération des prévisions météorologiques");
                });
            }).catch(error => {
                console.error("Erreur lors de la récupération de l'indice UV :", error);
                displayError("Erreur lors de la récupération de l'indice UV");
            });
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des données météorologiques :", error);
            displayError("Erreur lors de la récupération des données météorologiques");
        });
}

function locateMe() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const reverseGeocodeApiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`;

            fetch(reverseGeocodeApiUrl)
                .then(response => response.json())
                .then(data => {
                    const city = data.city;
                    document.getElementById('city').value = city;
                    getWeather();
                })
                .catch(error => {
                    console.error("Erreur lors de la géolocalisation inverse :", error);
                    displayError("Erreur lors de la géolocalisation inverse");
                });
        }, error => {
            console.error("Erreur lors de la récupération des coordonnées :", error);
            displayError("Erreur lors de la récupération des coordonnées");
        });
    } else {
        displayError("La géolocalisation n'est pas supportée par ce navigateur.");
    }
}

function fetchUVData(lat, lon) {
    const weatherApiKey = 'f9cc340e26b240188b2195245242805';
    const uvApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${lat},${lon}&days=1&aqi=no&alerts=no`;
    return fetch(uvApiUrl)
        .then(response => response.json())
        .then(data => {
            // Affichage des données brutes dans la console
            console.log('WeatherAPI UV Data:', data);
            return {
                uv: data.current.uv,
                maxUv: data.forecast.forecastday[0].day.uv,
            };
        });
}

function fetchWeatherDataForPeriods(city) {
    const weatherApiKey = 'f9cc340e26b240188b2195245242805';
    const weatherApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${city}&days=5&aqi=no&alerts=no`;
    return fetch(weatherApiUrl)
        .then(response => response.json())
        .then(data => {
            // Affichage des données brutes dans la console
            console.log('WeatherAPI Forecast Data:', data);

            const periods = data.forecast.forecastday.map(forecast => ({
                minTemp: forecast.day.mintemp_c,
                maxTemp: forecast.day.maxtemp_c,
                description: forecast.day.condition.text,
                icon: forecast.day.condition.icon,
                icon_morning: forecast.hour.find(hourData => hourData.time.split(' ')[1] === '08:00').condition.icon,
                icon_afternoon: forecast.hour.find(hourData => hourData.time.split(' ')[1] === '16:00').condition.icon,
                icon_evening: forecast.hour.find(hourData => hourData.time.split(' ')[1] === '20:00').condition.icon,
            }));

            const moonPhase = data.forecast.forecastday[0].astro.moon_phase;
            const MoonPhase_image = data.forecast.forecastday[0].astro.MoonPhase_image;
            const totalprecip = data.forecast.forecastday.map(forecast => forecast.day.totalprecip_mm);

            // Get day of the week
            const date_formatted = data.forecast.forecastday.map(forecast => {
                const date = new Date(forecast.date);
                // date=date.charAt(0).toUpperCase() + date.slice(1);
                const options = { weekday: 'long', month: 'long', day: 'numeric' };
                return date.toLocaleDateString('fr-FR', options);
                
            // const date_formatted = data.forecast.forecastday.map(forecast => {
            //     const date = new Date(forecast.date);
            //     const options = { weekday: 'long' };
            //     let frenchDay = new Intl.DateTimeFormat('fr-FR', options).format(date);
            //     frenchDay =frenchDay.charAt(0).toUpperCase() + frenchDay.slice(1);
            //     return frenchDay;

                
            });

            return { periods, moonPhase, MoonPhase_image, totalprecip, date_formatted };
        });
}
