const io = require('../server/v1/socket').socketFunction


exports.emit = async(data) =>{
    console.log(data)
    // console.log('io==>>',io)
   await io.to(data.receiver).emit('getNotify',data['message'])
}