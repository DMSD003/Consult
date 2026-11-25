import { z } from 'zod'; // Import the tool of the library zod that builds validationn schemas

const envSchema = z.object({
    DATABASE_URL : z.url(),
    SHADOW_DATABASE_URL : z.url(),
    PRISMA_STREAM_URL : z.url(),
    JWT_ACCESS_TOKEN_SECRET : z.string(),
    JWT_REFRESH_TOKEN_SECRET : z.string(),
    CLIENT_URL : z.url()
})