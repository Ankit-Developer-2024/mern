const mongoose = require("mongoose")
const {Schema} = mongoose;

const productSchema = new Schema({
   title:{type:String ,required : true,unique:true },
   description:{type:String ,required : true},
   price:{type:Number,min:[1,"wrong min price"] ,required : true},
   discountPercentage:{type:Number,min:[0,"wrong min discount"],max:[100 ,"wrong max discount"] ,required : true},
   discountPrice:{type:Number,min:[0,"wrong min discount"]},
   rating:{type:Number,min:[0,"wrong min rating"],max:[5 ,"wrong max rating"],default:0},
   stock:{type:Number,min:[0,"wrong min rating"],default:0},
   brand:{type:String ,required : true},
   category:{type:String ,required : true},
   thumbnail:{type:String ,required : true},
   images:{type:[String] ,required : true},
   colors:{type:[Schema.Types.Mixed] },
   sizes:{type:[Schema.Types.Mixed] },
   highlights:{type:[Schema.Types.Mixed] },
   deleted:{type:Boolean ,default : false},
})

const virtualID=productSchema.virtual("id");
virtualID.get(function () {
    return this._id;
})


//we can't sort using virtual fields. its better to make this field at time of doc creation
// const virtualDiscountPrice=productSchema.virtual("discountPrice");
// virtualDiscountPrice.get(function () {
//     return (this.price*(1-this.discountPercentage/100)).toFixed(2);
// })

productSchema.set('toJSON',{
    virtuals: true,
    versionKey:false,
    transform:function(doc,ret){delete ret._id}      //these virtuals help to convert _id field to id (ye virtuals database me nhi hote jb hmm
                                                      // call krte h schmena ke through us time ye return ho jate h data me)
})

exports.Product=mongoose.model("Product",productSchema)

