import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { get } from 'lodash';

import { BaseContext, Context } from './context';
import { StepType, WorkflowStep } from './workflow-step';

export enum JobStatus {
  WaitingForEvent = 'waitingForEvent',
  ReadyToExecute = 'readyToExecute',
}

export abstract class Workflow<T extends BaseContext> {
  private logger = new Logger(Workflow.name);
  private name: string;
  private idProp: string;
  private steps: WorkflowStep<T>[];

  constructor(
    name: string,
    steps: WorkflowStep<T>[],
    private queue: Queue,
    idProp: string,
  ) {
    this.name = name;
    this.idProp = idProp;
    this.steps = steps;
    this.steps.forEach((step) => {
      step.initialize(this.queue);
    });
    this.initialize(queue);
  }

  initialize(queue: Queue) {
    queue.on('completed', async (job: Job, result) => {
      const { data, stepName } = result;
      await this.afterEachStep(data.context);
      const completedStepIndex = this.steps.findIndex(
        (x) => x.name === stepName,
      );
      if (completedStepIndex === this.steps.length - 1) {
        await this.afterAll(data.context);
        return;
      }

      await this.beforeEachStep(data.context);
      if (this.steps[completedStepIndex + 1].type === StepType.Async) {
        await queue.add(
          this.steps[completedStepIndex + 1].name,
          {
            context: data.context,
            status: JobStatus.WaitingForEvent,
          },
          {
            jobId: get(data.context.context, this.idProp),
            delay: 60 * 1000 * 60 * 24 * 365,
          },
        );
      } else {
        await this.queue.add(this.steps[completedStepIndex + 1].name, {
          context: data.context,
        });
      }
    });
  }

  async execute(initialContext?: T['InitialContext']) {
    const workflowContext = new Context<T>(this.idProp, initialContext);
    await this.beforeAll(workflowContext);
    await this.beforeEachStep(workflowContext);
    await this.queue.add(this.steps[0].name, {
      context: workflowContext,
    });
  }

  async beforeAll(context: Context<T>) {
    // do nothing
  }
  async afterAll(context: Context<T>, error?: any) {
    // do nothing
  }
  async beforeEachStep(context: Context<T>) {
    // do nothing
  }
  async afterEachStep(context: Context<T>, error?: any) {
    // do nothing
  }
}
