const mongoose = require('mongoose');
var url = 'mongodb://localhost:27017/insta_clone';

// let {MONGOURI} = require('./keys');

mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true},(err,db)=>{
    if(err) throw err
    console.log('database connected');
})







