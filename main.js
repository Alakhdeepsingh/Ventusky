const config = {
  cUrl: "https://api.countrystatecity.in/v1/countries",
  cKey: "QUlGamNYN1dUblVvSENNZlpTdjRXOTBKWUxlNmk5WTRPM29ZZDlJbA==",
  wUrl: "https://api.openweathermap.org/data/2.5/",
  wKey: "4bf478b2a273f25aa04e3e46c41a039e",
};
// get countries

const getCountries = async (fieldName, ...args) => {
  let apiEndPoint;
  switch (fieldName) {
      case "countries":
          apiEndPoint = config.cUrl;
          break;
      case "states":
          apiEndPoint = `${config.cUrl}/${args[0]}/states`;
          break;
      case "cities":
          apiEndPoint = `${config.cUrl}/${args[0]}/states/${args[1]}/cities`;
          //${config.url}/IN/states/UP/cities
      default:
  }

  const response = await fetch(apiEndPoint, {
      headers: {
          "X-CSCAPI-KEY": config.cKey
      },
  });
  if (response.status != 200) {
      throw new Error(`Something went wrong, status code: ${response.status}`);
  }
  const countries = await response.json();
  return countries;
};

const getWeather = async (cityName, ccode, units = "metric") => {
  const apiEndPoint = `${config.wUrl}weather?q=${cityName},${ccode.toLowerCase()}&APPID=${config.wKey}&units=${units}`;
  // console.log(apiEndPoint);
  try {
      const response = await fetch(apiEndPoint);
      if (response.status != 200) {
          if (response.status == 404) {
              weatherDiv.innerHTML = `<div class="alert-danger">
                          <h3>Oops! No data available.</h3>
                          </div>`;
          } else {
              throw new Error(`Something went wrong, status code: ${response.status}`);
          }
      }
      const weather = await response.json();
      return weather;
  } catch (error) {
      console.log(error);
  }
};

const getDateTime = (unixTimeStamp) => {
  const millisecond = unixTimeStamp * 1000;
  const dateObject = new Date(millisecond);
  const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
  };
  const humanDateFormate = dateObject.toLocaleDateString("en-US", options);
  return humanDateFormate;
};
const tempCard = (val, unit = "cel") => {
  const flag = unit == "far" ? "°F" : "°C";
  return `<div id="temp-card">
<h6 class="card-subtitle mb2 ${unit}">${val.temp}</h6>
<p class="card-text">Feels Like:${val.temp} ${flag}</p>
<p class="card-text">Max:${val.temp_max} ${flag}, Min:${val.temp_min} ${flag}</p>
</div>`;
}

const displayWeather = (data) => {
  const weatherWidget = `<div class="card">
<div class ="card-body">
              <!-- A card is a flexible and extensible content container. It includes options for headers and footers, a wide variety of content, contextual background colors, and powerful display options -->
              <div class="card-body">
                  <!-- The building block of a card is the .card-body. Use it whenever you need a padded section within a card. -->
                  <h5 class="card-title">
                      ${data.name},${data.sys.country} <span class="float-end units"><a href="#" class="unitlink active" data-unit="cel">°C</a> | <a href="#" data-unit="far" class="unitlink">°F</a></span> 
                  </h5>
                  <p>${getDateTime(data.dt)}</p>
                  <div id="tempcard">${tempCard(data.main)}</div>
                  ${data.weather.map(
                    (w)=>` <div id="img-container">${w.main}<img src="https://openweathermap.org/img/wn/${w.icon}.png"/></div>
                  <p>${w.description}</p>`).join("\n")}
                  
              </div>
          </div>`;
  weatherDiv.innerHTML = weatherWidget;
}
const getLoader = () => {
  return `<div class="spinner-grow text-info" role="status">
  <span class="visually-hidden">Loading...</span>
</div>`;
};

const countriesListDropDown = document.querySelector("#countrylist");
const statesListDropDown = document.querySelector("#statelist");
const citiesListDropDown = document.querySelector("#citylist");
const weatherDiv = document.querySelector("#weatherwidget")

// on content load
document.addEventListener("DOMContentLoaded", async () => {
  const countries = await getCountries("countries");
  // console.log(countries);
  let countriesOptions = "";
  if (countries) {
      countriesOptions += `<option value="">Country</option>`;
      countries.forEach((country) => {
          countriesOptions += `<option value="${country.iso2}">${country.name}</option>`;
      });

      countriesListDropDown.innerHTML = countriesOptions;
  }


  // List states
  countriesListDropDown.addEventListener("change", async function() {
      const selectedCountryCode = this.value;
      //console.log('selectedCountryCode',selectedCountryCode);
      const states = await getCountries("states", selectedCountryCode);
      //console.log(states);
      let statesOptions = "";
      if (states) {
          statesOptions += `<option value="">State</option>`;
          states.forEach((state) => {
              statesOptions += `<option value="${state.iso2}">${state.name}</option>`;
          });

          statesListDropDown.innerHTML = statesOptions;
          statesListDropDown.disabled = false;
          citiesListDropDown.innerHTML = "";
          //as we have disabled in htm so for enabling we will use this line
      }
  });


  //list cities 

  statesListDropDown.addEventListener("change", async function() {
      const selectedCountryCode = countriesListDropDown.value;
      const selectedStateCode = this.value;
      //console.log('selectedCountryCode',selectedCountryCode);
      const cities = await getCountries("cities", selectedCountryCode, selectedStateCode);
      console.log(cities);
      let citiesOptions = "";
      if (cities) {
          citiesOptions += `<option value="">City</option>`;
          cities.forEach((city) => {
              citiesOptions += `<option value="${city.name}">${city.name}</option>`;
          });

          citiesListDropDown.innerHTML = citiesOptions;
          citiesListDropDown.disabled = false;
      }
  });
  citiesListDropDown.addEventListener("change", async function() {
      const selectedCountryCode = countriesListDropDown.value;
      const selectedCity = this.value;
      // console.log(selectedCity);
      weatherDiv.innerHTML = getLoader();
      const weatherInfo = await getWeather(selectedCity, selectedCountryCode);
      // console.log(weatherInfo);
      displayWeather(weatherInfo);

  });

  //change unit

  document.addEventListener("click", async (e) => {
      if (e.target.classList.contains("unitlink")) {
          e.preventDefault();
          const unitValue = e.target.getAttribute("data-unit");
          const selectedCountryCode = countriesListDropDown.value;
          const selectedCity = citiesListDropDown.value;

          const unitFlag = unitValue == "far" ? "imperial" : "metric";
          const weatherInfo = await getWeather(
              selectedCity,
              selectedCountryCode,
              unitFlag
          );
          const weatherTemp = tempCard(weatherInfo.main, unitValue);
          document.querySelector("#tempcard").innerHTML = weatherTemp;

          // active unit
          document.querySelectorAll(".unitlink").forEach((link) => {
              link.classList.remove("active");
          });
          e.target.classList.add("active");

      }
  });
});