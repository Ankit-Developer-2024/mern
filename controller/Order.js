const {Order} =require("../model/Order")
const { Product } = require("../model/Product")
const { User } = require("../model/User")
const { invoiceTemplate, sendMail } = require("../services/common")

exports.fetchOrderByUser=async(req,res)=>{
   const {id}=req.user
    try{
        const orders=await Order.find({user:id})
        res.status(200).json(orders)
    }
    catch(err){
        res.status(400).json(err)
    }
}

exports.createOrder = async(req,res)=>{
    
    const order=new Order(req.body)
    try {
        
        for(let item of order.items){
            let product=await Product.findOne({_id:item.product.id})
            if(product.stock<item.quantity){
                res.status(400).json({message:`Your ${product.title} product have more quantity than our stock. So please fill product quantiy again`})
                return ;
            } }

        for(let item of order.items){
            let product=await Product.findOne({_id:item.product.id})
                  product.$inc('stock',-1*item.quantity)
                  await product.save()
                  //for optimum perforce we should think  again and we do it with in single for loop
        }

        const response=await order.save();
        const user=await User.findById(order.user)
        sendMail({to:user.email,html:invoiceTemplate(order),subject:"Your Order Invoice"})
        res.status(201).json(response)
    } catch (error) {
        res.status(400).json(error) 
    }
}


exports.deleteOrder = async(req,res)=>{
        
    const {id}=req.params
    try {
        const response=await Order.findByIdAndDelete(id)
       res.status(200).json(response)
    } catch (error) {
        res.status(400).json(error) 
    }
}


exports.updateOrder = async(req,res)=>{

    const {id}=req.params;
 
  try {
    let cart=await Order.findByIdAndUpdate(id,req.body,{new:true})
     res.status(200).json(cart)
  } catch (error) {
      res.status(400).json(error) 
  }
}

exports.fetchAllOrder = async(req,res)=>{
  
  let query=Order.find({})
  let query2={};


  if(req.query._sort && req.query._order){
      query= query.sort({[req.query._sort]:req.query._order})
  }

 
  if(req.query._page && req.query._limit){
      const pageSize=req.query._limit;
      const page=req.query._page; 
      query= query.skip(pageSize*(page-1)).limit(pageSize)
  }  
  try {
      const totalDocs=await Order.countDocuments(query2);  //Beacuse mongoose not allow to exce multiple time on single instance
      const docs=await query.exec();
      res.set("X-Total-Count",totalDocs)
      res.status(200).json(docs)
  } catch (error) {
      res.status(400).json(error) 
  }
}