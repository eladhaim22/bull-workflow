import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { Step1 } from './step1';
import { Step2 } from './step2';
import { BasicWorkflow } from './workflow.service';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'workflow',
    }),
  ],
  controllers: [AppController],
  providers: [BasicWorkflow, Step1, Step2],
})
export class AppModule {}
