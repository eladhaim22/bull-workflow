import { Injectable } from '@nestjs/common';

import { Context } from './engine/context';
import { StepType, WorkflowStep } from './engine/workflow-step';
import { BasicContext } from './workflow.service';

@Injectable()
export class Step1 extends WorkflowStep<BasicContext> {
  name = 'Step1';
  type = StepType.SYNC;
  async run(context: Context<BasicContext>) {
    console.log('Step1');
    context.addToContext('step1', 'step1-context');
  }
}
