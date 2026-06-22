import z from "zod";

export const formSchema = z.object({
  email: z
    .string()
    .trim() 
    .toLowerCase() 
    .email({ message: "Введіть правильний формат пошти" }),
  
  password: z
    .string()
    .min(8, { message: "Пароль має містити хоча б 8 символів" })
    .max(100, { message: "Пароль занадто довгий" }),
});

export type FormSchemaType = z.infer<typeof formSchema>;