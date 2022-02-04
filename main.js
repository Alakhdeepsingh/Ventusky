const config = {
  cUrl: "https://api.countrystatecity.in/v1/countries",
  cKey: "QUlGamNYN1dUblVvSENNZlpTdjRXOTBKWUxlNmk5WTRPM29ZZDlJbA==",
  wUrl: "https://api.openweathermap.org/data/2.5/",
  wKey:   "4bf478b2a273f25aa04e3e46c41a039e",
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
    default:
  }

  const response = await fetch(apiEndPoint, {
    headers: { "X-CSCAPI-KEY": config.cKey },
  });
  if (response.status != 200) {
    throw new Error(`Something went wrong, status code: ${response.status}`);
  }
  const countries = await response.json();
  return countries;
};

const countriesListDropDown = document.querySelector("#countrylist");
const statesListDropDown = document.querySelector("#statelist");
const citiesListDropDown = document.querySelector("#citylist");

// on content load
document.addEventListener("DOMContentLoaded", async () => {
    const countries = await getCountries("countries");
    console.log(countries);
    let countriesOptions = "";
    if (countries) {
      countriesOptions += `<option value="">Country</option>`;
      countries.forEach((country) => {
        countriesOptions += `<option value="${country.iso2}">${country.name}</option>`;
      });
  
      countriesListDropDown.innerHTML = countriesOptions;
    }


    // List states
    countriesListDropDown.addEventListener("change", async function(){
        const selectedCountryCode=this.value;
        //console.log('selectedCountryCode',selectedCountryCode);
        const states= await getCountries("states",selectedCountryCode);
        console.log(states);
        let statesOptions = "";
        if (states) {
        statesOptions += `<option value="">State</option>`;
        states.forEach((state) => {
        statesOptions += `<option value="${state.iso2}">${state.name}</option>`;
      });
  
      statesListDropDown.innerHTML = statesOptions;
      statesListDropDown.disabled=false;
    }
    });


    //list cities 

        statesListDropDown.addEventListener("change", async function(){
        const selectedCountryCode=countriesListDropDown.value;
        const selectedStateCode=this.value;
        //console.log('selectedCountryCode',selectedCountryCode);
        const cities= await getCountries("cities",selectedCountryCode,selectedStateCode);
        console.log(cities);
        let citiesOptions = "";
        if (cities) {
        citiesOptions += `<option value="">City</option>`;
        cities.forEach((state) => {
        citiesOptions += `<option value="${state.iso2}">${state.name}</option>`;
      });
  
      citiesListDropDown.innerHTML = citiesOptions;
      citiesListDropDown.disabled=false;
    }
    });
});