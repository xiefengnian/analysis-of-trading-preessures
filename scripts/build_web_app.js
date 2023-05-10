const { spawn, spawnSync } = require('child_process');

const { join } = require('path');

const DIR = join(__dirname, '../web');

const _ = spawn('npm', ['run', 'build'], {
  cwd: DIR,
});

_.stdout.pipe(process.stdout);
_.stderr.pipe(process.stderr);

_.on('exit', (code) => {
  if (code === 0) {
    const __ = spawn('cp', ['-r', './dist/', '../public/web'], {
      cwd: DIR,
    });

    __.stdout.pipe(process.stdout);
    __.stderr.pipe(process.stderr);

    __.on('exit', (code) => {
      if (code === 0) {
        console.log('build success');
      }
    });
  }
});
