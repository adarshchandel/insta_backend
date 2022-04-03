const express = require('express');
const postRouter = express.Router();
const postController = require('../controllers/postController');
const postRepo = new postController();
const multer = require('multer');
const auth = require('../../auth/auth');
const post = require('../../model/post');
const { Socket } = require('socket.io');



var storage = multer.diskStorage({
    destination:((req,file,cb)=>{
        cb(null , 'server/uploads')
    }),
    filename: ((req,file,cb)=>{
        cb(null, file.fieldname+'-'+Date.now()+file.originalname)
    
    })
})

const uploads = multer({storage:storage})



postRouter.route('/createPost').post(auth,uploads.single('image'),(req,res)=>{
   postRepo.addPost(req.body,req.user,req.file).then(post=>{
      return res.json({success:true,data:post})
   }).catch(err=>{
      return res.json({success:false,data:err})
   })
})

postRouter.route('/allPosts').post((req,res)=>{
    postRepo.allPosts(req.body).then(post=>{
       return res.json({success:true,data:post})
    }).catch(err=>{
        return res.json({success:false,data:err})
    })
})

postRouter.route('/userPosts/:id').get((req,res)=>{
    postRepo.getUserPost(req.params).then(post=>{
        return res.json({success:true,data:post})
    }).catch(err=>{
        return res.json({success:false,data:err})

    })
})


postRouter.route('/myPosts').post(auth,(req,res)=>{
    postRepo.myPosts(req.body).then(post=>{
        res.json({success:true,data:post})
    }).catch(err=>{
        res.json({success:false,data:err})
    })

})


postRouter.route('/deletePost').post(auth,(req,res)=>{
    postRepo.deletePost(req.body).then(post=>{
        res.json({success:true,data:post})
    }).catch(err=>{
        res.json({success:false,data:err})
    })
})


postRouter.route('/addLike').put(auth,(req,res)=>{
    postRepo.likePost(req.body).then(post=>{
        res.json({success:true,data:post,})
    }).catch(err=>{
        res.json({success:false,data:err})
    })
})

postRouter.route('/addDisLike').put(auth,(req,res)=>{
    postRepo.disLikePost(req.body).then(post=>{
        res.json({success:true,data:post})
    }).catch(err=>{
        res.json({success:false,data:err})
    })
})

postRouter.route('/postData').post((req,res)=>{
    postRepo.postData(req.body).then(post=>{
        res.json({success:true,data:post})
    }).catch(err=>{
        res.json({success:false,data:err})
    })
})

postRouter.route('/comment').post(auth,(req,res)=>{
    postRepo.comment(req.body).then(comment=>{
        res.json({success:true,data:comment})
    }).catch(err=>{
        res.json({success:false,data:err})
    })
})


postRouter.route('/commentsList').post(auth,(req,res)=>{
    postRepo.getCommentsList(req.body).then(comments=>{
        res.json({success:true,data:comments})
    }).catch(err=>{
        res.json({success:false,data:err})
    })
})

postRouter.route('/commentReply').post((req,res)=>{
    postRepo.commentReply(req.body).then((done)=>{
        res.json({success:true,data:done , message :'recomment added'})
    }).catch((error)=>{
        res.json({success:false,data:error})
    })
})

postRouter.route('/replyList').post((req,res)=>{
    postRepo.replyList(req.body).then((done)=>{
        res.json({success:true,data:done})
    }).catch((error)=>{
        res.json({success:false,data:error})
    })
})
module.exports = postRouter;