/* eslint-disable no-unused-vars */
import { Params, MessageContext } from 'vk-io';

import { Answer } from '../structures';

export interface IQuestion {
    resolve: (value?: any) => void;
    startTime: number;
}

export interface IQuestionManagerParams {
    /**
     * Ограничение на время ответа. Задаётся в ms
     */
    answerTimeLimit?: number;
}

export interface IQuestionParams extends Params.MessagesSendParams {
    /**
     * Айди пользователя, которому нужно задать вопрос
     * @default context.senderId
     */
    targetUserId?: number;

    /**
     * Ограничение на время ответа. Задаётся в ms
     */
    answerTimeLimit?: number;

    [key: string]: any;
}

export interface IQuestionMessageContext extends MessageContext {
    /**
     * @param message Текст вопроса
     * @param params Параметры отправляемого сообщения
     */
    question: (message: string, params?: IQuestionParams) => Promise<Answer>;
}
