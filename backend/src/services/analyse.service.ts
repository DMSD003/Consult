import { AnalyseRepository } from '../repositories/analyse.repository';
import { NewAnalyseDataSchema } from '../zod.schemas/analyse.schema';
export interface newAnalyseData {
    title: string | null;
    description: string;
    sector: string;
    projectSize: string | null;
}

export class AnalyseService {
    private analyseRepository = new AnalyseRepository();

    createNewConversation = async (data: NewAnalyseDataSchema, userId: string) => {

       try {
        const result = await this.analyseRepository.createNewConversation(data, userId);

        return {analyseId: result.analyseId, conversationId: result.conversationId};
       } catch (error) {
        console.error('Error while creating new conversation and new analysis', error);
        throw Error(String(error));
       }
    } 
}