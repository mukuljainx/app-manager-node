declare module NodeJS {
  interface Global {
    appRoot: string;
  }
}

declare module 'node-cmd' {
  function run(command: string): NodeJS.Process;
  function runSync(command: string): { err: any; data: any; stderr: any };
}

declare module 'await-handler';
