import {
    Attachment,
    ExternalAttachment,
    MessageForwardsCollection
} from 'vk-io';

export class Answer {
    /**
     * Текст ответного сообщения
     */
    public text: string | null;
    /**
     * Коллекция пересланных сообщений ответного сообщения
     */
    public forwards: MessageForwardsCollection | null;
    /**
     * MessagePayload ответного сообщения
     */
    public payload: any;
    /**
     * Коллекция вложения ответного сообщениыя
     */
    public attachments: (Attachment<{}> | ExternalAttachment<{}>)[] | null;
    /**
     * Время, спустя которое пользователь дал ответ
     */
    public duration: number;
    /**
     * Время, когда был дан ответ
     */
    public createdAt: number;
    /**
     * Является ли данный ответ, неотвеченным вовремя
     */
    public isTimeout: boolean = false;

    public constructor({
        text,
        forwards,
        payload,
        attachments,
        duration,
        isTimeout
    }: {
        text: string | null,
        forwards: MessageForwardsCollection | null,
        payload: any,
        attachments: (Attachment<{}> | ExternalAttachment<{}>)[] | null,
        duration: number,
        isTimeout?: boolean
    }) {
        this.text = text;
        this.forwards = forwards;
        this.payload = payload;
        this.attachments = attachments;
        this.duration = duration;
        this.createdAt = Date.now();
        this.isTimeout = isTimeout ?? false
    }

    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }
}