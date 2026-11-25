import  { AuthService }  from '../services/auth.services';
import {Request, Response, CookieOptions} from 'express';

/**
 * Handle the authentification of the user, his sessions
*/
export class AuthController {
    private authService = new AuthService(); // because it would be non sense to do new AuthController.authService

    private cookieOptions = (maxAge?: number): CookieOptions => ({
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.COOKIE_CROSS_SITE === 'true' ? 'none' : 'lax',
        ...(maxAge ? {maxAge} : {})
    });

    /**
     * Send the session Id to the service,
     * Send back cookies to the client when the user is new on the site
     * send all session data to the client when the user already has a sessoni
     *
    */
    createOrSendSession =  async (req: Request, res: Response) => {
        try {
            const userAgent = req.get('User-Agent');
            const sessionId = req.validatedCookies?.sessionId; // From the Zod validation of the sessionId cookie
            let result;
            if(typeof userAgent === "string") {
               result = await this.authService.sendOrCreateSession(userAgent, sessionId);
               // If it is the first session of the user
                if(result.isNewSession) {
                    res.cookie('sessionId', result.newSessionId, this.cookieOptions());
                    res.cookie('accessToken', result.accessToken, this.cookieOptions(15*60*1000));
                    res.cookie('refreshToken', result.refreshToken, this.cookieOptions(30*24*60*60*1000));
                    return res.status(201).json({data: result.data, userId: result.userId});
                } else {
                    // If there is already a session, the controller send all user data
            
                    res.cookie('sessionId', result.sessionId, this.cookieOptions())
                    res.cookie('accessToken', result.accessToken, this.cookieOptions(15*60*1000));
                    res.cookie('refreshToken', result.refreshToken, this.cookieOptions(30*24*60*60*1000));
                    return res.status(200).json({data: result.sessionData, userId: result.userIdEl});
                }
            } else {
                return res.status(400).json({ error: "Missing User-Agent header or invalid" });
            }
        } catch (error) {
            // In case of an error while interacting with the Data base to 
            console.error("ERROR IN THE CHECKING SESSION SERVICE: ", error);
            return res.status(500).json({error: "An error occured or cannot verify the session"});
        }
    };

    register = async (req: Request, res: Response) => {
        try {
            const userAgent = req.get('User-Agent');
            if (typeof userAgent !== "string") {
                throw new Error("USER AGENT HAS'NT THE CORRECT TYPE");
            }
            const refreshToken: string = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({error: "REFRESH_TOKEN_MISSING"});
            }
            const userId = req.userId;
            const sessionId = req.cookies.sessionId;
            const result = await this.authService.register(userAgent, refreshToken, userId, sessionId, req.body)
            if (typeof result === 'undefined') {
                return res.status(404).json({error: 'No result'});
            }
            res.cookie('accessToken', result.newAccessToken, this.cookieOptions(15*60*1000));
            res.cookie('refreshToken', result.newRefreshToken, this.cookieOptions(30*24*60*60*1000));
            const {userName, userEmail, userLevel, theme, language, id, knownTechnology} = result;
            return res.status(201).json({data: {userName, userEmail, userLevel, theme, language, id, knownTechnology}});
        } catch (error) {
            if(error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS"){
                return res.status(401).json({error: "INCORRECT EMAIL OR PASSWORD"})
            }
            if(error instanceof Error && error.message === "INVALID_SESSION"){
                return res.status(401).json({error: "INVALID_SESSION"});
            }
            console.error("SOME THING WENT WRONG WITH THE REGISTRATION SERVICE: ", error);
            return res.status(500).json({error: "Internal server error"});
        }
    };

    login = async (req: Request, res: Response) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({error: "REFRESH_TOKEN_MISSING"});
            }
            const userAgent = req.get('User-Agent');
            if (typeof userAgent !== "string") {
                throw new Error("USER AGENT HAS'NT THE CORRECT TYPE");
            }
            const result = await this.authService.login(req.body, req.userId, refreshToken, userAgent);
            if (!result) {
                return res.status(404).json({error: 'No result'});
            }
            res.cookie('accessToken', result.newAccessToken, this.cookieOptions(15*60*1000));
            res.cookie('refreshToken', result.newRefreshToken, this.cookieOptions(30*24*60*60*1000));
            return res.status(200).json({message: "User found successfully", data: result.result})
        } catch (error) {

            if (error instanceof Error && error.message === "INVALID CREDENTIALS") {
                console.error("INVALID CREDENTIALS ERROR :", error);
                return res.status(400).json({error: "INVALID_CREDENTIALS"});
            }
            console.error("SOME THING WENT WRONG WITH THE LOGIN SERVICE :", error);
            return res.status(500).json({error: "Somethig went wrong during the login process"});
        }
    };
    
    refesh = async (req: Request, res: Response) => {

        try {

            const refreshToken = req.cookies?.refreshToken;
            const userAgent = req.get('User-Agent');
            if (typeof userAgent !== "string") {
                throw new Error("USER AGENT HAS'NT THE CORRECT TYPE");
            }
            if (!refreshToken) {
                return res.status(401).json({error: "Token is missing"});
            }

            const result = await this.authService.refreshSessionService(refreshToken, req.userId, userAgent);
            res.cookie('refreshToken', result.newRefreshToken, this.cookieOptions(30*24*60*60*1000));
            res.cookie('accessToken', result.newAccessToken, this.cookieOptions(15*60*1000));

            return res.status(200).json({message: "RENEWED SESSION"});

        } catch (error) {

            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return res.status(401).json({error: "INVALID SESSION, RECONNECT"});
        
        }
    };  
}