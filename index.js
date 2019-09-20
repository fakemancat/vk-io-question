/**
 * Перед своими друзьями-кодерами извиняюь за выпавшие глаза
 * Делал чисто для новичков, которым это будет удобно
 * 
 * Сам лично использую такую систему, потому что ы
 * 
 * P.S. Как серьёзный проект типа "node-vkcoinapi" не задумывается
 */

class Answer {
    constructor({
        text,
        payload,
        forwards,
        duration,
        attachments,
    }) {
        this.text = text;
        this.payload = payload;
        this.forwards = forwards;
        this.duration = duration;
        this.attachments = attachments;
    }

    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }
}

class QuestionManager {
    /**
     * Непойми зачем конструктор)()(
     */
    constructor() {
        this.questions = new Map();
    }

    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }

    /**
     * Middleware-функция - является основным функционалом.
     * Думаю больше о ней рассказать нечего :)
     */
    get middleware() {
        return async(context, next) => {
            if (!context.is('message')) {
                await next();

                return;
            }

            if (this.questions.has(context.senderId)) {
                const currentQuestion = this.questions.get(context.senderId);

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
             * @param {string} message  Отправляемое сообщение (вопрос)
             * @param {Object} [params] Параметры сообщения
             */
            context.question = async(message, params = {}) => {
                if (!message) {
                    throw new TypeError(
                        'Parameter `message` is required'
                    );
                }

                await context.send(message, params);

                return new Promise((resolve) => {
                    const userId = params.targetUserId || context.senderId;

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

module.exports = QuestionManager;