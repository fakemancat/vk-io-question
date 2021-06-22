import { VK } from 'vk-io';
import { QuestionManager, IQuestionMessageContext } from 'vk-io-question';

const vk = new VK({
    token: process.env.TOKEN
});

const questionManager = new QuestionManager();

vk.updates.use(questionManager.middleware);

vk.updates.on<IQuestionMessageContext>('message', async (context) => {
    const answer = await context.question('Привет, как твоё имя?');

    while (!answer.text) {
        return context.send('Пожалуйста, ответь текстом');
    }

    return context.send(`Приятно познакомиться, ${answer.text}!`)
});

vk.updates.start().then(() => {
    console.log('Bot started');
});