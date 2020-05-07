import { MessageContext } from 'vk-io';

import { Answer } from '../structures';
import { IQuestionParams } from './';

export interface IQuestionMessageContext extends MessageContext {
    /**
     * @param message Текст вопроса
     * @param params Параметры отправляемого сообщения
     */
    question: (message: string, params?: IQuestionParams) => Promise<Answer>;
}