/**
 * Перед своими друзьями-кодерами извиняюь за выпавшие глаза
 * Делал чисто для новичков, которым это будет удобно
 * 
 * Сам лично использую такую систему, потому что ы
 * 
 * P.S. Как серьёзный проект типа "node-vkcoinapi" не задумывается
 */

class QuestionManager {
    /**
     * Непойми зачем конструктор)()(
     */
    constructor() {
        this.questions = {};
    }

    /**
     * Middleware-функция - является основным функционалом.
     * Думаю больше о ней рассказать нечего :)
     */
    get middleware() {
        return async(context, next) => {
            if (!context.is('message')) return next();

            const currentQuestion = this.questions[context.senderId];

            if (currentQuestion) {
                currentQuestion.resolve({
                    text: context.text,
                    payload: context.messagePayload,
                    time: Date.now() - currentQuestion.startTime
                });

                delete this.questions[context.senderId];
                return next();
            }

            /**
             * @param {string} message Отправляемое сообщение (вопрос)
             * @param {Object} [params] Параметры сообщения
             */
            context.question = async(message, params = {}) => {
                if (!message) {
                    throw new ReferenceError(
                        'Parameter `message` is required'
                    );
                }

                context.send(message, params);

                return new Promise((resolve) => {
                    this.questions[context.senderId] = {
                        resolve,
                        startTime: Date.now()
                    };
                });
            };
            
            next();
        };
    }
}

module.exports = QuestionManager;