import dotenv from 'dotenv';
import jwt, { JsonWebTokenError, NotBeforeError, SignOptions, TokenExpiredError } from 'jsonwebtoken';
import { JWT_ACCESS_TOKEN_EXPIRES_IN } from '../constants/auth.constants';
import { JWT_REFRESH_TOKEN_EXPIRES_IN } from '../constants/auth.constants';
import { string } from 'zod';
dotenv.config();
export interface TokenPlayload  {
    id: string
}
/**
 * A function to generate the access token
 * @throws {error} if an issue occurs during the token creation process or if the secret is falsy or the options are incorrects
*/
export const generateAccessToken = (playload: string): string => {
    const options: SignOptions = {expiresIn: '15m'};
    return jwt.sign({id:playload}, process.env.JWT_ACCESS_TOKEN_SECRET! as string, {expiresIn: '15m'});
}

/**
 * A function to generate the refresh token
 * @throws {error} if any error happens during the refresh token generation
*/
export const generateRefreshToken = (playload: string): string => {
    const options: SignOptions = {expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN || '15m'};
    return jwt.sign({id: playload}, process.env.JWT_REFRESH_TOKEN_SECRET! as string, options);
}

/**
 * A functtion to verify the accessToken
 * @throws {TokenExpiredError} if the token reached  its expiration date 
 * @throws {JsonWebTokenError} if the signature is invalid
 * @throws {NotBeforeError} Thrown if current time is before the nbf claim
*/
export const verifyAccessToken = (token: string): string => {
    const decoded =  jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET!) as {id: string};
    return decoded.id;
}

/**
 * A functtion to verify the refreshToken
 * @throws {TokenExpiredError} if the token reached  its expiration date 
 * @throws {JsonWebTokenError} if the signature is invalid
 * @throws {NotBeforeError} Thrown if current time is before the nbf claim
*/
export const verifyRefreshToken = (token: string): string => {
    const decoded =  jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET!) as {id: string}
    return decoded.id;
}