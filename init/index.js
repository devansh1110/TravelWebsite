const mongoose= require("mongoose");
const initData= require( "./data");
const Listing= require( "../models/listing.js") ;

const MONGO_URL= "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("Connected to database");
}).catch((err)=>{console.error(err);});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB= async ()=>{
    await Listing.deleteMany({});
    initData.data= initData.data.map((obj)=>({...obj, owner: '6623279b840b2d48025a5b8a'}))
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
}


initDB();