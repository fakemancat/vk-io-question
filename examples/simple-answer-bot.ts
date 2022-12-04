import { VK, MessageContext } from 'vk-io';
import { QuestionManager, QuestionMessageContext } from '../';

const vk = new VK({
    token: process.env.TOKEN!
});

const questionManager = new QuestionManager();

vk.updates.use(questionManager.middleware);

type Context = MessageContext & QuestionMessageContext;

vk.updates.on('message', async (context: Context) => {
    const answer = await context.question('Привет, как твоё имя?');

    if (!answer.text) {
        return context.send('Пожалуйста, ответь текстом');
    }

    return context.send(`Приятно познакомиться, ${answer.text}!`);
});

vk.updates.start().then(() => {
    console.log('Bot started');
});