const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
dotenv.config();

app.use(express.static("dist"));
var path = require("path");
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const API_GEONAMES_USERNAME = process.env.API_GEONAMES_USERNAME || "sebaskun98";
const API_WEATHERBIT_KEY =
    process.env.API_WEATHERBIT_KEY || "25922d144c5d4cf684f623a4f19d15fb";
const API_PIXELBAY_KEY =
    process.env.API_PIXELBAY_KEY || "17351955-e9448585f2f6dd809a9515990";

app.get("/", function (req, res) {
    res.sendFile(path.resolve("dist/index.html"));
});

// designates what port the app will listen to for incoming requests
app.listen(8080, function () {
    console.log("Server listening on port 8080!");
});

app.get("/weather", async (req, res) => {
    const place = encodeURIComponent(req.query.place);
    const date = req.query.date;

    try {
        if (!place || !date) throw Error("Date or place invalid");
        var saveData = await getData(place, date);
        res.send(saveData);
    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
});

async function getData(place, date) {
    const headers = {
        headers: {
            Accept: "application/json",
        },
    };

    //geonames
    const locationGeo = await getGeonames(place, headers);
    //weatherbit
    const weather = await getWeatherBit(locationGeo, date, headers);
    //pixabay
    const imageUrl = await getPixaBay(place, headers);

    var saveData = {
        date: date,
        location: locationGeo,
        weather: weather,
        image: imageUrl,
    };
    return saveData;
}

async function getGeonames(place, headers) {
    let geoURL = `http://api.geonames.org/searchJSON?q=${place}&maxRows=1&username=${API_GEONAMES_USERNAME}`;
    var geoRes = await axios.get(geoURL, headers);
    var locationGeo = geoRes.data.geonames[0];
    return locationGeo;
}

async function getWeatherBit(locationGeo, date, headers) {
    let weather = {};
    if (getWeatherData(date) == true) {
        const weatherBitURL = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${locationGeo.lat}&lon=${locationGeo.lng}&key=${API_WEATHERBIT_KEY}`;
        var weatherResponse = await axios.get(weatherBitURL, headers);
        const onDate = weatherResponse.data.data.find(
            (x) => x.datetime == date
        );
        if (onDate) {
            weather.temperature = onDate.temp;
            weather.min_temp = onDate.min_temp;
            weather.max_temp = onDate.max_temp;
            weather.icon = onDate.weather.icon;
            weather.description = onDate.weather.description;
        }
    }
    return weather;
}

async function getPixaBay(place, headers) {
    const imgUrl = `https://pixabay.com/api/?key=${API_PIXELBAY_KEY}&q=${place}&image_type=photo&pretty=true`;
    var imgUrlRes = await axios.get(imgUrl, headers);
    let imageUrl = "";
    if (
        imgUrlRes.data != null &&
        imgUrlRes.data.hits != null &&
        imgUrlRes.data.hits.length > 0
    ) {
        imageUrl = imgUrlRes.data.hits[0];
    }

    return imageUrl;
}

function getWeatherData(date) {
    let dt = new Date(date);
    const diffTime = Math.abs(dt - new Date());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 16;
}

module.exports = app;
