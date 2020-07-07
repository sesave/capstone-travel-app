const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const dotenv = require('dotenv');
const axios = require('axios');
const result = dotenv.config()

app.use(express.static('dist'))
var path = require('path')
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const WEATHERBIT_API_KEY = process.env.WEATHERBIT_API_KEY;
const API_PIXELBAY_KEY = process.env.API_PIXELBAY_KEY
const API_GEONAMES_USERNAME = process.env.API_GEONAMES_USERNAME
console.log("WEATHERBIT API KEY", result);

app.get('/', function(req, res) {
    res.sendFile(path.resolve('dist/index.html'))
})

// designates what port the app will listen to for incoming requests
app.listen(8080, function() {
    console.log('Server listening on port 8080!')
})

app.get('/forcast', async(req, res) => {
    console.log(process.env)
    debugger
    console.log(`looking for: ${req.query.place} with date: ${req.query.date}`);
    const place = encodeURIComponent(req.query.place);
    const date = req.query.date;

    try {
        if (!place || !date) throw Error('Date or place invalid');
        var dataToSave = await GetComputedData(place, date);
        res.send(dataToSave);
    } catch (error) {
        console.error(error)
        res.status(500).send();

    }

})

async function GetComputedData(place, date) {
    const headers = {
        headers: {
            Accept: "application/json"
        }
    }
    let geoURL = `http://api.geonames.org/searchJSON?q=${place}&maxRows=1&username=${API_GEONAMES_USERNAME}`
    var geoRes = await axios.get(geoURL, headers)
        //get first record from array
        //TODO: check if present
    var locationGeo = geoRes.data.geonames[0]

    let weather = {}
    if (getWeatherData(date) == true) {
        //TODO: get weather in date
        const weatherBitKey = process.env.API_WEATHERBIT_KEY
        const wthrUrl = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${locationGeo.lat}&lon=${locationGeo.lng}&key=${weatherBitKey}`
        var wthrRes = await axios.get(wthrUrl, headers)
        const weatherData = wthrRes.data.data[0]
        const onDate = wthrRes.data.data.find(x => x.datetime == date)
        if (onDate) {
            weather.temperature = onDate.temp
            weather.min_temp = onDate.min_temp
            weather.max_temp = onDate.max_temp
            weather.icon = onDate.weather.icon
            weather.description = onDate.weather.description
        }
    }
    //image url
    const imgUrl = `https://pixabay.com/api/?key=${API_PIXELBAY_KEY}&q=${place}&image_type=photo&pretty=true`
    var imgUrlRes = await axios.get(imgUrl, headers)
    let imageUrl = ""
    if (imgUrlRes.data != null && imgUrlRes.data.hits != null && imgUrlRes.data.hits.length > 0)
        imageUrl = imgUrlRes.data.hits[0]
    var dataToSave = {
        date: date,
        location: locationGeo,
        weather: weather,
        image: imageUrl
    }
    return dataToSave
}

function getWeatherData(date) {
    let dt = new Date(date)
    const diffTime = Math.abs(dt - new Date())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays < 16;
}


module.exports = app;