const Post = require('../../model/post');
const auth = require('../../auth/auth');
const Comment = require('../../model/comment');
const mongoose = require('mongoose')
const User = require('../../model/user');
const likeModel = require('../../model/like');
const commentReply = require('../../model/commentReply')
const notification = require('../../notification')
const NotificationModel = require('../../model/notification'),
Constant = require('../../auth/constant');


class postController {

    addPost(data, user, file) {
        return new Promise((success, failed) => {
            if (!user || !file) {
                return failed('fill all the fields')
            }
            user.password = undefined
            const post = new Post({
                image: file.filename,
                caption: data.caption ? data.caption : '',
                postedBy: user._id
            })
            post.save()
                .then(post => {
                    success(post)
                }).catch(err => {
                    failed(err)
                })
        })
    }

    allPosts(data) {
        let page = data.page
        let count = data.count
        let skip = (page - 1) * count

        console.log('page==>', page, "count=>>", count, "skip=>>", skip)
        let userId = data.userId
        return new Promise(async (success, failed) => {
            let postData = await Post.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "postedBy",
                        foreignField: "_id",
                        as: "createdBy"
                    }

                },
                { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "likes",
                        let: { postId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        { $expr: { $eq: ["$postId", { $toObjectId: "$$postId" }] } },
                                        { isLiked: true }
                                    ]
                                }
                            }
                        ],
                        as: "likes"
                    }
                },
                {
                    $lookup: {
                        from: "likes",
                        let: { postId: "$_id", userId: userId },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        { $expr: { $eq: ["$postId", { $toObjectId: "$$postId" }] } },
                                        { likedBy: mongoose.Types.ObjectId(userId) },
                                        { isLiked: true }
                                    ]
                                }
                            }
                        ],
                        as: "userLikeData"
                    }
                }, {
                    $lookup: {
                        from: "comments",
                        localField: "_id",
                        foreignField: "postId",
                        as: "commentsData"
                    },

                }, {
                    $lookup: {
                        from: "recomments",
                        localField: "_id",
                        foreignField: "postId",
                        as: "reCommentsData"
                    }
                }, {
                    $project: {
                        likes: { $size: "$likes" },
                        postedBy: {
                            userName: "$createdBy.userName",
                            profilePic: "$createdBy.profilePic",
                            _id: "$createdBy._id"
                        },
                        comments: { $size: "$commentsData" },
                        commentsWithReComments: { $sum: [{ $size: "$reCommentsData" }, { $size: "$commentsData" }] },
                        caption: 1,
                        image: 1,
                        isLiked: {
                            $cond: {
                                if:
                                    { $eq: [{ $size: "$userLikeData" }, 1] }, then: true, else: false
                            }
                        }
                    }
                },
                { $sort: { _id: -1 } },
                { $skip: parseInt(skip) },
                { $limit: parseInt(count) }
            ])
            Post.countDocuments().then((count) => {

                return success({ data: postData, count: count })
            })

        })
    }

    myPosts(data) {
        return new Promise((success, failed) => {
            Post.find({ postedBy: data.id })
                .populate('postedBy', "_id userName")
                .then(posts => {
                    success(posts)
                }).catch(err => {
                    failed(err)
                })
        })
    }

    getUserPost(data) {

        return new Promise((success, failed) => {
            Post.find({ postedBy: data.id })
                .populate('postedBy', "_id userName profilePic")
                .then(posts => {
                    success(posts)
                }).catch(err => {
                    failed(err)
                })
        })
    }

    postData(data) {
        return new Promise((success, falied) => {
            Post.findById({ _id: data.postId })
                .populate('postedBy', "_id userName profilePic")
                .then(post => {
                    success(post)
                }).catch(err => {
                    failed(err)
                })
        })
    }

    deletePost(data) {
        return new Promise((success, failed) => {
            const { postId , userId} = data
            if(!postId) return failed(Constant.messages.postMessages.postIdReq)
            if(!userId) return failed(Constant.messages.userMessages.userIdReq)

            let deleteObj = { _id : postId, postedBy : userId }
            Post.findOneAndDelete({ deleteObj }).then(post => {
                success('post deleted successfully')
            }).catch(error => {
                failed(error)
            })
        })
    }

    likePost(data) {
        return new Promise(async (success, failed) => {
            let isLikeExist = await likeModel.findOne({ postId: mongoose.Types.ObjectId(data.postId), likedBy: mongoose.Types.ObjectId(data.likedBy) })

            if (isLikeExist) {
                likeModel.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(isLikeExist._id) }, { $set: { isLiked: data.isLiked } }, { new: true }).then((done) => {
                    return success(done)
                })
            } else {
                let obj = {
                    postId: data.postId,
                    likedBy: data.likedBy
                }
                likeModel.create(obj).then(async (done) => {

                    if (data.postUserId != data.likedBy) {  
                        let notiData = {
                            receiver: data.postUserId,
                            message: `${data.userName} liked your post`,
                            title: "Post liked"
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
                    return success(done)
                }).catch((error) => {
                    return failed('error occured', error)
                })
            }
        })
    }


    comment(data) {
        return new Promise((success, failed) => {
            const comment = new Comment({
                comment: data.comment,
                postId: data.postId,
                commentedBy: data.commentBy
            })
            comment.save()
                .then(comment => {
                    success(comment._id)

                }).catch(err => {
                    failed(err)
                })
        })
    }

    getCommentsList(Data) {
        return new Promise(async (success, failed) => {
            let condition = { 'postId': mongoose.Types.ObjectId(Data.postId) }
            Comment.aggregate([
                { $match: condition },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'commentedBy',
                        foreignField: '_id',
                        as: 'commentBy'
                    },
                },
                {
                    $unwind: { path: '$commentBy', preserveNullAndEmptyArrays: true }
                },
                {
                    $lookup: {
                        from: 'recomments',
                        let: { commentId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$commentId", "$$commentId"] }
                                }
                            }
                        ],
                        as: "reComment"
                    }
                },
                {
                    $project: {
                        commentedBy: {
                            userName: '$commentBy.userName',
                            _id: '$commentBy._id',
                            profilePic: '$commentBy.profilePic'
                        },
                        comment: 1,
                        _id: 1,
                        replyPage: '1',
                        reComments: [],
                        recomment: { $size: "$reComment" }
                    }
                }, {
                    $sort: { _id: -1 }
                }
            ]).then((done) => {
                success(done)
            }).catch((error) => {
                failed(error)

            })
        })
    }

    commentReply(data) {
        return new Promise((success, failed) => {
            const { reComment, commentId, commentedBy, postId } = data

            if (!reComment, !commentId, !commentedBy) {
                return failed('Failed !! required fileds are missing')
            }

            let recomment = new commentReply({
                reComment: reComment,
                commentId: commentId,
                commentedBy: commentedBy,
                postId: postId
            })
            recomment.save().then((done) => {
                success(done._id)
            }).catch((error) => {
                failed('recomment not added')
            })

        })
    }

    replyList(data) {
        let page = data.page
        let count = data.count
        let skip = (page - 1) * count

        return new Promise((success, failed) => {
            let condition = { commentId: mongoose.Types.ObjectId(data.commentId) }
            commentReply.aggregate([
                { $match: condition },
                {
                    $lookup: {
                        from: "users",
                        localField: "commentedBy",
                        foreignField: "_id",
                        as: "rplyBy"
                    }
                }, {
                    $unwind: { path: '$rplyBy', preserveNullAndEmptyArrays: true }
                },
                {
                    $project: {
                        reComment: "$reComment",
                        rplyBy: {
                            userName: '$rplyBy.userName',
                            _id: '$rplyBy._id',
                            profilePic: '$rplyBy.profilePic'
                        }
                    }

                }, { $sort: { _id: -1 } },
                { $skip: parseInt(skip) },
                { $limit: parseInt(count) }
            ]).then(async (done) => {
                let totalCount = await commentReply.countDocuments(condition)
                console.log('done', done)
                success({ data: done, count: totalCount })
            }).catch((error) => {
                failed(error)
            })
        })
    }





}


// if (Post.likes.includes(data.likedBy)) {
//     return failed('Already liked this post')
// } else {
//     Post.findByIdAndUpdate({ _id: data.postId }, { $push: { likes: data.likedBy } }, { new: true }).then(post => {
//         success(post)
//     }).catch(error => {
//         failed(error)
//     })
// }


module.exports = postController;