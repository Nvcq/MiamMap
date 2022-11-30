var map = L.map('map').setView([48.878035, 2.280091], 12);
var nicoPath;
var userPos;
var userPath;
var userPlace;
var goDate;
var meetingDate = new Date();
meetingDate.setHours(meetingDate.getHours() + 2);
var title = document.getElementsByTagName("h1")[0];
var subtitle = document.getElementsByTagName("h2")[0];


function setMeetingDate(date) {
    title.innerHTML = "On mange le " + date;
}

function setGoDate(time) {
    goDate = new Date(meetingDate);
    goDate.setMinutes(goDate.getMinutes() - time);
    subtitle.innerHTML = "Tu dois partir à " + goDate; 
    return goDate;
}

setMeetingDate(meetingDate);

let nico = L.icon({
    iconUrl: 'img/nico.png',
    iconSize:     [70, 95],
    iconAnchor:   [22, 94],
    popupAnchor:  [-3, -76] 
});

let diego = L.icon({
    iconUrl: 'img/diego.png',
    iconSize:     [70, 95], 
    iconAnchor:   [22, 94],
    popupAnchor:  [0, 0]
});

let simon = L.icon({
    iconUrl: 'img/simon.png',
    iconSize:     [70, 95], 
    iconAnchor:   [22, 94],
    popupAnchor:  [-3, -76]
});

let bk = L.icon({
    iconUrl: 'img/bk.png',
    iconSize:     [50, 50], 
    iconAnchor:   [0, 0], 
    popupAnchor:  [0, 0]
});

let sushi = L.icon({
    iconUrl: 'img/sushi.png',
    iconSize:     [100, 85], 
    iconAnchor:   [30, 30], 
    popupAnchor:  [0, 0]
});

let indian = L.icon({
    iconUrl: 'img/indian.png',
    iconSize:     [80, 50], 
    iconAnchor:   [0, 0], 
    popupAnchor:  [0, 0]
});

let eiffelTower = L.icon({
    iconUrl: 'img/eiffeltower.png',
    iconSize:     [250, 140], 
    iconAnchor:   [100, 110], 
    popupAnchor:  [-3, -76]
});


let eiffelPos = [0, 0];
if (eiffelPos[0] == 0 && eiffelPos[1] == 0) {
    eiffelPos = [48.858302, 2.294415];
}

let eiffelMarker = L.marker(eiffelPos, {draggable: 'true', icon: eiffelTower}).addTo(map);
eiffelMarker.bindPopup("<b>Point d'arrivée</b><br>On se rejoint à la tour eiffel !").openPopup();

let nicoMarker = L.marker([48.84135, 2.253039], {icon: nico}).addTo(map);
nicoMarker.bindPopup("<b>Salut!</b><br>C'est Nico.").openPopup();

let diegoMarker = L.marker([48.86273, 2.36412], {icon: diego}).addTo(map);
diegoMarker.bindPopup("<b>Salut!</b><br>C'est Diego.").openPopup();

let simonMarker = L.marker([48.878116, 2.264793], {icon: simon}).addTo(map);
simonMarker.bindPopup("<b>Salut!</b><br>C'est Simon.").openPopup();

let bkMarker = L.marker([48.841713, 2.321677], {icon: bk}).addTo(map);
let sushiMarker = L.marker([48.882835, 2.306271], {icon: sushi}).addTo(map);
let indianMarker = L.marker([48.893883, 2.345753], {icon: indian}).addTo(map);

let nicoPos = nicoMarker.getLatLng();
let diegoPos = diegoMarker.getLatLng();
let simonPos = simonMarker.getLatLng();
let bkPos = bkMarker.getLatLng();
let indianPos = indianMarker.getLatLng();
let sushiPos = sushiMarker.getLatLng();


function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("Coordonnées : " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let popup = L.popup();

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        title.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    userPos = [position.coords.latitude, position.coords.longitude];
    let userMarker = L.marker(userPos, {icon: nico}).addTo(map);
    userPath = L.polyline([userPos, eiffelPos], {color: 'green'}).addTo(map);
    userTime = ((map.distance(userPos, eiffelPos) / 1000) / 20) * 60;
    setGoDate(userTime);
}

getLocation();

document.getElementById('submitDate').addEventListener('click', function() {
    meetingDate = new Date(document.getElementById('date').value);
    setMeetingDate(meetingDate);
    setGoDate(userTime);
});

bkMarker.on('click', function(e) {
    userPlace = bkPos;
    map.removeLayer(userPath);
    userPath = L.polyline([userPos, userPlace, eiffelPos], {color: 'green'}).addTo(map);
    userTime = (((map.distance(userPos, userPlace) + map.distance(userPlace, eiffelPos)) / 1000) / 20) * 60;
    setGoDate(userTime);
});

sushiMarker.on('click', function(e) {
    userPlace = sushiPos;
    map.removeLayer(userPath);
    userPath = L.polyline([userPos, userPlace, eiffelPos], {color: 'green'}).addTo(map);
    userTime = (((map.distance(userPos, userPlace) + map.distance(userPlace, eiffelPos)) / 1000) / 20) * 60;
    setGoDate(userTime);
});

indianMarker.on('click', function(e) {
    userPlace = indianPos;
    map.removeLayer(userPath);
    userPath = L.polyline([userPos, userPlace, eiffelPos], {color: 'green'}).addTo(map);
    userTime = (((map.distance(userPos, userPlace) + map.distance(userPlace, eiffelPos)) / 1000) / 20) * 60;
    setGoDate(userTime);
});

nicoPath = L.polyline([nicoPos, bkPos, eiffelPos], {color: 'red'}).addTo(map);


eiffelMarker.on('dragend', function(event) {
    eiffelPos = eiffelMarker.getLatLng();
    eiffelMarker.setLatLng(eiffelPos, {
        draggable: 'true'
    });
    map.removeLayer(nicoPath);
    map.removeLayer(userPath);
    nicoPath = L.polyline([nicoPos, bkPos, eiffelPos], {color: 'red'}).addTo(map);
    if(!userPlace) {
        userPath = L.polyline([userPos, eiffelPos], {color: 'green'}).addTo(map);
        userTime = ((map.distance(userPos, eiffelPos) / 1000) / 20) * 60;
    } else {
        userPath = L.polyline([userPos, userPlace, eiffelPos], {color: 'green'}).addTo(map);
        userTime = (((map.distance(userPos, userPlace) + map.distance(userPlace, eiffelPos)) / 1000) / 20) * 60;
    }

    setGoDate(userTime);

});
