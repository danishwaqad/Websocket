import {Module} from '@nestjs/common';
import {ChatGateway} from './chatting/chat.gateway';
import {MongooseModule} from '@nestjs/mongoose';
import {ChatHistoryModule} from './chatting/chat-history.module';

@Module({
    imports: [
        MongooseModule.forRoot('mongodb://localhost:27017', {
            dbName: 'chatHist_db',
            family: 4,
        }),
        ChatHistoryModule, // Add this line to import the ChatHistoryModule
    ],
    controllers: [],
    providers: [ChatGateway],
})
export class AppModule {
}
