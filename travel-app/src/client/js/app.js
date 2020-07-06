/* Global Variables */
const zipCodeInput = document.getElementById("zip");
const feelingsInput = document.getElementById("feelings");
const dateDiv = document.getElementById("date");
const tempDiv = document.getElementById("temp");
const contentDiv = document.getElementById("content");
let d = new Date();

// Create a new date instance dynamically with JS
let newDate = d.getMonth() + "." + d.getDate() + "." + d.getFullYear();

// Personal API Key for OpenWeatherMap API
const apiURL = "http://api.openweathermap.org/data/2.5/weather?zip=";
const appKey = ""; //my api, private use

// Event listener to add function to existing HTML DOM element
document.getElementById("generate").addEventListener("click", clickerEvent);

/* Function called by event listener */
function clickerEvent(e) {
    e.preventDefault();
    const zipCode = zipCodeInput.value;
    let content = feelingsInput.value;
    if (content.length == 0) {
        content = "Empty";
    }

    getWeatherData(apiURL, zipCode, appKey)
        .then(function (userData) {
            postData("/add", {
                date: newDate,
                temp: userData.main.temp,
                content: content,
            });
        })
        .then(function (dataJSON) {
            domUpdate();
        });
}

/* Function to GET Web API Data*/
const getWeatherData = async (apiURL, zipCode, appKey) => {
    const queryResponse = await fetch(`${apiURL}${zipCode}&appid=${appKey}`);
    try {
        const userData = await queryResponse.json();
        return userData;
    } catch (err) {
        console.log("error", err);
    }
};

/* Function to POST data */
const postData = async (apiURL = "", data = {}) => {
    const dataRequest = await fetch(apiURL, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
            date: data.date,
            temp: data.temp,
            content: data.content,
        }),
    });

    try {
        const dataJSON = await dataRequest.json();
        return dataJSON;
    } catch (err) {
        console.log("error", err);
    }
};

/* DOM Update*/

// temperatura calc 
// https://gist.github.com/lordvaida/beb0487f86972b6ed9d056b80455a263

const domUpdate = async () => {
    const request = await fetch("/all");
    try {
        const allData = await request.json();
        const celsius = allData.temperature - 273;
        let fahrenheit = Math.floor(celsius * (9 / 5) + 32);
        dateDiv.innerHTML = allData.date;
        tempDiv.innerHTML = `${fahrenheit} degrees fahrenheit`;
        contentDiv.innerHTML = allData.feelings;
    } catch (err) {
        console.log("error", err);
    }
};
