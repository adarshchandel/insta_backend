const  mongoose = require('mongoose');
const Notification = require('../../model/notification');
const moment = require('moment')



class notificationController {

    notifictionList(data) {
        return new Promise((success, failed) => {
            const { isActive , userId} = data
            let condition = { receiverId : mongoose.Types.ObjectId(userId) , isActive : isActive}

            Notification.aggregate([
                { $match : condition},
                {
                    $lookup : {
                        from : "users",
                        localField : "senderId",
                        foreignField : "_id",
                        as : 'senderData'
                    }
                },
                { $unwind: { path: "$senderData", preserveNullAndEmptyArrays: true } },
                {
                    $project :{
                        message : 1,
                        sender : {
                          email :  "$senderData.email",
                          userName :  "$senderData.userName",
                          profilePic : "$senderData.profilePic",
                          _id : "$senderData._id"
                        },
                        date : "$date"
                    }
                },{ $sort : { _id : -1 } }

            ]).then((noti)=>{


                noti.map((res)=>{
                   res['date'] = moment(res['date']).fromNow()
                    
                })

                success(noti)
            }).catch((error)=>{
                failed('some error occured', error)
            })
        })

    }

}

module.exports = notificationController;