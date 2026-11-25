import { AnalyseService } from "../services/analyse.service";
import { Request, Response } from 'express';
import { NewAnalyseDataSchema } from '../zod.schemas/analyse.schema';

export class AnalyseController {
    private analyseService = new AnalyseService();

    newConversation = async (req: Request, res: Response) => {

        const data: NewAnalyseDataSchema = req.body;
        const userId: string = req.userId;

        console.log("Données venant de l'utilisateur: ," ,data, userId);
        
        try{
            const newCreationResult = await this.analyseService.createNewConversation(data, userId);
            console.log(newCreationResult);
            return res.status(202).json({analyseId: newCreationResult.analyseId, conversationId: newCreationResult.conversationId});
        } catch(error) {
            console.error(error);
            return res.status(500).json({message: error});
        }
    }
}