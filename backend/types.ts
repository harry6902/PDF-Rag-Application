import {z} from "zod";

export const queryBody=z.object({
    question:z.string(),
    fieldIds:z.array(z.string())
})