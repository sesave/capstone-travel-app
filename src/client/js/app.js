const getTravelData = async (place, date) => {
    try {
        const resp = await fetch(`/weather?place=${place}&date=${date}`);
        const respData = await resp.json();
        return respData;
    } catch (error) {
        alert("Error getting form data ", error);
    }
};

async function setTravel(event) {
    event.preventDefault();
    const place = document.getElementById("place");
    const date = document.getElementById("date");
    const travelData = await getTravelData(place.value, date.value);
    await saveTravels(travelData);
    displayTravel(travelData, getTravelData.length);
    place.value = "";
    date.value = "";
}

const displayTrips = async () => {
    //get travels
    var travels = await getLocalTravels();

    if (!travels) return;

    //if travels then clear ui elements
    const travelUI = document.getElementById("results");
    travelUI.innerHTML = "";

    //iterate travels and add travel to ui
    travels.map((travel, index) => {
        displayTravel(travel, index, travelUI);
    });
};

document.addEventListener("DOMContentLoaded", () => displayTrips(), false);

const saveTravels = async (travelData) => {
    var travels = JSON.parse(localStorage.getItem("travels"));
    if (!travels) {
        travels = new Array();
    }
    if (travels.length > 0) {
        travelData.id = Math.max(...travels.map((x) => x.id)) + 1;
    } else {
        travelData.id = 1;
    }
    console.dir(travelData);
    travels.push(travelData);
    //save travels to localstorage
    localStorage.setItem("travels", JSON.stringify(travels));
};

const getLocalTravels = async () => {
    var travels = JSON.parse(localStorage.getItem("travels"));
    if (!travels) return null;
    return travels;
};

const deleteLocalTravels = async (id) => {
    let travels = await getLocalTravels();
    if (!travels) return null;

    //old don't use travels.splice(index, 1);
    travels = travels.filter((x) => x.id != id);
    localStorage.setItem("travels", JSON.stringify(travels));
    await noneTravels();
};

async function displayTravel(travel, index, travelUI) {
    //show no travels on screen
    await noneTravels();
    let scrollSmooth = false;
    if (!travelUI) {
        travelUI = document.getElementById("results");
        scrollSmooth = true;
    }

    const txt = `Travel to the beautiful city of ${travel.location.name}, ${travel.location.countryCode} on ${travel.date} `;
    let mainDiv = document.createElement("div");
    mainDiv.className = "card";
    const del = document.createElement("a");
    del.innerText = "X";
    del.href = "#";
    del.className = "closeBtn";
    del.addEventListener("click", async (ev) => {
        if (
            confirm(
                `You want to delete your entry to: ${travel.location.name}, ${travel.location.countryCode} on ${travel.date} ? `
            )
        ) {
            await deleteLocalTravels(travel.id);
            await displayTrips();
        }
    });
    mainDiv.appendChild(del);

    //weather image
    if (travel.weather.icon) {
        let wDiv = document.createElement("div");
        wDiv.className = "weather";
        let span = document.createElement("div");
        span.innerHTML = `Weather: ${travel.weather.temperature}&deg; with ${travel.weather.description}`;
        wDiv.appendChild(span);
        mainDiv.appendChild(wDiv);
    } else {
        let missingWeather = document.createElement("div");
        missingWeather.innerHTML = `Sorry our api is kinda dumb! No weather available!`;
        missingWeather.className = "weather";
        mainDiv.appendChild(missingWeather);
    }
    let img = null;
    if (travel.image && travel.image.webformatURL) {
        let imgDiv = document.createElement("div");
        let img = document.createElement("img");
        img.src = travel.image.webformatURL;
        imgDiv.className = "image";
        imgDiv.appendChild(img);
        mainDiv.appendChild(imgDiv);

        if (scrollSmooth == true) {
            img.addEventListener("load", () => {
                img.scrollIntoView({ behavior: "smooth" });
            });
        }
    } else {
        let imgDiv = document.createElement("div");
        let img = document.createElement("img");
        img.src =
            "https://thumbs.dreamstime.com/b/no-image-available-icon-photo-camera-flat-vector-illustration-132483141.jpg";
        img.className =
            "noPhoto";
        imgDiv.className = "image";
        imgDiv.appendChild(img);
        mainDiv.appendChild(imgDiv);

        if (scrollSmooth == true) {
            img.addEventListener("load", () => {
                img.scrollIntoView({ behavior: "smooth" });
            });
        }
    }

    let p = document.createElement("p");
    p.className = "innerParagraph";
    p.innerText = txt;
    mainDiv.appendChild(p);
    travelUI.appendChild(mainDiv);
    if (!img && scrollSmooth == true)
        travelUI.lastChild.scrollIntoView({ behavior: "smooth" });
}

const noneTravels = async () => {
    const tripsFromCache = await getLocalTravels();
    const woTravelsSection = document.getElementById("woTravels");
    woTravelsSection.style.display =
        !tripsFromCache || tripsFromCache.length == 0 ? "block" : "none";
};

export { setTravel };
