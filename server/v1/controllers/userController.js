const User = require('../../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../keys');
const mailService = require('../../mail');
const socketUsers = require('../socket').socketUsers
const mongoose = require('mongoose');
const Follower = require('../../model/follower');

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
                                smsService(user)
                                mailService(user)
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
            // follower: mongoose.Types.ObjectId(data.follower) ,

            let userData = await User.aggregate([
                { $match: condition },
                {
                    $project: {
                        data: "$userData"
                    }
                }, {
                    $lookup: {
                        from: "followers",
                        let: { userId: "$_id" },
                        pipeline: [{
                            $match: {
                                $expr: { $eq: ["$follower", "$$userId"] }
                            }
                        }],
                        as : "user"
                    }
                }
                // {
                //     $lookup: {
                //         from: "followers",
                //         localField: "_id",
                //         foreignField: "userId",
                //         as: "userData"

                //     },
                //     // {

                //     // }
                // },
                // { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
                // {
                //     $project: {
                //         data: "$userData"
                //     }
                // }
            ])
            console.log('userData==>>', userData)
            return success(userData)
        })
    }

    getUsersList(data) {
        return new Promise((success, failed) => {
            let condition = { _id: mongoose.Types.ObjectId(data.id) }
            console.log('socketUsers==>', socketUsers)

            User.findOne(condition, { "_id": 1, "userName": 1, "profilePic": 1, "followers": 1, "following": 1 }).then(async (user) => {
                let myUser = []

                myUser.push(...user.followers)
                myUser.push(...user.following)


                User.find({ "_id": { "$in": myUser } }, { "_id": 1, "userName": 1, "profilePic": 1, }).then((myUsers) => {

                    let mapUsers = JSON.parse(JSON.stringify(myUsers))
                    mapUsers.map((ele) => {
                        socketUsers.map((ele2) => {
                            if (ele._id == ele2.id) {
                                ele['isActive'] = true
                            }
                        })
                    })

                    success({ user: user, friends: mapUsers })

                })
            }).catch(err => {
                failed(err)
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
                            // user.type = 'forgetPassword'
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

            let follow = await Follower.create(condition)

            console.log('follow=>>', follow)




            // User.findById({ _id: data.followedUser }).then(user => {
            //     if (user.followers.includes(data.follower)) {
            //         return failed('already followed')
            //     } else {
            //         User.findByIdAndUpdate({ _id: data.followedUser }, { $push: { followers: data.follower } },{new:true}).then(user => {
            //             if (user) {
            //                 User.findById({ _id: data.follower }).then(user => {
            //                     if (user.following.includes(data.followedUser)) {
            //                         return
            //                     } else {
            //                         User.findByIdAndUpdate({ _id: data.follower }, { $push: { following: data.followedUser } },{new:true}).then(user1 => {
            //                             success(user1)
            //                         }).catch(err => {
            //                             failed(err)
            //                         })
            //                     }

            //                 })

            //             }

            //         })
            //     }

            // })

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

}





module.exports = userController;
