import {z, ZodSchema} from "zod"


function validateWithSchema<T>(schema:ZodSchema<T> , data:unknown):T{
    const parsedData = schema.safeParse(data)

    if(!parsedData.success){
        const message = parsedData.error.issues.map((isuue)=>isuue.message).join(",")
        throw new Error(message);
    }
    return parsedData.data;
}

export default validateWithSchema;