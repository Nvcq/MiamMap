var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var path = require('path')
var port = 8080

let users = []
let endPointPosition = []
let meetingDate = []

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'node_modules')))
app.use(express.static(path.join(__dirname, 'img')))

io.on('connection', socket => {
    socket.on('joinRoom', data => {
        // CONSOLE LOG NOUVELLE CONNEXION
        console.log(data.name + " join (" + socket.id + ")")

        // ENVOIS A LA ROOM L'INFO DU NOUVEL USER
        io.to(`${data.roomId}`).emit('userJoin', {...data, socketId: socket.id})

        // NOUVEL USER REJOINT LA ROOM
        socket.join(`${data.roomId}`)

        // NOUVEL USER AJOUTE AU GROUPE
        users.push({...data, socketId: socket.id})

        // ENVOYER LES INFO DE LA ROOM AU USER
        socket.emit('init', {
            users: users.filter(user => user.roomId === data.roomId), 
            endPointPosition: endPointPosition[data.roomId], 
            meetingDate: endPointPosition[data.roomId]})
    })

    socket.on('disconnect', () => {
        // FIND THE USER WHO DISCONNECT
        disconnectedUser = users.find(user => user.socketId === socket.id)

        // SI IL N'EXISTE PAS RETURN
        if(!disconnectedUser) return

        // CONSOLE LOG DECO
        console.log(disconnectedUser.name + " leave (" + disconnectedUser.socketId + ")")

        // REMOVE USER DU GROUPE
        users = users.filter(user => user.socketId !== socket.id)

        // PREVENIR LES GENS DE LA ROOM
        io.to(disconnectedUser.roomId).emit('userLeave', socket.id)
    })

    socket.on('restaurantClicked', (data) => {
        // MODIFIE LE USER AVEC SON RESTAURANT
        users = users.map(user => {
            if(user.socketId === socket.id) {
                return { 
                    ...user, 
                    isRestaurant: true, 
                    restaurant: { 
                        position: { 
                            lat: data.lat, 
                            lng: data.lng 
                        } 
                    }
                }
            } else {
                return user
            }
        })
        
        // TROUVER LE USER QUI A CLICKER
        socketUser = users.find(user => user.socketId === socket.id)

        // SI ON LE TROUVE PAS RETURN
        if(!socketUser) return

        // ENVOYER L'INFO A SA ROOM
        io.to(socketUser.roomId).emit('newUserRestaurant', users.filter(user => user.roomId === socketUser.roomId))
    })

    socket.on('moveEndPoint', (data) => {
        // TROUVER LE USER QUI A BOUGER LE POINT
        user = users.find(user => user.socketId === socket.id)
        
        if(!user) return
        
        endPointPosition[user.roomId] = data
        
        io.to(user.roomId).emit('newEndPoint', data)
        
    })

    socket.on('changeRoomMeetingDate', (data) => {
        console.log(data)

        user = users.find(user => user.socketId === socket.id)

        if(!user) return

        meetingDate[user.roomId] = data

        io.to(user.roomId).emit('newMeetingDate', data)

    })
})

http.listen(port, () => {
    console.log("server running on "+ port)
})