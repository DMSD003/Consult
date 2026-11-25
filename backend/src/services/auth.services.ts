import { UserRepository } from '../repositories/auth.repositories'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { RegistrationSchema, LoginSchema } from '../zod.schemas/auth.shemas';
import { hashData,  verifyHash } from '../utils/hash';

/**
 * Handle the User authentification service
*/
export class AuthService {
    private userRepository = new UserRepository();

    async sendOrCreateSession(userAgent: string ,sessionId?: string) {
        let userIdEl; 
        if(sessionId) {
            let existingSession;

            try {
                existingSession = await this.userRepository.checkSession(sessionId);
                userIdEl = existingSession?.id;
            } catch (error) {
                console.error("An Error occured during the verificatio of the session:", error);
                throw new Error("Cannot verify the session for the moment!");
            }
            if (existingSession) {
                let sessionData;
                if (!userIdEl) {
                    throw new Error("The session is Invalid");
                }
                try{
                    sessionData = await this.userRepository.sendSessionData(sessionId);
                    await this.userRepository.revokeAllRefreshToken(userIdEl)
                } catch(error) {
                    console.error("Error while obtaining related seession data: ", error);
                    throw new Error("Error while obtaining related seession data");
                }
                const newAccessToken = generateAccessToken(userIdEl);
                const newRefreshToken = generateRefreshToken(userIdEl);
                const expirationDate = new Date(Date.now() +30*24*60*60*1000);
                await this.userRepository.storeRefreshToken(userIdEl, newRefreshToken, userAgent, expirationDate);
                return {isNewSession: false as const, sessionData, newAccessToken, newRefreshToken, sessionId, userIdEl}; // tagged union or discrimated union with the discriminant isNewSession
            } else {
                throw new Error(`No existing session for that sessionId: ${sessionId}`);
            }
        }

        const newSessionId = crypto.randomUUID();
        const userData = await this.userRepository.createnewUser(newSessionId);
        const userId = userData.id;
        const { name, level, language, theme, email} = userData;
        const data =  {name, level, language, theme, email};
        const accessToken = generateAccessToken(userId);
        const refreshToken = generateRefreshToken(userId);
        const expirationDate = new Date(Date.now() + 30*24*60*60*1000);
        await this.userRepository.storeRefreshToken(userId, refreshToken, userAgent, expirationDate);
        return {isNewSession: true as const, newSessionId, accessToken, refreshToken, data, userId};
    };

    async register(userAgent: string , refreshToken: string, userId: string, sessionId: string, data: RegistrationSchema) {
        try {   
            const {email, name, password, level, knownTechnologies} = data;
            const passwordHash = await hashData(password);
            const {user, knownTechnology} = await this.userRepository.updateUser(name, email, passwordHash, level, knownTechnologies, userId, sessionId);
            const {name: userName, level: userLevel, email: userEmail, theme, language, id} = user;
            const newAccessToken = generateAccessToken(user.id);
            const newRefreshToken = generateRefreshToken(user.id);
            const expirationDate = new Date(Date.now() +30*7*24*60*60*1000);
            await this.userRepository.updateRefreshTokenDuringRegistration(userAgent, userId, refreshToken, newRefreshToken, expirationDate);
            return {userName, userLevel, userEmail, theme, language, id, knownTechnology, newRefreshToken, newAccessToken};
        } catch(error) {
            console.error("REGISTRATION ERROR: ", error);
            if(error instanceof Error) {
                throw new Error(error.message);
            }
        }
    };

    async login(data: LoginSchema, userId: string, refreshToken: string, userAgent: string){
        const {email, password} = data;
        const existingUser = await this.userRepository.checkCredentials(email);
        if (!existingUser.passwordHash) {
            throw new Error("INVALID CREDENTIALS");
        }

        const isMatch = await verifyHash(existingUser.passwordHash, password);
        if (!isMatch) {
            throw new Error("INVALID CREDENTIALS");
        }
                        
        const newAccessToken = generateAccessToken(existingUser.id);
        const newRefreshToken = generateRefreshToken(existingUser.id);
        const expirationDate = new Date(Date.now() +30*24*60*60*1000);
        await this.userRepository.updateRefreshTokenDuringRegistration(userAgent, existingUser.id, refreshToken, newRefreshToken, expirationDate);
        const result = await this.userRepository.sendUserData(email, existingUser.id);
        return {newAccessToken, newRefreshToken, result};
        
    };
    // A modifier lorsque j'aurai l'information sur le type du refreshToken
    // lorsque le cookie responsable a expiré
    refreshSessionService = async (refreshToken: string , userId: string, userAgent: string) => {
        const tokenUserId = verifyRefreshToken(refreshToken);
        if (tokenUserId !== userId) {
            throw new Error("INVALID TOKEN");
        }

        const existingToken = await this.userRepository.checkTokenInDb(refreshToken, userId);

        if(!existingToken) {
            throw new Error("INVALID TOKEN");
        }

        if(existingToken.revoked) {
            await this.userRepository.revokeAllRefreshToken(userId);
            throw new Error("COMPROMISED SESSION")
        }

        if(existingToken.expirationDate < new Date()) {
            throw new Error("TOKEN EXPIRED")
        }
                
        const expirationDate = new Date(Date.now() +30*24*60*60*1000);
        const newRefreshToken = generateRefreshToken(userId);
        const newAccessToken = generateAccessToken(userId);
        await this.userRepository.updateRefreshTokenDuringRegistration(userAgent, userId, refreshToken, newRefreshToken, expirationDate);
        return { newAccessToken, newRefreshToken};
        
    }
}