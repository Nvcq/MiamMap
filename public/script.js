socket = io()
var map = L.map('map').setView([48.857956, 2.344935], 12);
var nicoPath;
var userPos;
var userPath;
var userPlace;
var goDate;
var meetingDate = new Date();
meetingDate.setHours(meetingDate.getHours() + 2);
var title = document.getElementsByTagName("h1")[0];
var subtitle = document.getElementsByTagName("h2")[0];
const list = document.getElementById('list')
const roomId = document.getElementById('roomId')
const username = document.getElementById('name')
let users = []
let colors = ['red', 'green', 'blue', 'yellow', "purple", 'pink'] 

function init() {

    socket.emit('joinRoom', {
        position: {
            lat: Math.random() * (48.899483 - 48.818644 ) + 48.818644, 
            lng: Math.random() * (2.406712 - 2.270147) + 2.270147,
        },
        roomId: roomId.value,
        name: username.value,
        isRestaurant: false,
        restaurant: {
            position: {
                lng: 0,
                lat: 0
            }
        }
    })

    socket.on('init', data => {
        users = data.users
        eiffelPos = data.endPointPosition ? data.endPointPosition : eiffelPos
        refreshList()
    })

    socket.on('userJoin', data => {
        users.push(data)
        refreshList()
    })

    socket.on('userLeave', data => {
        users = users.filter(user => {
            return user.socketId !== data
        })
        
        refreshList()
    })

    socket.on('newUserRestaurant', (data) => {
        users = data
        refreshList()
    })

    socket.on('newEndPoint', (data) => {
        console.log(data)
        eiffelPos = data
        refreshList()
    })
}

function setMeetingDate(date) {
    const dateFormatted = date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
    title.innerHTML = "RDV le " + dateFormatted + " à " + (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + "h" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());
}

function setGoDate(time) {
    goDate = new Date(meetingDate);
    goDate.setMinutes(goDate.getMinutes() - time);
    subtitle.innerHTML = "Tu dois partir à " + goDate; 
    return goDate;
}

setMeetingDate(meetingDate);

let icon = L.icon({
    iconUrl: 'nico.png',
    iconSize:     [70, 95],
    iconAnchor:   [22, 94],
});

let bk = L.icon({
    iconUrl: 'bk.png',
    iconSize:     [50, 50], 
    iconAnchor:   [0, 0], 
});

let sushi = L.icon({
    iconUrl: 'sushi.png',
    iconSize:     [100, 85], 
    iconAnchor:   [30, 30], 
});

let indian = L.icon({
    iconUrl: 'indian.png',
    iconSize:     [80, 50], 
    iconAnchor:   [0, 0], 
});

let eiffelTower = L.icon({
    iconUrl: 'eiffeltower.png',
    iconSize:     [250, 140], 
    iconAnchor:   [100, 110], 
});


let eiffelPos = [0, 0];
if (eiffelPos[0] == 0 && eiffelPos[1] == 0) {
    eiffelPos = [48.858302, 2.294415];
}

let eiffelMarker = L.marker(eiffelPos, {draggable: 'true', icon: eiffelTower}).addTo(map);
let bkMarker = L.marker([48.841713, 2.321677], {icon: bk}).addTo(map);
let sushiMarker = L.marker([48.882835, 2.306271], {icon: sushi}).addTo(map);
let indianMarker = L.marker([48.893883, 2.345753], {icon: indian}).addTo(map);
let bkPos = bkMarker.getLatLng();
let indianPos = indianMarker.getLatLng();
let sushiPos = sushiMarker.getLatLng();

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// let nicoPos = nicoMarker.getLatLng();
// let diegoPos = diegoMarker.getLatLng();
// let simonPos = simonMarker.getLatLng();

// function onMapClick(e) {
//     popup
//         .setLatLng(e.latlng)
//         .setContent("Coordonnées : " + e.latlng.toString())
//         .openOn(map);
// }

// map.on('click', onMapClick);

function generateMap() {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    bkMarker = L.marker([48.841713, 2.321677], {icon: bk}).addTo(map);
    sushiMarker = L.marker([48.882835, 2.306271], {icon: sushi}).addTo(map);
    indianMarker = L.marker([48.893883, 2.345753], {icon: indian}).addTo(map);
    eiffelMarker = L.marker(eiffelPos, {draggable: 'true', icon: eiffelTower}).addTo(map);

    bkMarker.on('click', () => {
        // userPlace = bkPos;
        // map.removeLayer(userPath);
        // userPath = L.polyline([userPos, userPlace, eiffelPos], {color: 'green'}).addTo(map);
        // userTime = (((map.distance(userPos, userPlace) + map.distance(userPlace, eiffelPos)) / 1000) / 20) * 60;
        // setGoDate(userTime);
        socket.emit('restaurantClicked', bkPos)
    });
    
    sushiMarker.on('click', () => {
        // userPlace = sushiPos;
        // map.removeLayer(userPath);
        // userPath = L.polyline([userPos, userPlace, eiffelPos], {color: 'green'}).addTo(map);
        // userTime = (((map.distance(userPos, userPlace) + map.distance(userPlace, eiffelPos)) / 1000) / 20) * 60;
        // setGoDate(userTime);
        socket.emit('restaurantClicked', sushiPos)
    
    });
    
    indianMarker.on('click', () => {
        // userPlace = indianPos;
        // map.removeLayer(userPath);
        // userPath = L.polyline([userPos, userPlace, eiffelPos], {color: 'green'}).addTo(map);
        // userTime = (((map.distance(userPos, userPlace) + map.distance(userPlace, eiffelPos)) / 1000) / 20) * 60;
        // setGoDate(userTime);
        socket.emit('restaurantClicked', indianPos)
    });

    eiffelMarker.on('dragend', () => {
        eiffelPos = eiffelMarker.getLatLng();
        eiffelMarker.setLatLng(eiffelPos, {
            draggable: 'true'
        });
    
        console.log('gola')
    
        socket.emit('moveEndPoint', eiffelPos)
        // setGoDate(userTime);
    });
}



// let popup = L.popup();

// function getLocation() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(showPosition);
//     } else {
//         title.innerHTML = "Geolocation is not supported by this browser.";
//     }
// }

// function showPosition(position) {
//     userPos = [position.coords.latitude, position.coords.longitude];
//     let userMarker = L.marker(userPos, {icon}).addTo(map);
//     userPath = L.polyline([userPos, eiffelPos], {color: 'green'}).addTo(map);
//     userTime = ((map.distance(userPos, eiffelPos) / 1000) / 20) * 60;
//     setGoDate(userTime);
// }

// getLocation();

document.getElementById('submitDate').addEventListener('click', function() {
    meetingDate = new Date(document.getElementById('date').value);
    setMeetingDate(meetingDate);
    // setGoDate(userTime);
});

bkMarker.on('click', () => {
    socket.emit('restaurantClicked', bkPos)
});

sushiMarker.on('click', () => {
    socket.emit('restaurantClicked', sushiPos)

});

indianMarker.on('click', () => {
    socket.emit('restaurantClicked', indianPos)

});

function refreshList() {
    list.innerHTML = ""
    map.eachLayer(layer => {
        map.removeLayer(layer);
    });
    generateMap()

    let i = 0

    users.forEach(element => {

        // REPLACER LES PERSONNAGES SUR LA MAPS
        L.marker([element.position.lat, element.position.lng], {icon: icon}).addTo(map);

        // REPLACER LEURS LIGNES
        if(element.isRestaurant) {
            L.polyline([{lat: element.position.lat, lng: element.position.lng}, element.restaurant.position, eiffelPos], {color: colors[i]}).addTo(map);
        }

        // AFFICHER PERSONNES DE LA ROOM
        let li = document.createElement('li')
        li.innerHTML = `${element.name} - ${element.position.lat}/${element.position.lng} - ${element.roomId}`
        li.style.color = colors[i]
        list.appendChild(li)
        
        i++
    })
}
