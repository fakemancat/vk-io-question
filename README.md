# VK-IO-QUESTION
### Описание
Небольшой модуль для системы "Вопрос-Ответ".
Интегрируется в цепь *middleware*  vk-io

[![npm package](https://nodei.co/npm/vk-io-question.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/vk-io-question/)
<p>
<a href="https://www.npmjs.com/package/vk-io-question"><img src="https://img.shields.io/npm/v/vk-io-question.svg" alt="Version"></a>
<a href="https://www.npmjs.com/package/vk-io-question"><img src="https://img.shields.io/npm/dt/vk-io-question.svg" alt="Downloads"></a>
</p>

### Установка
**npm**
```bash
npm i -S vk-io-question
```

**yarn**
```bash
yarn add vk-io-question
```

### Использование
JavaScript

```js
const { VK } = require('vk-io');
const vk = new VK({
    token: process.env.TOKEN
});

const { QuestionManager } = require('vk-io-question');
const questionManager = new QuestionManager();

vk.updates.use(questionManager.middleware);

vk.updates.hear('/reg', async (context) => {
    const answer = await context.question(
        'Согласны-ли Вы на обработку персональных данных?'
    );

    if (!/да|yes|согласен|конечно/i.test(answer.text)) {
        await context.send('Тогда, мы не можем совершить регистрацию');

        return;
    }

    await context.send('Отлично, тогда продолжим');

    const age = await context.question('Введите Ваш возраст');
    const email = await context.question('Введите Ваш имейл');
    const phone = await context.question('Введите Ваш номер телефона');

    await context.send(
        `Возраст: ${age.text}\nЭл. адрес: ${email.text}\nТелефон: ${phone.text}`
    );
});

vk.updates.startPolling();
```

TypeScript
```ts
import { VK } from 'vk-io';
const vk = new VK({
    token: process.env.TOKEN
});

import {
    QuestionManager,
    IQuestionMessageContext
} from 'vk-io-question';

const questionManager = new QuestionManager();

vk.updates.use(questionManager.middleware);

/**
 * Для получения подсказок обязательно нужно присвоить
 * Интерфейс IQuestionMessageContext данному контексту
 */
vk.updates.hear('/reg', async (context: IQuestionMessageContext) => {
    const answer = await context.question(
        'Согласны-ли Вы на обработку персональных данных?'
    );

    if (!/да|yes|согласен|конечно/i.test(answer.text)) {
        await context.send('Тогда, мы не можем совершить регистрацию');

        return;
    }

    await context.send('Отлично, тогда продолжим');

    const age = await context.question('Введите Ваш возраст');
    const email = await context.question('Введите Ваш имейл');
    const phone = await context.question('Введите Ваш номер телефона');

    await context.send(
        `Возраст: ${age.text}\nЭл. адрес: ${email.text}\nТелефон: ${phone.text}`
    );
});

vk.updates.startPolling();
```

Параметры конструктора
|Параметр|Тип|Обязатален|Описание|
|-|-|-|-|
|answerTimeLimit|number (ms)|Нет|Устанавливает ограничение по времени на ответ. В случае истечения этого времени, в объекте Answer все поля будут ```null```|

----
Метод отправки вопроса

```js
const answer = await context.question(message, params);
```

|Параметр|Тип|Описание|
|-|-|-|
|message|string|Задаваемый вопрос|
|params|Object|Параметры ссобщения|

Ответ

|Параметр|Тип|Описание|
|-|-|-|
|answer|Promise\<Answer\>|Основной объект ответа|
|answer.text|string|Текст сообщения|
|answer.payload|*|payload ответного сообщения (полезно при использовании клавиатуры)|
|answer.duration|number|Время ответа в ms|
|answer.forwards|MessageForwardsCollection[]|Пересланные сообщения|
|answer.attachments|Attachment[]|Вложения ответного сообщения|

### Специальные возможности
* targetUserId - задаёт вопрос определённому пользователю

**Примеры**

Смоделируем ситуцию: в беседе между людьми идёт игра (викторина), и боту нужно задать вопрос одного человека другому

```js
vk.updates.hear('/задать вопрос', async (context) => {
    const questionToUser = await context.question(
        'Напишите свой вопрос следующим сообщением'
    );

    const recipient = await context.question(
        'Теперь отправьте ссылку пользователя, кому нужно задать вопрос'
    );

    const user = await vk.snippets.resolveResource(recipient.text);

    const userAnswer = await context.question(
        `@id${user.id}, Вам вопрос: ${questionToUser.text}\n\nОтвет дайте следующим сообщением`,
        {
            targetUserId: user.id
        }
    );

    await context.send(`Итак, Ваш ответ: ${userAnswer.text}`);

    /*
     * Тут сами придумываете логику, это был лишь грубый и наглядный пример
     */
});
```

Проще говоря, бот будет ждать ответа именно от пользователя, айди которого был указан в ```targetUserId```.

По умолчанию вопрос задаётся отправителю сообщения (```context.senderId```)

------------
Ещё можно сделать что-то типа анонимных сообщений с получением реакции:
```js
vk.updates.hear(/^(?:\/anon)\s*(?<text>.*)/i, async (context) => {
    let { text } = context.$match.groups;

    if (!text) {
        text = (await context.question(
            'Напишите текст анонимного сообщения'
        )).text;
    }

    const recipient = await context.question(
        'Теперь отправьте ссылку пользователя, кому нужно отправить анонимное сообщение'
    );

    const user = await vk.snippets.resolveResource(recipient.text);

    const userAnswer = await context.question(
        `Вам анонимное сообщение:\n\n${text}`,
        {
            user_id: user.id, // Отправить сообщение в ЛС этому пользователю
            targetUserId: user.id // Ожидать ответ от него же
        }
    );

    await context.send(
        `@id${user.id} ответил "${userAnswer.text}"`
    );
});
```
* Получение payload

**Примеры**

Давайте на команду ```/choice``` давать пользователю выбор из двух цветов, по нажатию на любую из которых, он получит факт о выбранном цвете

```js
const { Keyboard } = require('vk-io');

vk.updates.hear('/choice', async (context) => {
    const answer = await context.question(
        'Зелёный или синий?',
        {
            keyboard: Keyboard.keyboard([
                [
                    Keyboard.textButton({
                        label: 'Зелёный',
                        color: 'positive',
                        payload: {
                            choice: 'green'
                        }
                    }),
                    Keyboard.textButton({
                        label: 'Синий',
                        color: 'positive',
                        payload: {
                            choice: 'blue'
                        }
                    })
                ]
            ]).oneTime()
        }
    );

    if (!answer.payload) {
        await context.send('Отвечать нужно было нажатием на кнопку');

        return;
    }

    if (answer.payload.choice === 'green') {
        await context.send('Человеский глаз наиболее хорошо различает оттенки именно зеленого цвета.');

        return;
    }

    if (answer.payload.choice === 'blue') {
        await context.send('Синий краситель долгое время был одним из самых дорогих, потому что его изготавливали из лазурита.');

        return;
    }
});
```

* attachments

**Примеры**

Мы можем получать в ответ любое вложение. Например давайте сделаем функцию обработки фотографии:

```js
vk.updates.hear('/обработка фото', async (context) => {
    const answer = await context.question(
        'Отправьте фото, которое хотите обработать'
    );

    const filter = await context.question(
        'Теперь название фильтра *список доступных фильтров*'
    );

    const newPhoto = await myAwesomeFunction(
        answer.attachments[0].largePhoto, filter
    );

    await context.sendPhoto(newPhoto, {
        message: 'Вот твоя новая фотография!'
    });
});
```

Такая же история работает и с ```Answer.forwards```
