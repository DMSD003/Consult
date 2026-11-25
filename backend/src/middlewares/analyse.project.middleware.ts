import { z } from  'zod';
import { Request, Response, NextFunction } from 'express';

interface newAnalyseData {
    title: string | null;
    description: string;
    sector: string;
    projectSize: string | null;
}
/**
 * Validatae the req.body of data of new project analye against the given Zod schema.
 * Returns a 400 response with a nested error  structure if validation fails
 * replaces the req.body with the parsed data.
*/
export const validateNewAnalyse = <T extends newAnalyseData >(schema: z.ZodType<T>) => {
    return (req: Request, res: Response, next: NextFunction) => {

        const result = schema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({error: z.treeifyError(result.error)});
        }

        req.body = result.data;
        console.log("VAlidates body for new analysis: ", req.body);
        next();
    }
}