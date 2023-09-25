import { InjectQueue, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { BaseContext } from './engine/context';
import { Workflow } from './engine/workflow';
import { Step1 } from './step1';
import { Step2 } from './step2';

export interface BasicContext extends BaseContext {
  step1: string;
  step2: string;
}

@Injectable()
@Processor('workflow')
export class BasicWorkflow extends Workflow<BasicContext> {
  constructor(
    @InjectQueue('workflow') queue: Queue,
    step1: Step1,
    step2: Step2,
  ) {
    super('basic', [step1, step2], queue, 'initialContext.run_id');
  }
}
