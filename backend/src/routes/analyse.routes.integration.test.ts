import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../configs/db';
import { hashData } from '../utils/hash';

describe('Analyses routes', () => {

    afterAll( async() => {
        await prisma.conversation.deleteMany();
        await prisma.$disconnect();
        console.log("Disconnected");
    });

    it('POST /api/process/analyse should send 202 when a new conversation and new analyse is created and validated ', async () => {
    
        const agent = request.agent(app);
        await agent.get('/api/auth/session').set('User-Agent', 'Vitest-Test-Agent'); 
        const response = await agent.post('/api/process/analyse').send({
            title: "Consult",
            description: "Solution pour la la recommandation des stacks techniques en fonction de tous les paramètres de l'utilisateur et du projet",
            sector: "web app",
            projectSize: "3000"
        });
        expect(response.status).toBe(202);
    }, 30000);

    
})