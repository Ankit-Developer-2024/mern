const { User } = require("../model/User");
const crypto=require("crypto");
const jwt = require('jsonwebtoken');
const { sanitizeUser, sendMail } = require("../services/common");



exports.createUser = async(req,res)=>{

    try {
        const salt = crypto.randomBytes(16);
        crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256',
        async function(err, hashedPassword) {
        const user=new User({...req.body,password:hashedPassword,salt})       
        const doc=await user.save();
        req.login(sanitizeUser(doc),(err)=>{               //req.login it will create session for user
            if(err){
                res.status(400).json(err)
            }
            else{
                const token = jwt.sign(sanitizeUser(doc),  process.env.JWT_SECRET_KEY);
                res.cookie('jwt',token,{
                    expires:new Date(Date.now()+3600000),
                    httpOnly:true
                })
                .status(201)
                .json({id:doc.id,email:doc.email,role:doc.role})
            }
        })
      
    })
    } catch (error) {
        res.status(400).json(error) 
    }
}


exports.loginInUser = async(req,res)=>{
   
    const user=req.user
    res.cookie('jwt',user.token,{
        expires:new Date(Date.now()+3600000),
        httpOnly:true})
       .status(200)
       .json({id:user.id,role:user.role,email:user.email})
                          //req.user is made by passport when you are authorticate successfully
}


exports.logout = async(req,res)=>{

    res.cookie('jwt',null,{
        expires:new Date(Date.now()),
        httpOnly:true})
       .sendStatus(200)
                      //req.user is made by passport when you are authorticate successfully
}


exports.checkAuth = async(req,res)=>{
   if(req.user){
    res.json(req.user) 
   }else{
    res.sendStatus(401)
   }
       //req.user is made by passport when you are authorticate successfully
}


exports.resetPasswordRequest = async(req,res)=>{

    const user=await User.findOne({email:req.body.email})
    if(user){
        var token = crypto.randomBytes(48).toString('hex');
        user.resetPasswordToekn=token
        await user.save()
        

        const resetPageLink='http://localhost:3000/reset-password?token='+token+'&email='+req.body.email
        const subject="Reset Password Request from e-commerce"
        const html=`<p>Click <a href=${resetPageLink}>here</a> to Reset Password</p>`
         
        if(req.body.email){
        const mailesponse=await sendMail({to:req.body.email,subject,html})
        res.json({s:"s"}) 
       }else{
        res.sendStatus(400)
       }
    }
    else{   
        res.sendStatus(400)
    }
  
       //req.user is made by passport when you are authorticate successfully
}


exports.resetPassword= async(req,res)=>{
   const email=req.body.email
   const password=req.body.password
   const token=req.body.token

   const user=await User.findOne({email:email,resetPasswordToekn:token})
   if(user){
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(password, salt, 310000, 32, 'sha256', async function(err, hashedPassword) {
       user.password=hashedPassword
       user.salt=salt
       await user.save()

       const subject="Password Succesfully Reset -- from e-commerce"
       const html=`<p>Succesfully abl to reset password</p>`
        
       if(req.body.email){
       const mailesponse=await sendMail({to:email,subject,html})
       res.json({s:"s"}) 
       }else{
        res.sendStatus(400)
       }
    })
   }
   else{
       res.sendStatus(400)
   }
       //req.user is made by passport when you are authorticate successfully
}