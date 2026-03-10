import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import pdfParse from "pdf-parse";
import OpenAI from "openai";
import dotenv from "dotenv"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantClient } from "@qdrant/js-client-rest";
import { queryBody } from "../types";


dotenv.config({override:true});
const app=express();
const openai= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!
})
const qdrant= new QdrantClient({
    url:"http://localhost:6333"
})
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
    const splitter= new RecursiveCharacterTextSplitter({chunkSize:1000,chunkOverlap:200});
    const chunks=await splitter.splitText(pdfData.text);

    
    const embeddings = await Promise.all(
        chunks.map(async (chunk)=>{
            const response= await openai.embeddings.create({
                model:"text-embedding-3-small",
                input:chunk
            });
            return {
                text: chunk,
                embedding: response.data[0].embedding,
              };
        })
    )

    await qdrant.createCollection("documents",{
        vectors:{
            size:1536,
            distance:"Cosine"
        }
        
    })

    await qdrant.upsert("documents", {
        points: embeddings.map((item, index) => 
        ( {
          id: index,
          vector: item.embedding,
          payload: {
            text: item.text
          }
        }))
      });


    res.json({
        message:"File uploaded successfully",
        content: pdfData.text.slice(0,500),
        file:req.file
    })

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

    const embeddingsResponse= await openai.embeddings.create({
        model:"text-embedding-3-small",
        input:data.question
    })

    const searchResults=  await qdrant.search("documents",{
        vector:embeddingsResponse.data[0].embedding,
        limit:3
    })

    if(!searchResults){
        res.json({
            message:"No matter related to question"
        })
        return;
    }

    const context= searchResults.map(r => r.payload!.text).join("\n\n")

    const completion= await openai.chat.completions.create({
        model:"gpt-4o-mini",
        messages:[
            {
                role:"system",
                content:"Answer the qyestion based on context provided"
            },
            {
                role:"user",
                content:`
                Context:${context},
                Question:${data.question}
                
                `
            }
        ]
    })

    res.json({
      answer: completion.choices[0].message.content
    })
})
app.listen(5001,()=>{
    console.log("Server is running on port 5000")
})