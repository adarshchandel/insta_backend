const User = require('../../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../keys');
const mailService = require('../../mail');
const socketUsers = require('../socket').socketUsers
const mongoose = require('mongoose');
const Follower = require('../../model/follower');
const notification = require('../../notification')
const NotificationModel = require('../../model/notification')

class userController {
    userSignup(data, file) {
        return new Promise((success, failed) => {
            const { name, email, password, number } = data
            if (!name || !email || !password || !file) {
                failed('please enter all details')
            } else {
                User.findOne({ email: email }).then(user => {
                    if (user) {
                        failed('user already exist with this email')
                    } else {
                        bcrypt.hash(password, 12).then(hashedPasswod => {
                            let user = new User({
                                userName: name,
                                email: email,
                                number: number,
                                password: hashedPasswod,
                                profilePic: file.filename
                            })
                            user.save().then(user => {
                                // smsService(user)
                                // mailService(user)
                                success(user)
                            }).catch(err => {

                                failed(err)
                            })
                        })

                    }
                })
            }
        })
    }
    userLogin(data) {
        return new Promise((success, failed) => {
            console.log("==",data )
            const { email, password } = data
            if (!email || !password) {
                failed('please enter email and password')
            } else {
                User.findOne({ email: email }).then(user => {
                    if (!user) {
                        failed('Sorry cannot find your account')
                    } else {
                        bcrypt.compare(password, user.password).then(doMatch => {
                            if (doMatch == true) {
                                const token = jwt.sign({ _id: user._id }, JWT_SECRET)
                                user.password = undefined
                                success([{ token: token, _id: user._id, userData: user }])
                            } else {
                                failed('either email or password is wrong')
                            }
                        })
                    }
                })
            }
        })
    }
    updateUserProfile(data, file) {
        return new Promise((success, failed) => {
            const update = {}
            update.userName = data.userName,
                update.email = data.email
            if (!file) {
                update.profilePic = data.profilePic
            } else {
                update.profilePic = file.filename
            }


            User.findByIdAndUpdate({ _id: data.id }, update, { new: true }).then(user => {
                user.password = undefined
                success(user)
            }).catch(err => {
                failed(err)
            })


        })
    }
    getUserById(data) {
        console.log(data)
        return new Promise((success, failed) => {
            User.findById({ _id: data.id }).then(user => {
                user.password = undefined
                // followers: { $cond: { if: { $isArray: "$colors" }, then: { $size: "$colors" }, else: "NA"} }
                success(user)
            }).catch(err => {
                failed(err)
            })
        })
    }
    profileWithPosts(data) {
        return new Promise(async (success, failed) => {
            let condition = { _id: mongoose.Types.ObjectId(data.profileUser) }
            let isMyProfile
            if (data.profileUser == data.userId) isMyProfile = "true"
            else isMyProfile = "false"

            let userData = await User.aggregate([
                { $match: condition },
                {
                    $lookup: {
                        from: "posts",
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        { $expr: { $eq: ["$postedBy", "$$userId"] } }
                                    ]
                                }
                            }
                        ],
                        as: "postData"
                    }

                },
                {
                    $lookup: {
                        from: "followers",
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        { $expr: { $eq: ["$userId", "$$userId"] } },
                                        { isFollow: true }
                                    ]
                                }
                            }
                        ],
                        as: "followers"
                    }

                },
                {
                    $lookup: {
                        from: "followers",
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        { $expr: { $eq: ["$follower", "$$userId"] } },
                                        { isFollow: true }
                                    ]
                                }
                            }
                        ],
                        as: "following"
                    }

                },
                {
                    $lookup: {
                        from: "followers",
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        { $expr: { $eq: ["$userId", "$$userId"] } },
                                        { follower: mongoose.Types.ObjectId(data.userId) },
                                        { isFollow: true }
                                    ]
                                }
                            }
                        ],
                        as: "userFollow"
                    }
                },
                {
                    $project: {
                        email: 1,
                        id: 1,
                        profilePic: 1,
                        userName: 1,
                        postData: "$postData",
                        posts: { $size: "$postData" },
                        following: { $size: "$following" },
                        follower: { $size: "$followers" },
                        isMyProfile: isMyProfile,
                        userFollow: "$userFollow",
                        isFollow: {
                            $cond: {
                                if: { $or: [{ $eq: [{ $size: "$userFollow" }, 1] }] },
                                then: true,
                                else: false,
                            },
                        },
                    }
                }
            ])
            if(userData.length) return success(userData[0])
            else failed('error occured')

        })
    }
    getUsersList(data) {
        return new Promise((success, failed) => {
            let condition = {}
            condition.$or = [{ follower: mongoose.Types.ObjectId(data.id) }]
            console.log('socketUsers==>', socketUsers)

            Follower.aggregate([
                { $match: condition },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "friends"
                    }

                },
                { $unwind: { path: "$friends", preserveNullAndEmptyArrays: true } },

                // {
                //     $lookup: {
                //         from: "messages",
                //         let: { receiver: "$userId", sender: "$follower" },
                //         pipeline: [{
                //             $match: {
                //                 $expr: {
                //                     $and: [
                //                         { $eq: ["$receiver", "$$receiver"] },
                //                         { $eq: ["$sender", "$$sender"] }
                //                     ]
                //                 }
                //             }
                //         }
                //         ],
                //         as: "unreadMsg"
                //     }
                // },
                // { $unwind: { path: "$unreadMsg", preserveNullAndEmptyArrays: true } }
                

                // {
                //     $group: { _id: "$unreadMsg._id", message: { $push: "$unreadMsg.message" } }
                // },


                {
                    $project: {
                        _id: 0,
                        userName: "$friends.userName",
                        profilePic: "$friends.profilePic",
                        email: "$friends.email",
                        _id: "$friends._id",
                        // unreadMsg:{ $first: "unreadMsg" }
                        // unreadMsg: "$unreadMsg"
                    }
                }, { $sort: { _id: -1 } }

            ]).then((data) => {
                return success(data)
            }).catch((error) => {
                return failed(error)
            })
        })
    }
    forgetPassword(data) {
        return new Promise((success, failed) => {
            if (!data.email) {
                failed('please enter email address')
            } else {
                if (data.email) {
                    User.findOne({ email: data.email }).then(user => {
                        if (user) {
                            mailService(user)
                            success('OTP has been sent to registred email')
                        } else {
                            failed('This email is not registered with us')
                        }
                    }).catch(err => {
                        failed(err)
                    })
                }
            }
        })
    }
    addFollower(data) {
        return new Promise(async (success, failed) => {
            let condition = {
                userId: data.followedUser,
                follower: data.follower
            }
            let isExist = await Follower.findOne({ userId: data.followedUser, follower: data.follower })

            if (isExist) {
                let DATA = await Follower.findByIdAndUpdate({ _id: isExist._id }, { isFollow: data.isFollow })
                if (DATA) {
                    return success(DATA)
                }
            }
            Follower.create(condition).then( async(done) => {
                if (data.followedUser != data.userID) {
                    let notiData = {
                        receiver: data.followedUser,
                        message: `${data.userName} starts following you`,
                        title: "Follow request"
                    }

                    await notification.emit(notiData)

                    let Notification = new NotificationModel({
                        senderId: data.likedBy,
                        receiverId: data.postUserId,
                        message: notiData.message,
                        date: data.time
                    })
                    Notification.save().then((res) => {
                    })
                }


                success(done)
            }).catch((error) => {
                failed(error)
            })



        })
    }
    removeFollower(data) {
        return new Promise((success, failed) => {
            User.findById({ _id: data.followedUser }).then(user => {
                if (user.followers.includes(data.follower)) {
                    User.findByIdAndUpdate({ _id: data.followedUser }, { $pull: { followers: data.follower } }, { new: true }).then(user => {
                        if (user) {
                            User.findById({ _id: data.follower }).then(user => {
                                if (user.following.includes(data.followedUser)) {
                                    User.findByIdAndUpdate({ _id: data.follower }, { $pull: { following: data.followedUser } }, { new: true }).then(user1 => {
                                        success(user1)
                                    }).catch(err => {
                                        failed(err)
                                    })

                                } else {
                                    return
                                }
                            })
                        }
                    })

                } else {
                    return
                }
            })
        })
    }

    searchAllUser(data){
        console.log("data===>>",data)
        return new Promise((success, failed) => {
            User.find({ userName: { $regex: data, $options: 'i' } }).then((users) => {
               return success(users)
            }).catch((err)=>{
                return failed(err)
            })
        })
    }

}





module.exports = userController;
