# VK-IO-QUESTION
### Описание
Небольшой модуль для системы "Вопрос-Ответ".
Интегрируется в цепь *middleware*  vk-io

[![npm package](https://nodei.co/npm/vk-io-question.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/vk-io-question/)
<p>
<a href="https://www.npmjs.com/package/vk-io-question"><img src="https://img.shields.io/npm/v/vk-io-question.svg?style=flat-square" alt="Version"></a>
<a href="https://www.npmjs.com/package/vk-io-question"><img src="https://img.shields.io/npm/dt/vk-io-question.svg?style=flat-square" alt="Downloads"></a>
<a href="https://www.npmjs.com/package/vk-io-question"><img src="https://img.shields.io/node/v/vk-io-question.svg?style=flat-square" alt="Support"></a>
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
const { HearManager } = require('@vk-io/hear');
const { QuestionManager } = require('vk-io-question');

const vk = new VK({
    token: process.env.TOKEN,
    pollingGroupId: process.env.GROUP_ID
});

const questionManager = new QuestionManager();
const hearManager = new HearManager();

vk.updates.use(questionManager.middleware);
vk.updates.on(['message_new'], hearManager.middleware);

hearManager.hear('/reg', async (context) => {
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
import { VK, MessageContext } from 'vk-io';
import { HearManager } from '@vk-io/hear';
import {
    QuestionManager,
    QuestionMessageContext
} from 'vk-io-question';

type Context = MessageContext & QuestionMessageContext;

const vk = new VK({
    token: process.env.TOKEN,
    pollingGroupId: process.env.GROUP_ID
});

const questionManager = new QuestionManager();
const hearManager = new HearManager<Context>();

vk.updates.use(questionManager.middleware);
vk.updates.on(['message_new'], hearManager.middleware);

hearManager.hear('/reg', async (context) => {
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
|answerTimeLimit|number (ms)|Нет|Устанавливает ограничение по времени на ответ. После истечения лимита будет выброшено исключение ```TimeoutError```|

----
Метод отправки вопроса

```js
const answer = await context.question(message, params);
```

|Параметр|Тип|Описание|
|-|-|-|
|message|string|Задаваемый вопрос|
|params|MessagesSendParams|Параметры ссобщения|

В переменной ```answer``` будет MessageContext ответного сообщения

### Специальные возможности

----
##### targetUserId - задаёт вопрос определённому пользователю

Проще говоря, бот будет ждать ответа именно от пользователя, айди которого был указан в ```targetUserId```.

По умолчанию вопрос задаётся отправителю сообщения (```context.senderId```)

----
##### Получение payload

Давайте на команду ```/choice``` давать пользователю выбор из двух цветов, по нажатию на любую из которых, он получит факт о выбранном цвете

```js
const { Keyboard } = require('vk-io');

hearManager.hear('/choice', async (context) => {
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

    if (!answer.messagePayload) {
        return context.send('Отвечать нужно было нажатием на кнопку');
    }

    if (answer.messagePayload.choice === 'green') {
        return context.send('Человеский глаз наиболее хорошо различает оттенки именно зеленого цвета.');
    }

    if (answer.messagePayload.choice === 'blue') {
        return context.send('Синий краситель долгое время был одним из самых дорогих, потому что его изготавливали из лазурита.');
    }
});
```

----

##### attachments, forwards, replyMessage, etc.

Мы можем получать в ответ любое вложение. Например давайте сделаем функцию обработки фотографии:

```js
hearManager.hear('/обработка фото', async (context) => {
    const answer = await context.question(
        'Отправьте фото, которое хотите обработать'
    );

    // Благодаря тому, что в ответе объект MessageContext, мы имеем доступ к его функционалу
    if (!answer.hasAttachments('photo')) {
        return context.send('В ответе должно быть фото');
    }

    const [photo] = answer.getAllAttachments('photo');

    const filter = await context.question(
        'Теперь название фильтра *список доступных фильтров*'
    );

    if (!filter.hasText) {
        return context.send('В ответе должен быть текст');
    }

    const newPhoto = await myAwesomeFunction(
        photo.largeSizeUrl, filter.text
    );

    return context.sendPhotos(newPhoto, {
        message: 'Вот твоя новая фотография!'
    });
});
```

Таким же образом, благодаря MessageContext в ответном объекте у нас есть доступ к таким полям и методам как ```forwards```, ```messagePayload```, ```replyMessage``` и так далее

----

##### answerTimeLimit

Мы можем задавать ограничение по времени на ответ

```js
hearManager.hear('/q', async (context) => {
    const answer = await context.question('Сколько будет 2 + 2?', {
        answerTimeLimit: 5_000 // Ограничение в 5 секунд
    }).catch((error) => {
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

    if (answer.hasText && answer.text === '4') {
        return context.send('Правильно!');
    }

    else {
        return context.send('Oh my... wrong!');
    }
});
```