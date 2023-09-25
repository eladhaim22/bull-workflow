import { Controller, Get, Param, Post } from '@nestjs/common';

import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { WorkflowStep } from './engine/workflow-step';
import { BasicWorkflow } from './workflow.service';

@Controller()
export class AppController {
  constructor(
    private basicWorkflow: BasicWorkflow,
    @InjectQueue('workflow') private queue: Queue,
  ) {}

  @Get()
  async getHello() {
    console.log('getHello');
    await this.basicWorkflow.execute({ run_id: 'test1231232' });
  }

  @Post('test/:id')
  async test(@Param('id') id: string) {
    WorkflowStep.updateStep(this.queue, id);
  }
}
