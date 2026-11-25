import { GuestSchema } from "../zod.schemas/auth.shemas";
import { TokenPlayload } from "../utils/jwt";

declare global { 
    namespace Express {
        interface Request {
            validatedCookies?: GuestSchema;
            userId: string;
        }
    }
}

export {} // The file is now treated as a module 