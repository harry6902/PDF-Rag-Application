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
                content:`Answer the question based on context provided. Don't show "\n" and "\n\n" in the respose as it is just a line separation`
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