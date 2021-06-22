# VK-IO-QUESTION
### Описание
Небольшой модуль для системы "Вопрос-Ответ".
Интегрируется в цепь *middleware*  vk-io

[![npm package](https://nodei.co/npm/vk-io-question.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/vk-io-question/)
<p>
<a href="https://www.npmjs.com/package/vk-io-question"><img src="https://img.shields.io/npm/v/vk-io-question.svg" alt="Version"></a>
<a href="https://www.npmjs.com/package/vk-io-question"><img src="https://img.shields.io/npm/dt/vk-io-question.svg" alt="Downloads"></a>
<a href="https://www.npmjs.com/package/vk-io-question"><img src="https://img.shields.io/node/v/vk-io-question.svg" alt="Support"></a>
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
vk.updates.on('message', hearManager.middleware);

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
import { VK } from 'vk-io';
import { HearManager } from '@vk-io/hear';
import {
    QuestionManager,
    IQuestionMessageContext
} from 'vk-io-question';

const vk = new VK({
    token: process.env.TOKEN,
    pollingGroupId: process.env.GROUP_ID
});

const questionManager = new QuestionManager();
const hearManager = new HearManager<IQuestionMessageContext>();

vk.updates.use(questionManager.middleware);
vk.updates.on(hearManager.middleware);

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
|answerTimeLimit|number (ms)|Нет|Устанавливает ограничение по времени на ответ. В случае истечения этого времени, в объекте Answer все поля будут ```null```|

----
Метод отправки вопроса

```js
const answer = await context.question(message, params);
```

|Параметр|Тип|Описание|
|-|-|-|
|message|string|Задаваемый вопрос|
|params|MessageContext|Параметры ссобщения|

Ответ

|Параметр|Тип|Описание|
|-|-|-|
|answer|Promise\<Answer\>|Основной объект ответа|
|answer.text|string \| null|Текст сообщения|
|answer.payload|*|payload ответного сообщения (полезно при использовании клавиатуры)|
|answer.duration|number|Время ответа в ms|
|answer.forwards|MessageForwardsCollection[]|Пересланные сообщения|
|answer.attachments|Attachment[]|Вложения ответного сообщения|
|answer.createdAt|number|Время, когда был дан ответ|
|answer.isTimeout|boolean|Является ли данный ответ, неотвеченным вовремя|

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

    if (!answer.payload) {
        return context.send('Отвечать нужно было нажатием на кнопку');
    }

    if (answer.payload.choice === 'green') {
        return context.send('Человеский глаз наиболее хорошо различает оттенки именно зеленого цвета.');
    }

    if (answer.payload.choice === 'blue') {
        return context.send('Синий краситель долгое время был одним из самых дорогих, потому что его изготавливали из лазурита.');
    }
});
```

----

##### attachments

Мы можем получать в ответ любое вложение. Например давайте сделаем функцию обработки фотографии:

```js
hearManager.hear('/обработка фото', async (context) => {
    const answer = await context.question(
        'Отправьте фото, которое хотите обработать'
    );

    const filter = await context.question(
        'Теперь название фильтра *список доступных фильтров*'
    );

    const newPhoto = await myAwesomeFunction(
        answer.attachments[0].largePhoto, filter
    );

    return context.sendPhotos(newPhoto, {
        message: 'Вот твоя новая фотография!'
    });
});
```

Такая же история работает и с ```Answer.forwards```

----

##### answerTimeLimit

Мы можем задавать ограничение по времени на ответ

```js
hearManager.hear('/q', async (context) => {
    const answer = await context.question('Сколько будет 2 + 2?', {
        answerTimeLimit: 5_000 // Ограничение в 5 секунд
    });

    if (answer.isTimeout) {
        return context.send('Вы не успели ответить вовремя');
    }

    else if (answer.text && answer.text === '4') {
        return context.send('Правильно!');
    }

    else {
        return context.send('Oh my... wrong!');
    }
});
```