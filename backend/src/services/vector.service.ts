import { QdrantClient } from "@qdrant/js-client-rest";
import {  v4 as uuid } from "uuid";
const qdrant= new QdrantClient({
    url:process.env.QDRANTDB_URL,
    apiKey: process.env.QDRANTDB_APIKEY
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
             id:uuid(),
             payload:{
                 text:item.text,
                 page: item.page,
                 documentID: item.documentID,
                 fileName:item.fileName
             },
             vector:item.embedding
         }
         ))
     })
   } catch (error) {
       console.log(error);
   }
}


export async function searchEmbeddings(vector:number[],fieldIds:string[]){
 
    let searchOptions:any= {
        vector,
        limit:5,
        // with_payload:true,
        // with_vector: false

    }

   
   
    // if (fieldIds.length === 1) {
    //     searchOptions.filter = {
    //         must: [{
    //             key: "documentID",
    //             match: { value: fieldIds[0] }
    //         }]
    //     };
    // } else {
    //     searchOptions.filter = {
    //         must: [{
    //             key: "documentID",
    //             match: { any: fieldIds }  // ✅ use "any" instead of should
    //         }]
    //     };
    // }
        
    
  
    try {
        const searchResults= await qdrant.search("documents",searchOptions);
        return searchResults;
    } catch (error) {
        console.log("error in search");
        console.log(error);
        
    }
   
   
}