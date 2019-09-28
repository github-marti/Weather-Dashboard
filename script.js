// global variables
const apiKey = "32d68f82674d25a88e4344fd3ae53c80"
const today = moment().format('MM/DD/YYYY');

function getCurrentWeather(city) {
    // variables for ajax get
    let queryURL = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&APPID=${apiKey}`

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response);

        // get latitude and longitude for the UV index
        const lat = response.coord.lat
        const lon = response.coord.lon

        // get weather icon url
        const iconURL = `http://openweathermap.org/img/w/${response.weather[0].icon}.png`

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
    let queryURL = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response);
    

        for (i = 1; i < 6; i++){
            let day = moment().add(i, 'days').format('MM/DD/YYYY');

            $(`#forecast-date-${i}`).text(day);
            $(`#forecast-temp-${i}`).text(response.list[4].main.temp);
            $(`#forecast-temp-${i}`).text(response.list[4].main.temp);
            $(`#forecast-temp-${i}`).text(response.list[4].main.temp);
        }
    })
}

function getUVIndex(lat, lon) {
    let queryURL = `http://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`

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

getCurrentWeather("Los Angeles");
getFiveDay("Los Angeles");