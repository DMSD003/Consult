import  { prisma } from '../configs/db';
import { hashToken } from '../utils/hash';

export class UserRepository {

    checkSession = async (sessionId: string) => {
        
        const user = await prisma.user.findUnique({
            where: {sessionId: sessionId}
        });

        return user;
    };

    sendSessionData = async (sessionId: string) => {
        const data = await prisma.user.findUnique({
            where: {sessionId: sessionId},
            include: {
                conversations: {
                    take: 10,
                    orderBy: {updatedAt: 'desc'}
                },
                favorites: {include: { bric: true}},
                knownTechnologies: {include: {bric: true}},
                feedBacks: true
            }
        });
        return data;
    };

    createnewUser = async (sessionId: string) => {
        const userId = await prisma.user.create({
            data: {sessionId: sessionId}
        });
        return userId;
    };

    storeRefreshToken = async (userId: string, tokenHash: string, userAgent: string, expirationDate: Date) => {
        return prisma.refreshToken.create({
            data: {userId, tokenHash: hashToken(tokenHash), userAgent, expirationDate}
        });
    };


    updateUser = async(name: string, email: string, passwordHash: string, level: string, knownTechnologies: string[], userId: string, sessionId: string) => {
        const sessionUser = await prisma.user.findFirst({
            where: {id: userId, sessionId}
        });
        if (!sessionUser) {
            throw new Error("INVALID_SESSION");
        }

        const existingUser = await prisma.user.findUnique({
            where: {email: email}
        });
        if (existingUser && existingUser.id !== userId) {
            throw new Error("EMAIL_ALREADY_EXISTS");
        }
        const bricRecords = await prisma.bric.findMany({
            where: {name: {in: knownTechnologies}},
            select: {id: true, name: true},
        });

        const foundNames = bricRecords.map(bric => bric.name);
        const unknownNames = knownTechnologies.filter(name => !foundNames.includes(name));
        if(unknownNames.length > 0) {
            console.error("New technologies to add: ", unknownNames)
            //throw new Error("UNKNOWN TECHNOLOGY(IES) :"); I should add the tehnos that my system doesn't know to the db
        }

        const [user, knownTechnology] = await prisma.$transaction([
            prisma.user.update({
                where: {id: userId},
                data: {
                    email: email,
                    passwordHash: passwordHash,
                    name: name,
                    level: level,
                    isGuest: false,
                },
            }),
            prisma.knownTechnology.createMany({
                data: bricRecords.map((bric) => ({
                    userId,
                    bricId: bric.id
                })),
            }),
        ]);

        return {user, knownTechnology};
    };

    updateRefreshTokenDuringRegistration = async (userAgent: string, userId: string, refreshToken: string, newRefreshToken: string, expirationDate: Date) => {
        const [token, tokenEl] = await prisma.$transaction([

            // Revoke the old refreshToken
            prisma.refreshToken.updateMany({
                where: {tokenHash: hashToken(refreshToken)},
                data: {
                    revoked: true,
                },
            }),

            // Create a new one
            prisma.refreshToken.create({
                data: {userId: userId, tokenHash: hashToken(newRefreshToken), userAgent: userAgent, expirationDate: expirationDate}
            })
        ]);
    };

    checkCredentials = async (email: string) =>{
        const existingUser = await prisma.user.findUnique({
            where: {email}
        });

        if (!existingUser || !existingUser.passwordHash) {
            throw new Error("INVALID CREDENTIALS")
        }
         return existingUser;
    };

    sendUserData = async (email: string, userId: string) => {
        const data = await prisma.user.findUnique({
            where: {email: email, id: userId},
            omit: {passwordHash: true, id: true, createdAt: true, updatedAt: true},
            include: {
                conversations: {
                    orderBy: {updatedAt: 'desc'}
                },
                favorites: {include: { bric: true}},
                knownTechnologies: {include: {bric: true}},
                feedBacks: true
            }
        });

        return data;
    };

    revokeAllRefreshToken = async (userId: string) => {
        return prisma.refreshToken.updateMany({
            where: {revoked: false, userId: userId},
            data: {revoked: true}
        });
    };

    checkTokenInDb = async (refreshToken: string, userId: string) => {
        return prisma.refreshToken.findFirst({
            where: {tokenHash: hashToken(refreshToken), userId: userId}
        });
    }

}