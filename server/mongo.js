const mongoose = require('mongoose');
var url = 'mongodb://0.0.0.0:27017/insta_clone';

// let {MONGOURI} = require('./keys');

mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true , serverSelectionTimeoutMS : 30000},(err,db)=>{
    if(err) throw err
    console.log('database connected');
})







