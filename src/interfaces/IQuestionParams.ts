import { MessagesSendParams } from 'vk-io';

export interface IQuestionParams extends MessagesSendParams {
    /**
     * Айди пользователя, которому нужно задать вопрос
     * @default context.senderId
     */
    targetUserId: number;
}