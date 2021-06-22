import { VK } from 'vk-io';
import { random } from 'lodash/random';
import { HearManager } from '@vk-io/hear';
import { QuestionManager, IQuestionMessageContext } from 'vk-io-question';

const vk = new VK({
    token: process.env.TOKEN
});

const questionManager = new QuestionManager();
const hearManager = new HearManager<IQuestionMessageContext>();

vk.updates.use(questionManager.middleware);
vk.updates.on('message', hearManager.middleware);

hearManager.hear('пример', async (context) => {
    const a = random(0, 100);
    const b = random(0, 100);
    const result = (a + b).toString();

    const answer = await context.question(
        `Решите пример: ${a} + ${b} = ?\n\nУ Вас есть 7 секунд.`, {
            answerTimeLimit: 7_000
        }
    );

    if (answer.isTimeout) {
        return context.send('Вы не успели ответить :(');
    }

    else if (answer.text && answer.text === result) {
        return context.send('Вы решили пример верно!');
    }

    else if (answer.text && answer.text !== result) {
        return context.send('Вы решили пример неверно!');
    }

    else if (!answer.text) {
        return context.send('Ответить нужно было текстом');
    }
});

vk.updates.start().then(() => {
    console.log('Bot started');
});