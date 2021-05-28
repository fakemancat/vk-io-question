import { Params } from 'vk-io';

export interface IQuestionParams extends Params.MessagesSendParams {
    /**
     * Айди пользователя, которому нужно задать вопрос
     * @default context.senderId
     */
    targetUserId?: number;
}