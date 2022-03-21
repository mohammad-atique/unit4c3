const express= require("express");
const mongoose = require("mongoose");
const { body, validationResult } = require('express-validator');
const path= require("path");
const multer= require("multer");
const app= express();

app.use(express.json())

const connect= ()=>{
    return mongoose.connect("mongodb://127.0.0.1:27017/coding");
    
}


const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, path.join(__dirname,"./my-uploads"));
    },
    filename: function (req, file, callback) {
      const prefixSuffix = Date.now();
      callback(null,prefixSuffix  + '-' + file.originalname )
    }
  });

const options={
    storage,
    limits:{
        fileSize: 1024*1024*5
    }
}

const uploads = multer(options);





// user schema

const userSchema= new mongoose.Schema({
    firstName: {type: String, required: true},
    age:{type: Number, required: true},
    email: {type: String, required: true, unique: true},
    prifileImages: {type: String, required: false}
},{
    versionKey:false,
    timestamps: true,
})

// user model

const User= mongoose.model("user",userSchema);


// register route

app.post("/register",body("firstName").isLength({min:3},{max:30}).withMessage("name must be between 3 to 30 char"),
body("age").isNumeric().withMessage("Age must be a number").custom((val)=>{
    if(val<1 || val>150){
        throw new Error("Age incorrect");
    }
    return true;
}),
body("email").isEmail().custom(async (val)=>{
    let user= await User.findOne({email: val});

    if(user){
        throw new Error("Email is already taken");
    }
    return true;
}),async (req,res)=>{
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).send({errors: errors.array()})
        }
       const user = await User.create(req.body);
        return res.status(201).send(user)
    }catch(err){
        res.status(400).send({message: err.message})
    }
})



// book shchema


const bookSchema= new mongoose.Schema({
    likes: {type: Number, default: 0},
    coverImage:  {type: String, required: true},
    content: {type: String, required: true},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref:"user", required: true},
    // publication_id: {type: mongoose.Schema.Types.ObjectId, ref:"publication", required: true}
},{
    versionKey:false,
    timestamps: true,
});

// book model

const Book= mongoose.model("book", bookSchema);



// publication schema


const publicationSchema= new mongoose.Schema({
    name: {type: String, required: true},
},{
    versionKey:false,
    timestamps: true,
});

// publication model
  

const Publication = mongoose.model("publication", publicationSchema);


// comment schema

const commentSchema= new mongoose.Schema({
    body: {type: String, required: true},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref:"user", required: true},
    book_id: {type: mongoose.Schema.Types.ObjectId, ref:"book", required: true}
},{
    versionKey:false,
    timestamps: true,
});

// comment mdel

const Comment= mongoose.model("comment",commentSchema)

app.listen(5000,async ()=>{
    try{
        await connect();
        console.log("listening to 5000")
    }catch(err){
        console.log(err.message);
    }
})
