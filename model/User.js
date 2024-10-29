const mongoose = require("mongoose");
const {Schema} = mongoose;

const userSchema = new Schema({
   email:{type:String ,required : true,unique:true },
   password:{type:Buffer ,required : true},
   role:{type:String ,required : true,default:'user'},
   name:{type:String },
   addresses:{type:[Schema.Types.Mixed]},
   salt:Buffer,
   resetPasswordToekn:{type:String,default:""}
},{timestamps:true})

const virtual=userSchema.virtual("id");
virtual.get(function () {
    return this._id;
})

userSchema.set('toJSON',{
    virtuals: true,
    versionKey:false,
    transform:function(doc,ret){delete ret._id}      //these virtuals help to convert _id field to id 
})

exports.User=mongoose.model("User",userSchema)

