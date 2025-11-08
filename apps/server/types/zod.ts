import { z } from "zod";

export const userSchema = z.object({
    email:z.string().email("Invalid email credentails"),
    password:z.string()
}) 

export const orderSchema = z.object({
    asset:z.string(),
    quantity:z.number(),
    openingPrice:z.number(),
    userAccount:z.number().optional(),
    exposure:z.number().optional(),
    leverge:z.number().optional(),
    type:z.enum(["BUY", "SELL"])
})