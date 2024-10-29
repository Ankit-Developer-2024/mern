const {User} =require("../model/User")

exports.fetchUserById=async(req,res)=>{
   
    const {id}=req.user;    
    try{
        let user=await User.findById(id,"id name email addresses role")
        res.status(200).json({id:user.id,addresses:user.addresses,email:user.email,role:user.role})
    }
    catch(err){
        res.status(400).json(err)
    }
}


exports.updateUser = async(req,res)=>{

    const {id}=req.params;
 
  try {
    let user=await User.findByIdAndUpdate(id,req.body,{new:true})
     res.status(200).json(user)
  } catch (error) {
      res.status(400).json(error) 
  }
}