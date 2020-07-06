// Setup empty JS object to act as endpoint for all routes
projectData = {};

// Require Express to run server and routes
const express = require("express");

// Start up an instance of app
const app = express();

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
const cors = require("cors");
app.use(cors());

// Initialize the main project folder
app.use(express.static("website"));

// Spin up the server
const port = 3000;
const server = app.listen(port, listening);
function listening() {
    console.log(`running on localhost: ${port}`);
}

// Callback function to complete GET '/all'
app.get("/all", getData);
function getData(req, res) {
    res.send(projectData);
}

// Post Route
app.post("/add", sendData);
function sendData(req, res) {
    if (projectData) {
        projectData.date = req.body.date;
        projectData.temperature = req.body.temp;
        projectData.feelings = req.body.content;
        res.send(projectData);
    }
}
