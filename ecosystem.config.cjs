module.exports = {
  apps: [
    {
      name: 'bnnews-backend',
      cwd: './backend',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_file: './backend/.env',
    },
    {
      name: 'bnnews-frontend',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'bnnews-rss-worker',
      cwd: './backend',
      script: 'node',
      args: '-e "import(\'./dist/workers/rssWorker.js\').then(m => m.startRssCronScheduler())"',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
      env_file: './backend/.env',
    },
  ],
};
