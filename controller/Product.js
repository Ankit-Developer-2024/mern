const {Product} =  require("../model/Product");

exports.createProduct = async(req,res)=>{
    
    const product=new Product(req.body)
         product.discountPrice=Math.round(product.price*(1-product.discountPercentage/100))
    try {
        const response=await product.save();
        res.status(201).json(response)
    } catch (error) {
        res.status(400).json(error) 
    }
}


exports.fetchAllProduct = async(req,res)=>{

      //filter: {"category":["beauty","laptop"]}
   //sort :{_sort:"price",_order:"asc"}
   //pagination:{_page:1,_limit:10}
    
    let condition={}

    if(!req.query.admin){
        condition.deleted={$ne:true}
    }

    let query=Product.find(condition)
    let query2=Product.find(condition)
 
    if(req.query.category ){
        query= query.find({category:{$in:req.query.category.split(',')}})
        query2= query2.find({category:{$in:req.query.category.split(',')}})
    }
    if(req.query.brand ){
        query= query.find({brand:{$in:req.query.brand.split(',')}})
        query2= query2.find({brand:{$in:req.query.brand.split(',')}})
    }
 
    if(req.query._sort && req.query._order){
        query= query.sort({[req.query._sort]:req.query._order})
    }

   
    if(req.query._page && req.query._limit){
        const pageSize=req.query._limit;
        const page=req.query._page; 
        query= query.skip(pageSize*(page-1)).limit(pageSize)
    }  
    try {
        const totalDocs=await query2.exec();  //Beacuse mongoose not allow to exce multiple time on single instance
        const docs=await query.exec();
        
        res.set("X-Total-Count",totalDocs.length)
        res.status(200).json(docs)
    } catch (error) {
        res.status(400).json(error) 
    }
}


exports.fetchProductById = async(req,res)=>{

    const {id}=req.params;
 
  try {
    let product=await Product.findById(id)
     res.status(200).json(product)
  } catch (error) {
      res.status(400).json(error) 
  }
}


exports.updateProduct = async(req,res)=>{

    const {id}=req.params;
 
  try {
    let product=await Product.findByIdAndUpdate(id,req.body,{new:true})
    product.discountPrice=Math.round(product.price*(1-product.discountPercentage/100))
    const updateProduct= await product.save()
    res.status(200).json(updateProduct)
  } catch (error) {
      res.status(400).json(error) 
  }
}