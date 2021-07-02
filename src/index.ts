/* eslint-disable no-undef */
import { Middleware, NextMiddleware } from 'middleware-io';

import { Answer } from './structures';
import { 
    IQuestion,
    IQuestionParams,
    IQuestionMessageContext,
    IQuestionManagerParams
} from './interfaces';

class QuestionManager {
    private questions: Map<number, IQuestion> = new Map();
    private timeouts: Map<number, NodeJS.Timeout> = new Map();
    private answerTimeLimit = 0;

    get [Symbol.toStringTag](): string {
        return this.constructor.name;
    }

    public constructor(params?: IQuestionManagerParams) {
        this.answerTimeLimit = params?.answerTimeLimit || 0;
    }

    /**
     * Middleware-функция - является основным функционалом.
     */
    get middleware(): Middleware<IQuestionMessageContext> {
        return async (context: IQuestionMessageContext, next: NextMiddleware)=> {
            if (!context.is(['message'])) {
                await next();

                return;
            }

            const currentQuestion = this.questions.get(context.senderId);

            if (currentQuestion) {
                currentQuestion.resolve(
                    new Answer({
                        text: context.text || null,
                        forwards: context.forwards,
                        payload: context.messagePayload,
                        attachments: context.attachments,
                        duration: Date.now() - currentQuestion.startTime
                    })
                );

                return this.questions.delete(context.senderId);
            }

            /**
             * @param message  Отправляемое сообщение (вопрос)
             * @param params Параметры сообщения
             */
            context.question = async (message: string, params: IQuestionParams = {}) => {
                if (!message) {
                    throw new TypeError(
                        'Parameter `message` is required'
                    );
                }

                await context.send(message, params);

                return new Promise((resolve) => {
                    const userId = params?.targetUserId ?? context.senderId;

                    this.questions.set(userId, {
                        resolve,
                        startTime: Date.now()
                    });

                    const answerTimeLimit = params.answerTimeLimit ?? this.answerTimeLimit;

                    const currentTimeout = this.timeouts.get(context.senderId);
                    if (currentTimeout) clearTimeout(currentTimeout);

                    if (answerTimeLimit > 0) {
                        this.timeouts.set(
                            context.senderId,
                            setTimeout(() => {
                                const currentQuestion = this.questions.get(context.senderId);
    
                                if (currentQuestion) {
                                    resolve(
                                        new Answer({
                                            text: null,
                                            forwards: null,
                                            payload: null,
                                            attachments: null,
                                            duration: Date.now() - currentQuestion.startTime,
                                            isTimeout: true
                                        })
                                    );
    
                                    return this.questions.delete(context.senderId);
                                }

                                this.timeouts.delete(context.senderId);
                            }, answerTimeLimit)
                        );
                    }
                });
            };

            await next();
        };
    }
}

export * from './interfaces';
export * from './structures';
export { QuestionManager };

export default QuestionManager;