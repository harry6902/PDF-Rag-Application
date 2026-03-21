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
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const upload=multer({dest:"uploads/"});

app.get("/",(req,res)=>{

    res.send("Hello from PDF RAG application!!")
})


app.post("/upload",upload.array("files"),async (req,res)=>{

    // console.log(req.file);
  try {
      const files= req.files as Express.Multer.File[];
  
      if(!files){
          res.status(400).json({message:"No file uploaded"})
          return;
      }
      let i=1;
      for(const file of files){
      
        
      const id=req.body[`file${i}`]
      i++; 
    
      
      const pdfBuffer= fs.readFileSync(file.path);
      const pdfData=await pdfParse(pdfBuffer);
      const splitter= new RecursiveCharacterTextSplitter({chunkSize:1000,chunkOverlap:200});
    //   const chunks=await splitter.splitText(pdfData.text);
      const chunks=await splitter.createDocuments(
        [pdfData.text],
        [{page:1}]
      )
      const embeddings= await generateEmbedding(chunks,id,file.originalname);
 
      await storeEmbeddinngs(embeddings);
      }
      res.json({
          message:"Files uploaded successfully",
         
      })
  } catch (error) {

            res.status(500).json({
                message:"Upload failed!!"
            })
    
  }

})


app.post("/query",async (req,res)=>{
    console.log(req.body);
    const {success,data}= queryBody.safeParse(req.body);
    if(!success){
        res.status(411)
        .json({
            message:"Input validation failed"
        })
        return;
    }
    console.log(data);
    const embeddingsResponse= await questionEmbeddings(data.question);
    if(data.fieldIds===undefined)return;
    let searchResults;
        

        searchResults=await searchEmbeddings(embeddingsResponse.data[0].embedding,data.fieldIds);
    
    

    if(!searchResults){
        res.json({
            message:"No matter related to question"
        })
        return;
    }
  
    const context= searchResults.slice(0,3).map((r,i:number) => `Source ${i+1} ${r.payload?.text}`).join("\n\n")
    const sources={
        fileName:searchResults[0].payload?.fileName as string,
        page: searchResults[0].payload?.page as number
    }

 
   
    
    const answer= await answerQuery(context,data.question,res,sources);
  
})


async function startServer(){
    await initVectorDB();
    app.listen(5000,()=>{
        console.log("Server is running on port 5000")
    })
}
startServer();