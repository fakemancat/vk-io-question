/**
 * Данный пример показывает, что метод question
 * возвращает MessageContext. Это значит, что у него
 * есть стандартные методы MessageContext
 * В том числе getAttachments или getAllAttachments
 */

import { VK, MessageContext } from 'vk-io';
import { QuestionManager, QuestionMessageContext } from '../';

const vk = new VK({
    token: process.env.TOKEN!
});

const questionManager = new QuestionManager();

vk.updates.use(questionManager.middleware);

type Context = MessageContext & QuestionMessageContext;

vk.updates.on('message', async (context: Context) => {
    const answer = await context.question('Привет, пришли мне фото!');

    // Взять только первое фото
    const [photo] = answer.getAttachments('photo');

    if (!photo) {
        return context.send('В сообщении не найдено фото');
    }

    const photoUrl = photo.largeSizeUrl;

    return context.send(`Прямая ссылка на фото: ${photoUrl}`);
});

vk.updates.start().then(() => {
    console.log('Bot started');
});