import { spawn } from 'child_process';

interface IHooksProps {
  onData: (data: string) => void;
  onError: (data: string) => void;
  onClose: (data: string) => void;
}

const runCommand = (cmd: string, hooks: IHooksProps) => {
  return new Promise((resolve, reject) => {
    const command = spawn(cmd, {
      shell: true,
    });

    command.stdout.on('data', (data: string) => {
      console.log(`stdout: ${data}`);
      hooks.onData(data);
    });

    command.on('error', (error: any) => {
      console.log(`error: ${error.message}`);
      hooks.onError(error);
      reject(error);
    });

    command.on('close', (code: number) => {
      console.log(`child process exited with code ${code}`);
      if (code === 1) {
        reject(code);
        hooks.onError(`child process exited with code ${code}`);
      } else {
        hooks.onClose(code + '');
        resolve(code);
      }
    });
  });
};

export default runCommand;
