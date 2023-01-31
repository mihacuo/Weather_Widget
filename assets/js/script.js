//api key info
var apikey = "2167d8cde088f23028cd419e757d40c7";
// var APIURL = api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}

console.log("script.js connected");

//load local storage previous searches
var hist = JSON.parse(localStorage.getItem("history"));
if (hist) {
  console.log("local storage: ");
  console.log(hist);
  for (var i = 0; i < hist.length; i++) {
    var newButton = $("<button>");
    newButton.text(hist[i]);
    newButton.attr("name", hist[i]);
    $("#previous-searches").append(newButton);
    newButton.on("click", function (event) {
      console.log(event.target.name);
      $("#search-text").val(event.target.name);
      $("#search-button").click();
    });
  }
} else {
  console.log("first run, creeating blank history");
  hist = [];
}

//get some global variables to save response requests
var ggeo = "";
var gcurrent = "";
var g5day = "";

// attach event listeneer to submit button
$("#search-button").on("click", function (event) {
  event.preventDefault(); // prevent form submission
  console.log("clicked search button");
  var searchCity = $("#search-text").val();
  // check if city len is less than 3 symbols or blank
  if (searchCity.length < 3) {
    // not a number does not work need to test more
    alert(
      "Please enter the city, it should be more than 2 characters, not blank and not a number"
    );
    return;
  }
  // let's save to our search history
  //check if it is not already in the array
  if (! hist.includes(searchCity)) {
    hist.push(searchCity);
  localStorage.setItem("history", JSON.stringify(hist));
  // create new button
  var newButton = $("<button>");
  newButton.text(searchCity);
  newButton.attr("name", hist[i]);
  $("#previous-searches").append(newButton);
  newButton.on("click", function (event) {
    console.log(event.target.name);
    $("#search-text").val(event.target.name);
    $("#search-button").click();
  });
  }
  

  // lets get geo - decoding API going here
  var APIURL =
    "https://api.openweathermap.org/geo/1.0/direct?q=" +
    searchCity +
    "&appid=" +
    apikey +
    "&limit=1";
  $.ajax({
    url: APIURL,
    method: "GET",
  }).then(function (response) {
    ggeo = response;
    //get lat&lon
    lat = response[0].lat;
    lon = response[0].lon;

    //formulate a weather API call for the current data forecast(NOW weather)
    var APIURL =
      "https://api.openweathermap.org/data/2.5/weather?lat=" +
      lat +
      "&lon=" +
      lon +
      "&appid=" +
      apikey;
    $.ajax({
      url: APIURL,
      method: "GET",
    }).then(function (currentResponse) {
      //save to global var
      gcurrent = currentResponse;

      // now make a call to get 5 days / 3 hour forecast
      var APIURL =
        "https://api.openweathermap.org/data/2.5/forecast?lat=" +
        lat +
        "&lon=" +
        lon +
        "&appid=" +
        apikey;
      $.ajax({
        url: APIURL,
        method: "GET",
      }).then(function (futureResponse) {
        //save to global var for analysis
        g5day = futureResponse;
        //call external function with current and future reponse
        displayWeather(currentResponse, futureResponse, searchCity);
      });
    });
  });
});

function displayWeather(current, future, searchCity) {
  console.log(current, future);

  // add current weather data first
  $("#weather-now").empty();
  var dateForecast = moment.unix(current.dt).format("D/M/YYYY");
  var city = $("<p>").text(
    searchCity + ", place: "+
    current.name + "(" + current.sys.country + ")" + ". Date: " + dateForecast
  );
  city.addClass("large-data");
  //let's out or image for the weathrer icon
  var imgSRC = current.weather[0].main.toLowerCase();
  var imgURL =
    "https://filedn.com/lnApIFqb0BxF9k3HWnqiKe0/wec9/images/" + imgSRC + ".png";
  var icon = $("<img>");
  icon.attr("src", imgURL);
  icon.attr("width", "45px");
  var temp = $("<p>").text(
    "Temp: " + (current.main.temp - 273.15).toFixed(2) + "\u00B0C"
  );
  var wind = $("<p>").text("Wind: " + current.wind.speed + " KPH");
  var humidity = $("<p>").text("Humidity: " + gcurrent.main.humidity + "%");
  // adding elements to the current weather section of the site
  $("#weather-now").append(city, icon, temp, wind, humidity);

  // add 5 days forecast now
  $("#five-day-forecast").empty();

    // NEED To re-work, as currently extracts from the first 5 items of list. But should extract from the 5 days!!!
    // currently manually extracted
    // not best way

  var neededItems = [5, 14, 22, 30, 38]
  for (var j = 0; j < neededItems.length; j++) {
    var i = neededItems[j];
    var oneDayArticle = $("<article>").addClass("one-day-forecast");
    var dateForecast = moment.unix(future.list[i].dt).format("D/M/YYYY");
    var dateStamp = $("<p>").text(dateForecast);
    dateStamp.addClass("large-data-5day");
    // lets get image
    var imgSRC = future.list[i].weather[0].main.toLowerCase();
    var imgURL =
      "https://filedn.com/lnApIFqb0BxF9k3HWnqiKe0/wec9/images/" +
      imgSRC +
      ".png";
    var icon = $("<img>");
    icon.attr("src", imgURL);
    icon.attr("width", "45px");

    var temp = $("<p>").text(
      "Temp: " + (future.list[i].main.temp - 273.15).toFixed(2) + "\u00B0C"
    );
    var wind = $("<p>").text("Wind: " + future.list[i].wind.speed + " KPH");
    var humidity = $("<p>").text(
      "Humidity: " + future.list[i].main.humidity + "%"
    );
    oneDayArticle.append(dateStamp, icon, temp, wind, humidity);
    $("#five-day-forecast").append(oneDayArticle);
  }
}

// <article class="one-day-forecast">
//   <p class="large-date">15/9/2022</p>
//   <p>===icon image change to img tag===</p>
//   <p class="details">Temp: 18.89 C</p>
//   <p class="details">Wind: 2.76 KPH C</p>
//   <p class="details">Humidity: 44%</p>
// </article>;

// <section id="weather-now">
// <p class="large-data"> London (15/9/2022)</p>
// <p>===icon image change to img tag===</p>
// <p class="details">Temp: 18.89 C</p>
// <p class="details">Wind: 2.76 KPH C</p>
// <p class="details">Humidity: 44%</p>
// </section
