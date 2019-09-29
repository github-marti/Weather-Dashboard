// global variables
const apiKey = "32d68f82674d25a88e4344fd3ae53c80"
const today = moment().format('MM/DD/YYYY');
const citiesArray = [];


function getCurrentWeather(city) {
    // code to get data from api
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&APPID=${apiKey}`

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response);

        // get latitude and longitude for the UV index
        const lat = response.coord.lat
        const lon = response.coord.lon

        // get weather icon url
        let iconURL = `https://openweathermap.org/img/w/${response.weather[0].icon}.png`

        // convert m/s to knots
        const windSpeed = response.wind.speed * 1.944

        // call UV index function
        getUVIndex(lat, lon);

        // populates text with data from weather API
        $('#city-name').text(response.name);
        $('#current-date').text(`(${today})`);
        $('#weather-icon').attr('src', iconURL);
        $('#current-temp').text(`${response.main.temp.toFixed(1)} \xB0F`);
        $('#current-hum').text(`${response.main.humidity}%`)
        $('#wind-speed').text(`${windSpeed.toFixed(2)} knots`)
    
    })
}

function getFiveDay(city) {
    // code to get data from api
    let queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`

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
}

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

function loadData() {
    let storedCities = JSON.parse(localStorage.getItem('cities'));

    if (storedCities !== null) {
        for (let i = 0; i < storedCities.length; i++) {
            citiesArray.push(storedCities[i])
            let p = $('<p>').text(storedCities[i]);
            p.addClass('list-item');
            $('#search-display').prepend(p);
        }
    }

    getCurrentWeather(storedCities[storedCities.length-1]);
    getFiveDay(storedCities[storedCities.length-1]);
}

function storeData(city) {
    citiesArray.push(city);
    localStorage.setItem('cities', JSON.stringify(citiesArray));
}

function clearData() {
    localStorage.clear();
    $('#search-display').html('');
}

$('#submit-button').on('click', function() {

    let city = $('#search-bar').val();
    let p = $('<p>').text(city);
    p.addClass('list-item');
    $('#search-display').prepend(p);

    getCurrentWeather(city);
    getFiveDay(city);

    storeData(city);
})

$('#search-display').on('click', '.list-item', function() {
    console.log('click');
    let city = $(this).text();
    console.log(city);
    getCurrentWeather(city)
    getFiveDay(city);
})

$('#clear-button').on('click', clearData);


loadData();

