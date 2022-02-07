declare export class Interpreter {
  value: any;
  constructor(code: string);
  appendCode(code: string): void;
  run(): void;
}
