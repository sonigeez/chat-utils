export interface Tool {
  run(args: any): Promise<string>;
}
