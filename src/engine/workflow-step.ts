import { Job, Queue } from 'bull';
import { DateTime } from 'luxon';

import { BaseContext, Context } from './context';
import { JobStatus } from './workflow';

export enum StepType {
  SYNC = 'Sync',
  Async = 'Async',
}

export type PickOne<T> = {
  [P in keyof T]: Record<P, T[P]> &
    Partial<Record<Exclude<keyof T, P>, undefined>>;
}[keyof T];

export abstract class WorkflowStep<T extends BaseContext> {
  abstract name: string;
  abstract run(context: Context<T>): Promise<void>;
  abstract type: StepType;

  async initialize(queue: Queue) {
    await queue.process(this.name, async (job: Job) => {
      if (
        !this.type ||
        this.type === StepType.SYNC ||
        job.data.status === JobStatus.ReadyToExecute
      ) {
        const context = Context.GenerateContext<T>(
          job.data.idProp,
          job.data.context,
        );
        await this.run(context);
        return { stepName: this.name, data: job.data };
      } else {
        // @ts-ignore
        // make sure async never runs
        await job.moveToDelayed(DateTime.now().plus({ year: 1 }).toJSDate());
      }
    });
  }

  static async updateStep(queue: Queue, id: string) {
    const delayedJobs = await queue.getJobs(['delayed']);
    const delayedJob = delayedJobs.find((x) => x.opts.jobId === id);
    await delayedJob.update({
      ...delayedJob.data,
      status: JobStatus.ReadyToExecute,
    });
    await delayedJob.promote();
  }
}
