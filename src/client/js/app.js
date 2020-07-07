function dateChecker(possibleDate) {
    var datePattern = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;

    var res = possibleDate.match(datePattern);
    return (res !== null)
}

const getTripData = async(place, date) => {
    try {
        const resp = await fetch(`http://localhost:8080/forcast?place=${place}&date=${date}`);
        const respData = await resp.json();
        return respData;

    } catch (error) {
        //TODO: propper error handler
        alert('Erorr getting card DATA!\n', error)
    }
}

async function addTrip(event) {
    event.preventDefault();

    const place = document.getElementById('place');
    const date = document.getElementById('date');

    if (Client.dateChecker(date.value) != true) {
        alert('Invalid date for the trip!\nThe date should be in the following format: yyyy-MM-dd');
        return false;
    }

    const tripData = await getTripData(place.value, date.value);
    await saveTripsToCache(tripData);
    displayOneTrip(tripData, getTripData.length);
    place.value = "";
    date.value = "";
}


const displayTrips = async() => {
    //get trips
    var trips = await getTripsFromCache();

    if (!trips) return;

    //if trips then clear ui elements
    const tripsUI = document.getElementById('results');
    tripsUI.innerHTML = "";

    //iterate trips and add trip to ui
    trips.map((trip, index) => {
        displayOneTrip(trip, index, tripsUI);
    })
}

document.addEventListener('DOMContentLoaded', () => displayTrips(), false);


const saveTripsToCache = async(tripData) => {
    var trips = JSON.parse(localStorage.getItem('trips'));
    if (!trips)
        trips = new Array();
    // add trip to trips
    if (trips.length > 0)
        tripData.id = Math.max(...trips.map(x => x.id)) + 1; // trips.length;
    else
        tripData.id = 1;
    console.dir(tripData)
    trips.push(tripData);
    //save trips to localstorage
    localStorage.setItem('trips', JSON.stringify(trips));
}


const getTripsFromCache = async() => {
    var trips = JSON.parse(localStorage.getItem('trips'));
    if (!trips) return null;
    return trips;
}


const delTripFromCache = async(id) => {
    let trips = await getTripsFromCache();
    if (!trips) return null;

    //old don't use trips.splice(index, 1);
    trips = trips.filter(x => x.id != id);
    localStorage.setItem('trips', JSON.stringify(trips));
    await displayNoTrips();
}

async function displayOneTrip(trip, index, tripsUI) {
    //show no trips on screen
    await displayNoTrips()
    let scrollLast = false;
    if (!tripsUI) {
        tripsUI = document.getElementById('results');
        scrollLast = true;
    }

    const txt = `Trip to ${trip.location.name}, ${trip.location.countryCode} on ${trip.date} `;
    let mainDiv = document.createElement('div');
    mainDiv.className = "card";
    //delete icon
    const del = document.createElement('a');
    del.innerText = "X";
    del.href = "#";
    del.className = "close"
    del.addEventListener('click', async(ev) => {
        console.log(`curren truip id: ${trip.id}`)
        if (confirm(`delete trip to: ${trip.location.name}? `)) {
            console.log('deleting index:', trip.id);
            await delTripFromCache(trip.id);
            await displayTrips();
        }
    });
    mainDiv.appendChild(del);

    //weather image
    if (trip.weather.icon) {
        let wDiv = document.createElement('div');
        wDiv.className = "weather"
        let img = document.createElement('img');
        img.src = `icons/${trip.weather.icon}.png`;
        // img.style.height = "80px";
        wDiv.appendChild(img);
        let span = document.createElement('div');
        span.innerHTML = `${trip.weather.temperature}&deg; with ${trip.weather.description}`;
        wDiv.appendChild(span);
        mainDiv.appendChild(wDiv);
    } else {
        let missingDiv = document.createElement('div');
        missingDiv.innerHTML = `No weather available!`;
        missingDiv.className = "missing";
        mainDiv.appendChild(missingDiv);
    }
    let picDiv = document.createElement('div');
    let img = null;
    if (trip.image && trip.image.webformatURL) {
        let imgDiv = document.createElement('div');
        let img = document.createElement('img');
        //console.dir(trip.image)
        img.src = trip.image.webformatURL;
        imgDiv.className = "image";
        imgDiv.appendChild(img);
        mainDiv.appendChild(imgDiv);

        if (scrollLast == true) {
            img.addEventListener('load', () => {
                img.scrollIntoView({ behavior: 'smooth' });
            })
        }
    }

    let p = document.createElement('p');
    p.innerText = txt;
    mainDiv.appendChild(p);
    tripsUI.appendChild(mainDiv);
    if (!img && scrollLast == true)
        tripsUI.lastChild.scrollIntoView({ behavior: 'smooth' });


}

const displayNoTrips = async() => {
    const tripsFromCache = await getTripsFromCache();
    const noTripsSection = document.getElementById('noTrips')
    console.log('no trips', noTripsSection);
    noTripsSection.style.display = !tripsFromCache || tripsFromCache.length == 0 ? "block" : "none";
}



export { addTrip, dateChecker }