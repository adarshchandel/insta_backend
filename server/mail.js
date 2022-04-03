const mailer = require('nodemailer');
const key = require('./keys');



const Mail = async (data)=>{
    // console.log('mail js',data)
    const transporter = mailer.createTransport( {
        service:'gmail',
        auth:{
            user:key.sendMail,
            pass:key.password
        }
    });

    let random =''
    for(let i =1;i<=6;i++){
        random += [Math.floor(Math.random() * 10)]
     }

    const options ={
        form:'Adarsh Insta',
        to:data.email,
        subject: 'Reset Password',
        text: `Dear ${data.userName} your OTP for password reset is ${random}`
    }



   await transporter.sendMail(options,(err,res)=>{
        if(err){
            console.log('mail error',err)
        }else{
            console.log('mail sent', options)
        }
    })



}

module.exports=Mail