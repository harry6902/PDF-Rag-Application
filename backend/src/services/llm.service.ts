import OpenAI from "openai";
import { Response } from "express";

import dotenv from "dotenv";
dotenv.config();

const openai= new OpenAI({
    apiKey:process.env.OPENAI_API_KEY!
})

export async function answerQuery(context:string,question:string,res: Response){


    const response= await openai.chat.completions.create({
        model:"gpt-4o-mini",
        messages:[
            {
                role:"system",
                content:`
                You are a helpful AI assistant which helps in answering questions
                Answer the question based on context provided. Don't show "\n" and "\n\n" in the respose as it is just a line separation.
                
                Also the pages from which these context and the document name is given for every  context take them and give them in the last list as below example:
                Example output:
                "Document name: Rishab.pdf
                Source: Page3
                Rishab Pant is born in Uttarakand,India"
                If any information is asked which is not related to contest, respond with:
                "I could not find answer in the document"
                Be concise and clear 
                
                `
            },
            {
                role:"user",
                content:`
                context: ${context},
                question: ${question}

                `
            }
        ],
        stream: true
    })
   

    res.setHeader("Content-Type","text/plain");
    for await(const chunk of response){
        const token=chunk.choices[0]?.delta?.content || ""
        res.write(token)

    }
    
    res.end();
    
}