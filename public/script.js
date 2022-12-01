socket = io()
var map = L.map('map').setView([48.857956, 2.344935], 12);
var nicoPath;
var userPos;
var userPath;
var userPlace;
var userTime;
var goDate;
var meetingDate = new Date();
meetingDate.setHours(meetingDate.getHours() + 2);
var title = document.getElementsByTagName("h1")[0];
var subtitle = document.getElementsByTagName("h2")[0];
const list = document.getElementById('list')
const roomId = document.getElementById('roomId')
const username = document.getElementById('name')
let users = []
let colors = ['red', 'green', 'blue', 'yellow', "purple", 'pink', "orange"] 

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
        user = data.users.find(user => user.socketId === socket.id)
        userPos = user.position
        users = data.users
        eiffelPos = data.endPointPosition ? data.endPointPosition : eiffelPos
        meetingDate = data.meetingDate ? data.meetingDate : meetingDate
        userTime = ((map.distance(userPos, eiffelPos) / 1000) / 20) * 60;
        setGoDate(userTime);
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
        console.log(data)
        users = data
        refreshList()
    })

    socket.on('newEndPoint', (data) => {
        userTime = ((map.distance(userPos, eiffelPos) / 1000) / 20) * 60;
        eiffelPos = data
        setGoDate(userTime);
        refreshList()
    })

    socket.on('newMeetingDate', (data) => {
        meetingDate = data
        setMeetingDate(meetingDate)
    })
}

function setMeetingDate(date) {
    let dateFormatted = date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
    title.innerHTML = "RDV le " + dateFormatted + " à " + (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + "h" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());
}

function setGoDate(time) {
    goDate = new Date(meetingDate);
    goDate.setMinutes(goDate.getMinutes() - time);
    let dateFormatted = goDate.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
    subtitle.innerHTML = "Tu dois partir le " + dateFormatted + " à " + (goDate.getHours() < 10 ? "0" + goDate.getHours() : goDate.getHours()) + "h" + (goDate.getMinutes() < 10 ? "0" + goDate.getMinutes() : goDate.getMinutes());
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
        socket.emit('restaurantClicked', bkPos)
    });
    
    sushiMarker.on('click', () => {
        socket.emit('restaurantClicked', sushiPos)
    
    });
    
    indianMarker.on('click', () => {
        socket.emit('restaurantClicked', indianPos)
    });

    eiffelMarker.on('dragend', () => {
        eiffelPos = eiffelMarker.getLatLng();
        eiffelMarker.setLatLng(eiffelPos, {
            draggable: 'true'
        });
        
        socket.emit('moveEndPoint', eiffelPos)
    });
}

document.getElementById('submitDate').addEventListener('click', function() {
    let roomMeetingDate = new Date(document.getElementById('date').value);
    socket.emit('changeRoomMeetingDate', roomMeetingDate)
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
            userTime = (((map.distance(userPos, element.restaurant.position) + map.distance(element.restaurant.position, eiffelPos) )/ 1000) / 20) * 60;
            console.log(userTime)
            setGoDate(userTime);
        }

        // AFFICHER PERSONNES DE LA ROOM
        let li = document.createElement('li')
        li.innerHTML = `${element.name} - ${element.position.lat}/${element.position.lng} - ${element.roomId}`
        li.style.color = colors[i]
        list.appendChild(li)
        
        i++
    })
}
