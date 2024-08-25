const Message = require('../../model/message');




class messageController {
    newMessage(data) {
        return new Promise((Success, failed) => {
            const message = new Message({
                sender: data.sender,
                receiver: data.receiver,
                message: data.message,
                time: data.time,
                isRead : data.isRead
            })
            message.save().then((message) => {
                console.log(message)
                Success('success')
            }).catch((error) => {
                failed(error)
            })
        })
    }

    convoList(data) {
        return new Promise((success, failed) => {
            let condition = {
                $or: [
                    { sender: data.sender, receiver: data.receiver },
                    { sender: data.receiver, receiver: data.sender }
                ]
            }
            let { page, count } = data
            let skip = (page - 1) * count

            console.log('condition', condition, page)
            Message.find(condition)
                .sort({ _id: -1 })
                .skip(skip)
                .limit(count)
                .then((convo) => {
                    Message.countDocuments(condition).then((res) => {
                        let mesaages = JSON.parse(JSON.stringify(convo))
                        mesaages.map((element1) => {
                            element1.printTime = new Date(element1.time).toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: 'numeric' })
                        });
                        console.log(mesaages)
                        success({ data: mesaages, count: res })
                    })
                }).catch((error) => {
                    failed(error)
                })
        })

    }

}

module.exports = messageController;