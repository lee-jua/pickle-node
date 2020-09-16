
const io = require('socket.io').listen(3100 ,()=>{
    console.log(`server is running on port 3100`)
})
let values = []
io.on('connection', socket=> {
    console.log(`socket is connected with client id ${socket.id}`)

    socket.on('joinRoom', data=> {
        console.log("client connect")
        const clientsInRoom = io.sockets.adapter.rooms[data.roomName];
        const numClient = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
        console.log(`client num + ${numClient}`)
        if (numClient === 0) {
            socket.join(data.roomName)
            console.log(`first client join roomName ${data.roomName} socketid ${socket.id}`)
            values.push({id : socket.id, roomName : data.roomName, code : data.code})
        } else {
            socket.join(data.roomName)
            console.log(`second client join roomName ${data.roomName} socketid ${socket.id}`)
            values.push({id : socket.id, roomName : data.roomName, code : data.code})
            values.forEach(value => {
                console.log(`roomName : ${value.roomName} , value.code ${value.code}`)
                if ( value.roomName===data.roomName && value.code.substring(4,6)==='00'){
                    socket.to(value.id).emit('letOffer',{studentCode : data.code})
                }
            })
        }
    })
    socket.on('message',message=>{
        if (message.type==='offer'){
            console.log(`client send message type offer target ${message.target}`)
            values.forEach(value=>{
                if (value.code===message.target)
                    socket.to(value.id).emit('recOffer',{teacherCode : message.name, studentCode : message.target, type :message.type, sdp : message.sdp})
            })
        }else if (message.type ==='answer'){
            values.forEach(value=>{
                if (value.code===message.target)
                    console.log(`client send message type answer target ${message.target}` )
                socket.to(value.id).emit('recAnswer',{teacherCode : message.name, studentCode : message.target, type :message.type, sdp : message.sdp})
            })
        }else if (message.type ==='candidate'){
            console.log(`client send message type candidate target ${message.target}`)
            values.forEach(value=>{
                if (value.code===message.target)
                    console.log(`client send message type answer target ${message.target}` )
                socket.to(value.id).emit('recCandidate',message)
            })
        }

    })
})