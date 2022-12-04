/* eslint-disable no-unused-vars */
import { Params, MessageContext } from 'vk-io';

export interface Question {
    resolve: (context: MessageContext) => void;
    startTime: number;
}

export interface QuestionManagerParams {
    /**
     * Ограничение на время ответа. Задаётся в ms
     */
    answerTimeLimit?: number;
}

export interface QuestionParams extends Params.MessagesSendParams {
    /**
     * Айди пользователя, от которого модуль будет ждать ответ
     * @default context.senderId
     */
    targetUserId?: number;

    /**
     * Ограничение на время ответа. Задаётся в ms
     */
    answerTimeLimit?: number;

    [key: string]: any;
}

export interface QuestionMessageContext {
    /**
     * @param message Текст вопроса
     * @param params Параметры отправляемого сообщения
     */
    question: (message: string, params?: QuestionParams) => Promise<MessageContext>;
}
