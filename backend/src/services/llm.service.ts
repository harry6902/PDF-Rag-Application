import OpenAI from "openai";

import dotenv from "dotenv";
dotenv.config();

const openai= new OpenAI({
    apiKey:process.env.OPENAI_API_KEY!
})

export async function answerQuery(context:string,question:string){


    const response= await openai.chat.completions.create({
        model:"gpt-4o-mini",
        messages:[
            {
                role:"system",
                content:`
                You are a helpful AI assistant which helps in answering questions
                Answer the question based on context provided. Don't show "\n" and "\n\n" in the respose as it is just a line separation.
                
                Use only provided context to answer the questions

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
        ]
    })

    return response.choices[0].message.content;
}