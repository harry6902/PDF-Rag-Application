
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
const openai= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!
})

export async function generateEmbedding(chunks:string[]){
 
    const embeddings=await Promise.all( 
    chunks.map(async (chunk)=>{
        const response=await openai.embeddings.create({
            model:"text-embedding-3-small",
            input:chunk
        })

        return {
            embedding:response.data[0].embedding,
            text:chunk
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