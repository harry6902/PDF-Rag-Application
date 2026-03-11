

import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";

const qdrant= new QdrantClient({
    url:"http://localhost:6333"
})

export async function initVectorDB(){
    const collections= await qdrant.getCollections();
    const checkCollection= collections.collections.find(c=> c.name==="documents");

    if(!checkCollection){
        await qdrant.createCollection("documents", {
            vectors:{
                size:1536,
                distance:"Cosine"
            }

        })
    }


}

export async function storeEmbeddinngs(embeddings: any[]){

   try {
     await qdrant.upsert("documents",{
         points: embeddings.map((item,index)=>({
             id:index,
             payload:{
                 text:item.text
             },
             vector:item.embedding
         }
         ))
     })
   } catch (error) {
       console.log(error);
   }
}


export async function searchEmbeddings(vector:number[]){
 

    const searchResults= await qdrant.search("documents",{
        vector,
        limit:5
    })

    return searchResults;
}