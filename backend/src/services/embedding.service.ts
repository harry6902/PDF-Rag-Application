
import OpenAI from "openai";
import dotenv from "dotenv";
import { Document } from "langchain";
import { randomUUID } from "node:crypto";
dotenv.config();
const openai= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!
})

export async function generateEmbedding(chunks:Document<Record<string, any>>[],fileName: string){
    const uuid= randomUUID()
    const embeddings=await Promise.all( 
    chunks.map(async (chunk)=>{
        const response=await openai.embeddings.create({
            model:"text-embedding-3-small",
            input: chunk.pageContent
        })

        return {
            embedding:response.data[0].embedding,
            text:chunk.pageContent,
            page:chunk.metadata.page,
            documentID: uuid,
            fileName
        }
    })
);
    
    
    return embeddings;
}

export async function questionEmbeddings(question:string){

    const response=await openai.embeddings.create({
        model:"text-embedding-3-small",
        input:question
    })

    return response;
}