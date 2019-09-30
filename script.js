// global variables
const apiKey = "32d68f82674d25a88e4344fd3ae53c80"
let citiesArray = [];

// function for getting local weather based on geolocation
function getLocalWeather(position) {
    // getting local time
    const localDay = moment().format('MM/DD/YYYY');
    // code to get data from api
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    let queryURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&APPID=${apiKey}`

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response);

        // get weather icon url
        let iconURL = `https://openweathermap.org/img/w/${response.weather[0].icon}.png`

        // call UV index function
        getUVIndex(lat, lon);

        // populates text with data from weather API
        $('#city-name').text(`${response.name}, ${response.sys.country}`);
        $('#current-date').text(`(${localDay})`);
        $('#weather-icon').attr('src', iconURL);
        $('#current-temp').text(`${response.main.temp.toFixed(1)} \xB0F`);
        $('#current-hum').text(`${response.main.humidity}%`)
        $('#wind-speed').text(`${response.wind.speed.toFixed(2)} mi/s`)
    });

    queryURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response);
        // sets array to start at 12 noon on following day
        let arrayIndex = 4;
    
        // for loop that runs 5 times to populate 5 day forecast cards
        for (i = 1; i < 6; i++){
            let day = moment().add(i, 'days').format('MM/DD/YYYY');
            let iconURL = `https://openweathermap.org/img/w/${response.list[arrayIndex].weather[0].icon}.png`

            $(`#forecast-date-${i}`).text(day);
            $(`#forecast-temp-${i}`).text(`${response.list[arrayIndex].main.temp.toFixed(1)} \xB0F`);
            $(`#forecast-hum-${i}`).text(response.list[arrayIndex].main.humidity + '%');
            $(`#forecast-image-${i}`).attr('src', iconURL);

            // moves array index up 24 hours
            arrayIndex += 8;
        }
    })
};

// function for getting current weather conditions
function getCurrentWeather(city) {
    // code to get data from api
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&APPID=${apiKey}`

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response);

        // get the local time
        const unixTime = response.dt + response.timezone;
        let today = moment.unix(unixTime).format("MM/DD/YYYY");

        // get latitude and longitude for the UV index
        const lat = response.coord.lat
        const lon = response.coord.lon

        // get weather icon url
        let iconURL = `https://openweathermap.org/img/w/${response.weather[0].icon}.png`

        // call UV index function
        getUVIndex(lat, lon);

        // populates text with data from weather API
        $('#city-name').text(`${response.name}, ${response.sys.country}`);
        $('#current-date').text(`(${today})`);
        $('#weather-icon').attr('src', iconURL);
        $('#current-temp').text(`${response.main.temp.toFixed(1)} \xB0F`);
        $('#current-hum').text(`${response.main.humidity}%`)
        $('#wind-speed').text(`${response.wind.speed.toFixed(2)} mi/s`)
        
        // calls function to get five day forecast
        getFiveDay(city, unixTime);

        // stores input in local storage
        storeData(city);

    })
}

// function for getting five day forecast
function getFiveDay(city, unixTime) {
    // code to get data from api
    let queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response);
        // sets array to start at 12 noon on following day
        let arrayIndex = 4;
        console.log(unixTime);
    
        // for loop that runs 5 times to populate 5 day forecast cards
        for (i = 1; i < 6; i++){
            let day = moment.unix(unixTime).add(i, 'days').format('MM/DD/YYYY');
            let iconURL = `https://openweathermap.org/img/w/${response.list[arrayIndex].weather[0].icon}.png`

            $(`#forecast-date-${i}`).text(day);
            $(`#forecast-temp-${i}`).text(`${response.list[arrayIndex].main.temp.toFixed(1)} \xB0F`);
            $(`#forecast-hum-${i}`).text(response.list[arrayIndex].main.humidity + '%');
            $(`#forecast-image-${i}`).attr('src', iconURL);

            // moves array index up 24 hours
            arrayIndex += 8;
        }
    })
}

// function for getting UV index
function getUVIndex(lat, lon) {
    let queryURL = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {        
        
        console.log(response);

        const index = response.value

        // sets UV index text
        $('#uv-index').text(index);

        // change background of UV index depending on severity
        if (index < 3) {
            $('#uv-index').attr('class', 'green');
        } else if (index < 6) {
            $('#uv-index').attr('class', 'yellow');
        } else if (index < 8) {
            $('#uv-index').attr('class', 'orange');
        } else {
            $('#uv-index').attr('class', 'red');
        }

        
    })
}

// function for loading data from local storage
function loadData() {
    let storedCities = JSON.parse(localStorage.getItem('cities'));
    
    if (storedCities === null) {
        navigator.geolocation.getCurrentPosition(getLocalWeather);
    } else {
    // adds a list item to search display for each item in array
    for (let i = 0; i < storedCities.length; i++) {
        citiesArray.push(storedCities[i])
        let p = $('<p>').text(storedCities[i]);
        p.addClass('list-item');
        $('#search-display').prepend(p);
        };
    };

    getCurrentWeather(storedCities[storedCities.length-1]);
}

// function for saving data to local storage
function storeData(city) {
    // pushes new city query into array and puts array into local storage
    if (citiesArray[citiesArray.length-1] !== city) {
        citiesArray.push(city);
        localStorage.setItem('cities', JSON.stringify(citiesArray));

        // adds a list item to search display
        let p = $('<p>').text(city);
        p.addClass('list-item');
        $('#search-display').prepend(p);
    }
}

// function for clearing data from local storage
function clearData() {
    citiesArray = [];
    localStorage.clear();
    $('#search-display').html('');
}

// event listener for the submit button
$('#submit-button').on('click', function() {
    // makes input into a standard capitalized format
    let cityInput = $('#search-bar').val();
    let city = cityInput.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    console.log(city);
    
    // let city = cityInput[0].toUpperCase() + cityInput.slice(1).toLowerCase();

    // calls current weather and five day forecast functions
    getCurrentWeather(city);
})

// event listener for previously searched list
$('#search-display').on('click', '.list-item', function() {
    // calls weather functions
    let city = $(this).text();
    getCurrentWeather(city)
})

// event listener for clear button
$('#clear-button').on('click', clearData);

// loads data
loadData();

