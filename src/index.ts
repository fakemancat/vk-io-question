// За правильность иерархии не ручаюсь :)

import { Middleware, NextMiddleware } from 'middleware-io';

import { Answer } from './structures';
import { IQuestion, IQuestionParams, IQuestionMessageContext } from './interfaces';

class QuestionManager {
    private questions: Map<number, IQuestion> = new Map();

    get [Symbol.toStringTag](): string {
        return this.constructor.name;
    }

    /**
     * Middleware-функция - является основным функционалом.
     */
    get middleware(): Middleware<IQuestionMessageContext> {
        return async (context: IQuestionMessageContext, next: NextMiddleware)=> {
            if (!context.is('message')) {
                await next();

                return;
            }

            const currentQuestion = this.questions.get(context.senderId);

            if (currentQuestion) {
                currentQuestion.resolve(
                    new Answer({
                        text: context.text,
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
            context.question = async (message: string, params?: IQuestionParams) => {
                if (!message) {
                    throw new TypeError(
                        'Parameter `message` is required'
                    );
                }

                await context.send(message, params);

                return new Promise((resolve) => {
                    const userId = params && params.targetUserId
                        ? params.targetUserId
                        : context.senderId;

                    this.questions.set(userId, {
                        resolve,
                        startTime: Date.now()
                    });
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