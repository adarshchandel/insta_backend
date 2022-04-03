const Post = require('../../model/post');
const auth = require('../../auth/auth');
const Comment = require('../../model/comment');
const mongoose = require('mongoose')
const User = require('../../model/user');
const likeModel = require('../../model/like');
const commentReply = require('../../model/commentReply')

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
                    $project: {
                        likes: { $size: "$likes" },
                        postedBy: {
                            userName: "$createdBy.userName",
                            profilePic: "$createdBy.profilePic",
                            _id: "$createdBy._id"
                        },
                        comments: { $size: "$commentsData" },
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
                { $limit: parseInt(count) },
                { $skip: parseInt(skip) }
            ])
            return success(postData)
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
            Post.findOneAndDelete({ _id: data.postId }).then(post => {
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
                likeModel.create(obj).then((done) => {
                    return success(done)
                })
            }
        })
    }


    disLikePost(data) {
        return new Promise((success, failed) => {
            if (!data.postId) {
                return failed('post unavailable')
            } if (!data.dislikedBy) {
                return failed('invalid user')
            }
            if (data.postId) {
                Post.findById({ _id: data.postId }).then(post => {
                    if (post) {
                        if (post.disLikes.includes(data.dislikedBy)) {

                            Post.findByIdAndUpdate({ _id: data.postId }, { $pull: { disLikes: data.dislikedBy } }, { new: true }).then(post => {
                                return success('dislike removed')
                            })
                        } else {
                            if (post.likes.includes(data.dislikedBy)) {
                                Post.findByIdAndUpdate({ _id: data.postId }, { $pull: { likes: data.dislikedBy } }, { new: true }).then(post => {
                                    if (post) {
                                        Post.findByIdAndUpdate({ _id: data.postId }, { $push: { disLikes: data.dislikedBy } }, { new: true }).then(post => {
                                            return success('You have disliked this post')
                                        })
                                    }
                                })
                            } else {
                                Post.findByIdAndUpdate({ _id: data.postId }, { $push: { disLikes: data.dislikedBy } }, { new: true }).then(post => {
                                    return success('You have disliked this post')
                                }).catch(err => {
                                    failed(err)
                                })
                            }
                        }

                    } else {
                        return failed('Post not found')
                    }
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
                    success('comment added successfully')

                }).catch(err => {
                    failed(err)
                })
        })
    }

    getCommentsList(Data) {
        console.log('data==>>', Data)
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
                        reComments : [],
                        recomment : { $size : "$reComment" }
                    }
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
            const { reComment, commentId, commentedBy } = data

            if (!reComment, !commentId, !commentedBy) {
                return failed('Failed !! required fileds are missing')
            }

            let recomment = new commentReply({
                reComment: reComment,
                commentId: commentId,
                commentedBy: commentedBy
            })
            recomment.save().then((done) => {
                success(done._id)
            }).catch((error) => {
                failed('recomment not added')
            })

        })
    }

    replyList(data){
        return new Promise((success ,failed)=>{
            let condition = { commentId : mongoose.Types.ObjectId(data.commentId) }
            commentReply.aggregate([
                { $match : condition },
                { 
                    $lookup :{
                        from : "users",
                        localField : "commentedBy",
                        foreignField : "_id",
                        as : "rplyBy"
                    }
                },{
                    $unwind: { path: '$rplyBy', preserveNullAndEmptyArrays: true }
                },
                { 
                  $project : {
                    reComment : "$reComment",
                    rplyBy : {
                        userName: '$rplyBy.userName',
                        _id: '$rplyBy._id',
                        profilePic: '$rplyBy.profilePic'
                    }

                  }
                  
                },{ $sort: { _id : -1}  }
            ]).then((done)=>{
                console.log('done',done)
                success(done)
            }).catch((error)=>{
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