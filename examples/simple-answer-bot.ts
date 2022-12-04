import { VK, MessageContext } from 'vk-io';
import { QuestionManager } from '../';

const vk = new VK({
    token: process.env.TOKEN
});

const questionManager = new QuestionManager();

vk.updates.use<MessageContext>(questionManager.middleware);

vk.updates.on('message', async (context) => {
    const answer = await context.question('Привет, как твоё имя?');

    while (!answer.text) {
        return context.send('Пожалуйста, ответь текстом');
    }

    return context.send(`Приятно познакомиться, ${answer.text}!`);
});

vk.updates.start().then(() => {
    console.log('Bot started');
});