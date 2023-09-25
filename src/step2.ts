import { Injectable } from '@nestjs/common';

import { Context } from './engine/context';
import { StepType, WorkflowStep } from './engine/workflow-step';
import { BasicContext } from './workflow.service';

@Injectable()
export class Step2 extends WorkflowStep<BasicContext> {
  name = 'Step2';
  type = StepType.Async;

  async run(context: Context<BasicContext>) {
    console.log('Step2');
    context.addToContext('step2', 'step2-context');
  }
}
