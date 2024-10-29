const mongoose = require("mongoose")
const {Schema} = mongoose;

const paymentMethods={
    values:['cash','card'],
    message:'Payment method must be cash OR card '
}; 
const orderSchema = new Schema({
   items:{type:[Schema.Types.Mixed],required: true},
   totalAmount:{type:Number},
   totalItems:{type:Number},
   user:{type:Schema.Types.ObjectId,ref:'User' ,required : true},
   paymentMethod:{type:String,required :true,enum:paymentMethods},
   status:{type:String,default:"pending"},
   selectedAddress:{type:Schema.Types.Mixed,required:true},
  
}, {timestamps:true})

const virtual=orderSchema.virtual("id");
virtual.get(function () {
    return this._id;
})

orderSchema.set('toJSON',{
    virtuals: true,
    versionKey:false,
    transform:function(doc,ret){delete ret._id}      //these virtuals help to convert _id field to id 
})

exports.Order=mongoose.model("Order",orderSchema)

