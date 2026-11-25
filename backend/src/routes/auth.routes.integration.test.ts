console.log("DATABASE_URL pendant les tests:", process.env.DATABASE_URL);
import { describe, it, expect, afterAll, beforeAll} from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../configs/db';
import { hashData } from '../utils/hash';
import { UserRepository } from '../repositories/auth.repositories';
const useRepository = new UserRepository();

describe('Authentification routes', () => {

    beforeAll(async () => {
        await prisma.$queryRaw`SELECT 1`;
    }, 30000); // 30 secondes, seulement pour le réveil initial

    afterAll(async () => {
        await prisma.user.deleteMany() // Clean the data base after the tests
        console.log("every thing is released");
        await prisma.$disconnect();
        console.log("Disconnected");
    });

    it('GET /api/auth/session should create a new guest user to the first contact', async () => {
        const agent = request.agent(app);

        const response = await agent.get('/api/auth/session').set('User-Agent', 'Vitest-Test-Agent');
        expect(response.status).toBe(201);
        expect(response.headers['set-cookie']).toBeDefined();
    }, 15000);

    it('GET /api/auth/session should send all guest session data when the guest comes back on the site ', async ()  => {
        const agent = request.agent(app);
        const firstResponse  = await agent.get('/api/auth/session').set('User-Agent', 'Vitest-Test-Agent');
        const response = await agent.get('/api/auth/session').set('User-Agent', 'Vitest-Test-Agent');
        expect(response.status).toBe(200);
        expect(response.headers['set-cookie']).toBeDefined();
    },15000);

    it('POST /api/auth/register should create a new user with email/password', async () => {
        
        const agent = request.agent(app); // Save cookies either queries, like a browser
        const sessionResponse = await agent.get('/api/auth/session').set('User-Agent', 'Vitest-Test-Agent'); // Create a guest acount
        const guestSessionId = sessionResponse.body.userId
        const response = await agent.post('/api/auth/register').send({
            email: 'styvedjombissi@gmail.com',
            name: 'Styve Djombissi',
            password: 'myPassword123$',
            level: 'beginner',
            knownTechnologies: ['JavaScript', 'TypeScript']
        }).set('User-Agent', 'Vitest-Test-Agent');
        console.log(response.body);
        console.log(response.status)
        expect(response.status).toBe(201);
        expect(response.body.data.id).toBe(guestSessionId);
        expect(response.headers['set-cookie']).toBeDefined();
    }, 30000);

    it('POST /api/auth/register should return 400 if the email or the password is malformed', async () => {
        
        const agent = request.agent(app); // Save cookies either queries, like a browser
        await agent.get('/api/auth/session').set('User-Agent', 'Vitest-Test-Agent'); // Create a guest acount
        const response = await agent.post('/api/auth/register').send({
            email: '7456985236',
            name: 'Styve Djombissi',
            password: 'myPassword123$',
            level: 'beginner',
            knownTechnologies: ['JavaScript', 'TypeScript']
        }).set('User-Agent', 'Vitest-Test-Agent');
        expect(response.status).toBe(400);
    }, 30000);

    it('POST /api/auth/register should return 401 if email already exists', async () => {
        await prisma.user.create({
            data: {email: "test@example.com", passwordHash: 'myOtherPassword123$', sessionId: crypto.randomUUID()}
        });

        const agent = await request.agent(app); // Save cookies either queries, like a browser
        await agent.get('/api/auth/session').set('User-Agent', 'Vitest-Test-Agent'); // Create a guest acount
        const response = await agent.post('/api/auth/register').send({
            email: 'test@example.com',
            name: 'Styve Djombissi',
            password: 'myPassword123$',
            level: 'beginner',
            knownTechnologies: ['JavaScript', 'TypeScript']
        }).set('User-Agent', 'Vitest-Test-Agent');
        expect(response.status).toBe(401);
    }, 30000);

    it('POST /api/auth/register should return 404 if user\'s data are not found', async () => {
        const agent = request.agent(app); // Save cookies either queries, like a browser

        await agent.get('/api/auth/session').set('User-Agent', 'Vitest-Test-Agent'); // Create a guest acount
        const response = await agent.post('/api/auth/register').send({
            email: 'styvedjombissi@gmail.com',
            name: 'Styve Djombissi',
            password: 'myPassword123$',
            level: 'beginner',
            knownTechnologies: ['JavaScript', 'TypeScript']
        }).set('User-Agent', 'Vitest-Test-Agent');
        expect(response.status).not.toBe(404);
    }, 30000);

    it('POST /api/auth/login should not identify a non registrated user', async () => {
        const agent = request.agent(app); // Save cookies either queries, like a browser

        await agent.get('/api/auth/session').set('User-Agent', 'Vitest-Test-Agent'); // Create a guest acount
        const response = await agent.post('/api/auth/register').send({
            email: 'test@example.com',
            password: 'myPassword123$'
        }).set('User-Agent', 'Vitest-Test-Agent');
        expect(response.status).toBe(400);
    }, 15000);

    it('POST /api/auth/login should authenticate an existing user', async () => {
        const hashedPassword = await hashData("myPassword123$");
        const existingUser = await prisma.user.create({
            data: {email: "test4@example.com", passwordHash: hashedPassword, sessionId: crypto.randomUUID()}
        });

        const agent = request.agent(app);
        const guestSession = await agent.get('/api/auth/session').set('User-Agent', 'Vitest-Test-Agent');
        const response = await agent.post('/api/auth/login').send({
            email: 'test4@example.com',
            password: 'myPassword123$'
        }).set('User-Agent', 'Vitest-Test-Agent');

        expect(response.status).toBe(200);
        expect(response.headers['set-cookie']).toBeDefined();
        expect(existingUser.id).not.toBe(guestSession.body.userId);

        const refreshToken = await prisma.refreshToken.findFirst({
            where: {userId: existingUser.id, revoked: false},
            orderBy: {createdAt: 'desc'}
        });
        expect(refreshToken).not.toBeNull();
    }, 15000);


    
});