import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ChatHistory, ChatHistorySchema} from './chat-history.schema';

@Module({
    imports: [MongooseModule.forFeature([{name: ChatHistory.name, schema: ChatHistorySchema}])],
    exports: [MongooseModule],
})
export class ChatHistoryModule {
}
