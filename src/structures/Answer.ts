import { Attachment, ExternalAttachment } from 'vk-io';
import MessageForward from 'vk-io/lib/structures/shared/message-forward';

export class Answer {
    /**
     * Текст ответного сообщения
     */
    public text: string | null;
    /**
     * Коллекция пересланных сообщений ответного сообщения
     */
    public forwards: MessageForward[];
    public payload: any;
    /**
     * Коллекция вложения ответного сообщениыя
     */
    public attachments: (Attachment<{}> | ExternalAttachment<{}>)[];
    /**
     * Время, спустя которое пользователь дал ответ
     */
    public duration: number;

    constructor({
        text,
        forwards,
        payload,
        attachments,
        duration
    }: {
        text: string | null,
        forwards: MessageForward[],
        payload: any,
        attachments: (Attachment<{}> | ExternalAttachment<{}>)[],
        duration: number
    }) {
        this.text = text;
        this.forwards = forwards;
        this.payload = payload;
        this.attachments = attachments;
        this.duration = duration;
    }

    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }
}