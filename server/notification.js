const io = require('../server/v1/socket')


exports.noti = async(io) => {
    exports.emit = async (data) => {
        console.log('otii==>', data)
        // console.log('io==>>',io)
        await io.to(data.receiver).emit('getNotify', data)
    }
}