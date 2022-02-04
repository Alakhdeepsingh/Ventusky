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
      countries.forEach((coutry) => {
        countriesOptions += `<option value="${coutry.iso2}">${coutry.name}</option>`;
      });
  
      countriesListDropDown.innerHTML = countriesOptions;
    }
});