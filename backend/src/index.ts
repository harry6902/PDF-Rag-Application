import express from "express";
import cors from "cors";
import multer from "multer";

const app=express();
app.use(express.json());
app.use(cors());


const upload=multer({dest:"uploads/"});

app.get("/",(req,res)=>{

    res.send("Hello from PDF RAG application!!")
})


app.post("/upload",upload.single("file"),(req,res)=>{

    console.log(req.file);

    res.json({
        message:"File uploaded successfully",
        file:req.file
    })

})

app.listen(5000,()=>{
    console.log("Server is running on port 5000")
})