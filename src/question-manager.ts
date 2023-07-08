/* eslint-disable no-undef */
import { MessageContext } from 'vk-io';
import { Middleware, NextMiddleware } from 'middleware-io';

import {
    Question,
    QuestionParams,
    QuestionMessageContext,
    QuestionManagerParams
} from './interfaces';
import { TimeoutError } from './errors';

class QuestionManager {
    private questions: Map<number, Question> = new Map();
    private timeouts: Map<number, NodeJS.Timeout> = new Map();
    private readonly answerTimeLimit: number = 0;

    get [Symbol.toStringTag](): string {
        return this.constructor.name;
    }

    public constructor(params?: QuestionManagerParams) {
        this.answerTimeLimit = params?.answerTimeLimit || 0;
    }

    /**
     * @param message  Отправляемое сообщение (вопрос)
     * @param params Параметры сообщения
     */
    private question(context: MessageContext) {
        return async (
            message: string,
            params: QuestionParams = {}
        ): Promise<MessageContext> => {
            if (!message) {
                throw new ReferenceError(
                    'Parameter `message` is not defined'
                );
            }
    
            await context.send(message, params);

            const userId = params.targetUserId ?? context.senderId;
            const answerTimeLimit = params.answerTimeLimit ?? this.answerTimeLimit;
            
            return new Promise((resolve, reject) => {
                this.questions.set(userId, {
                    resolve,
                    startTime: Date.now()
                });
                
                answerTimeLimit > 0 && this.createTimeout(() => {
                    reject(
                        new TimeoutError('Answer timed out')
                    );
                }, answerTimeLimit, userId);
            });
        }
    }

    private clearTimeout(userId: number): void {
        const currentTimeout = this.timeouts.get(userId);

        if (currentTimeout) {
            clearTimeout(currentTimeout);
            this.timeouts.delete(userId);
        }
    }

    private createTimeout(fn: () => void, ms: number, userId: number): void {
        this.clearTimeout(userId);

        const timeout = setTimeout(fn, ms);
        this.timeouts.set(userId, timeout);
    }

    /**
     * Middleware-функция - является основным функционалом.
     */
    public get middleware(): Middleware<MessageContext & QuestionMessageContext> {
        return async (
            context: MessageContext & QuestionMessageContext,
            next: NextMiddleware
        ) => {
            if (!context.is(['message'])) {
                return next();
            }

            const currentQuestion = this.questions.get(context.senderId);

            if (currentQuestion) {
                currentQuestion.resolve(context);
                this.questions.delete(context.senderId);
                return this.clearTimeout(context.senderId);
            }
            
            context.question = this.question(context);

            return next();
        };
    }
}

export { QuestionManager };
export default QuestionManager;
