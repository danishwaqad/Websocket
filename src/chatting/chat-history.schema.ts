import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';

export type ChatHistoryDocument = ChatHistory & Document;

@Schema()
export class ChatHistory {
    @Prop()
    sender: string;

    @Prop()
    recipient: string;

    @Prop()
    message: string;

    @Prop({default: Date.now})
    createdAt: Date;
}

export const ChatHistorySchema = SchemaFactory.createForClass(ChatHistory);
