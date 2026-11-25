import { z } from "zod";

export const guestSchema = z.object({
    sessionId: z.uuid().optional()
});

export const registrationSchema = z.object({
    email: z.email(),
    name: z.string(),
    password: z.string().regex(/^(?=.*[a-z])(?=.*\W)(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/),
    level: z.string(),
    knownTechnologies: z.array(z.string())
});

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().regex(/^(?=.*[a-z])(?=.*\W)(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export type RegistrationSchema = z.infer<typeof registrationSchema>;

export type GuestSchema = z.infer<typeof guestSchema>;