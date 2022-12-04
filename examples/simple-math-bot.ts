import { VK, MessageContext } from 'vk-io';
import { HearManager } from '@vk-io/hear';
import { QuestionManager, QuestionMessageContext, TimeoutError } from '../';

const vk = new VK({
    token: process.env.TOKEN!
});

const questionManager = new QuestionManager();
const hearManager = new HearManager();

vk.updates.use(questionManager.middleware);
vk.updates.on('message', hearManager.middleware);

type Context = MessageContext & QuestionMessageContext;

hearManager.hear('пример', async (context: Context) => {
    const a = Math.round(Math.random() * 100);
    const b = Math.round(Math.random() * 100);
    const result = (a + b).toString();

    const answer = await context.question(
        `Решите пример: ${a} + ${b} = ?\n\nУ Вас есть 7 секунд.`, {
            answerTimeLimit: 7_000
        }
    ).catch((error) => {
        if (error instanceof TimeoutError) {
            console.error('Превышено время ожидания ответа');
            return null;
        }

        console.error(error);
        return null;
    });

    /**
     * Пользователь не успел ответить
     * или возникла другая ошибка
     */
    if (answer === null) {
        return context.send('Вы не успели ответить :(');
    }

    if (!answer.text) {
        return context.send('Ответить нужно было текстом');
    }

    const solved = answer.text === result;

    return context.send(
        `Вы решили пример ${!solved ? 'не' : ''}верно`
    );
});

vk.updates.start().then(() => {
    console.log('Bot started');
});