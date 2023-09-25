export interface BaseContext {
  InitialContext: any;
}

export class Context<T extends BaseContext> {
  private context;
  private idProp;

  get jobIdProp() {
    return this.idProp;
  }

  public constructor(idProp: string, initialContext?: T['InitialContext']) {
    this.context = {
      initialContext,
    };
    this.idProp = idProp;
  }

  public getInitialContext(): T['InitialContext'] {
    return this.context.initialContext;
  }

  public addToContext<Key extends keyof T>(key: Key, value: T[Key]) {
    this.context = {
      ...this.context,
      [key]: value,
    };
  }

  public getContextByKey<Key extends keyof T>(key: Key): T[Key] {
    return this.context[key];
  }

  public static GenerateContext<T extends BaseContext>(
    jobIdProp,
    context: Context<T>,
  ): Context<T> {
    const newContext = new Context<T>(jobIdProp);
    newContext.context = context.context;
    return newContext;
  }
}
