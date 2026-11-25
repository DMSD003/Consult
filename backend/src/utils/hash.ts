import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

const SALT = 12;

/**
 * A function to hash passwords
 * @throws {Error} if The promise is rejcted
*/
export const hashData = async (data: string) : Promise<string> => {
    return bcrypt.hash(data, SALT );
}

/**
 * A function to verify the hashed data
 * @throws {Error} if the promise is rejected
*/
export const verifyHash = async (hash: string,data: string): Promise<boolean> => {
    return bcrypt.compare(data, hash);
}

export const hashToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};