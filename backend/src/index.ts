import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import pdfParse from "pdf-parse";
// const pdfParse=require("pdf-parse")
// import * as pdfParse from "pdf-parse";

const app=express();
app.use(express.json());
app.use(cors());


const upload=multer({dest:"uploads/"});

app.get("/",(req,res)=>{

    res.send("Hello from PDF RAG application!!")
})


app.post("/upload",upload.single("file"),async (req,res)=>{

    // console.log(req.file);
    const filePath= req.file?.path

    if(!filePath){
        res.status(400).json({message:"No file uploaded"})
        return;
    }

    const pdfBuffer= fs.readFileSync(filePath);
    const pdfData=await pdfParse(pdfBuffer);

    res.json({
        message:"File uploaded successfully",
        content: pdfData.text.slice(0,500),
        file:req.file
    })

})

app.listen(5000,()=>{
    console.log("Server is running on port 5000")
})