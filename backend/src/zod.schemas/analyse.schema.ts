import { z } from 'zod'

export const newAnalyseDataSchema = z.object({
    title: z.string().nullable(),
    description: z.string(),
    sector: z.string(),
    projectSize: z.string().nullable()
});

export type NewAnalyseDataSchema = z.infer<typeof newAnalyseDataSchema>; 