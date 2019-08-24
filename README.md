# VK-IO-QUESTION
### Описание
Небольшой модуль для системы "Вопрос-Ответ".
Интегрируется в цепь *middleware*  vk-io

[![npm package](https://nodei.co/npm/vk-io-question.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/vk-io-questioni/)
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
```js
const { VK } = require('vk-io');
const vk = new VK({
    token: process.env.TOKEN
});

const QuestionManager = require('vk-io-question');
const questionManager = new QuestionManager();

vk.updates.use(questionManager.middleware);

vk.updates.hear('/reg', async(context) => {
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