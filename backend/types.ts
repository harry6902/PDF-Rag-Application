import {z} from "zod";

export const queryBody=z.object({
    question:z.string(),
    fileName:z.string().optional()
})