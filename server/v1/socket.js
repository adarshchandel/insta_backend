const user = require('../model/user');
const messageClass = require('./controllers/messageController');
const message = new messageClass();
// const userController = require('./controllers/userController');
// const userRepo = new userController();

let users = []


function addUser(user , socketId ){
   let exist =  users.find( (element)=>element.id == user.id)
   if(!exist){
       user['socketId'] = socketId
       users.push(user)
   }else{
       console.log(`${user.name} we have already met`)
   }
}

function getUser(userId) {
         return users.find((user) => user.id == userId);
}


exports.socket =(io)=>{
    exports.socketFunction = io.on('connection', (socket)=>{
        require('../notification').noti(io)
        //connect user
        socket.on('login',(data)=>{
            // userRepo.getUsersList().then((res)=>{
            //     console.log('res==>>',res)
            // })
            addUser(data , socket.id)
            socket.join(data.id)
            console.log(`${data.name} has join us !!`)
            console.log('userr===',users)
        })
        
        //send message
        socket.on('message',(msgData)=>{
            message.newMessage(msgData)
            socket.in(msgData.receiver).emit('send-message',msgData)
            socket.in(msgData.receiver).emit('getNotify',{mesage:'You have a new mesaage'})
        })
        
        //video call WEBRtc
        socket.on('videoCall', (call)=>{
            socket.in(call.receiver).emit('incomingCall',call)
        } )

        //show typing
        socket.on('typing',(typingData)=>{
            socket.in(typingData.toUser).emit('showTyping',typingData)
        })

        socket.on('userGone',(data)=>{

         users = users.filter((item) => item.id !== data.id);
  
        })

    })
    // return io

    
}
exports.socketUsers = users

// exports.newNotification = (data)=>{
//     console.log('data=>>',data)
//     socketGlobal.in(data.to).emit('getNotify',data)
// }

// let users = []
// console.log('checked=>>')
// function addUser(id, socketId) {
    
//     if(users.find((user) => user.id == id)){
//         console.log('returned id',id)
//         return 
//     }else{
//     users.push({ id, socketId });
//     console.log('users',users)
//     }
    
// }
// const getUser = (userId) => {
//     return users.find((user) => user.id == userId);
// };


// io.on('connection', (socket) => {
//     console.log('a user connected',socket);
//     socket.on("addUser", (userId) => {
//         addUser(userId, socket.id);
//         io.emit("getUsers", users);
//     });
    
//     socket.on('message', (msg) => {
//         console.log('msg', msg)
//         const userMatch = getUser(msg.receiver)
//         console.log("userMatch", userMatch)
//         socket.broadcast.to(userMatch.socketId).emit('message-broadcast',
//          {message: msg.message}
//         );
//     });
// });


