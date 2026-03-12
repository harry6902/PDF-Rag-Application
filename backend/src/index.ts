import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import pdfParse from "pdf-parse";
import dotenv from "dotenv"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { queryBody } from "../types";
import { generateEmbedding,questionEmbeddings } from "./services/embedding.service";
import { storeEmbeddinngs,initVectorDB, searchEmbeddings } from "./services/vector.service";
import { answerQuery } from "./services/llm.service";


dotenv.config({override:true});
const app=express();


app.use(express.json());
app.use(cors());

const upload=multer({dest:"uploads/"});

app.get("/",(req,res)=>{

    res.send("Hello from PDF RAG application!!")
})


app.post("/upload",upload.single("file"),async (req,res)=>{

    // console.log(req.file);
  try {
      const filePath= req.file?.path
  
      if(!filePath){
          res.status(400).json({message:"No file uploaded"})
          return;
      }
  
      const pdfBuffer= fs.readFileSync(filePath);
      const pdfData=await pdfParse(pdfBuffer);
      const splitter= new RecursiveCharacterTextSplitter({chunkSize:1000,chunkOverlap:200});
      const chunks=await splitter.splitText(pdfData.text);
      const embeddings= await generateEmbedding(chunks);
      await storeEmbeddinngs(embeddings);
  
      res.json({
          message:"File uploaded successfully",
          content: pdfData.text.slice(0,500),
          file:req.file
      })
  } catch (error) {

            res.status(500).json({
                message:"Upload failed!!"
            })
    
  }

})


app.post("/query",async (req,res)=>{

    const {success,data}= queryBody.safeParse(req.body);
    if(!success){
        res.status(411)
        .json({
            message:"Input validation failed"
        })
        return;
    }
    const embeddingsResponse= await questionEmbeddings(data.question);
    const searchResults=  await searchEmbeddings(embeddingsResponse.data[0].embedding);
    if(!searchResults){
        res.json({
            message:"No matter related to question"
        })
        return;
    }

    const context= searchResults.slice(0,3).map((r,i) => `Source ${i+1}: ${r.payload!.text}`).join("\n\n")
    
    
    const answer= await answerQuery(context,data.question);
    res.json({
      answer
    })
})


async function startServer(){
    await initVectorDB();
    app.listen(5000,()=>{
        console.log("Server is running on port 5000")
    })
}
startServer();