import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt';


/**
 * Validate req.body against the given Zod schema.
 * Returns a 400 response with a nested error structure if validation fails.
 * replaces the req.body with the parsed data
 * 
*/
export const  validateCookies = <T extends { sessionId?: string | undefined }>(schema: z.ZodType<T>) => {
    return (req: Request, res: Response, next: NextFunction) => {

        const result = schema.safeParse(req.cookies);
        // If the schema is incorrect, treeifyError converts a Zod validation error into tree-shaped (nested) structure that mirrors the shape of the schema
        if(!result.success) {
            return res.status(400).json({error: z.treeifyError(result.error)});
        }
        req.validatedCookies = result.data;
        next();

    };
};

export const validateRegistrationInfo = (schema: z.ZodType) => {
    return (req: Request, res: Response, next: NextFunction) =>{
        const result = schema.safeParse(req.body);

        if(!result.success) {
            return res.status(400).json({error: z.treeifyError(result.error)});
        }
        req.body = result.data;
        next();
    }
};

export const validateLoginInfo = (schema: z.ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body); 

        if(!result.success) {
            return res.status(400).json({error: z.treeifyError(result.error)});
        }

        req.body = result.data;
        next();
    }
}

/**
 * A function to authenticate a user based on the access token. Sets req.userId to the decoded value of the token.
 * @returns <import("express").Response - when the token is expired or missing.
*/
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    
    const token: string = req.cookies.accessToken; // Extract the token
    if(!token){
        return res.status(401).json({error: "UNAUTHORIZED.MALFORMED TOKEN OR NOT PROVIDED"});
    }

    // Extract the payload of the token that contains the user's informations.
    // In the try/catch statement because the verication process might throw some errors.
    try {
        req.userId = verifyAccessToken(token);
        return next();
    } catch (error) {
        console.error("Authentification middleware error: ", error);
        return res.status(401).json({error: "TOKEN EXPIRED"})
    }
   
};

export const authenticateRefresh = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        return res.status(401).json({error: "REFRESH_TOKEN_MISSING"});
    }

    try {
        req.userId = verifyRefreshToken(token);
        return next();
    } catch (error) {
        console.error("Refresh authentification middleware error: ", error);
        return res.status(401).json({error: "INVALID_REFRESH_TOKEN"});
    }
};