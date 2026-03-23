module.exports = {
  apps: [{
    name: 'school-dashboard',
    script: './backend/server.js',
    cwd: '/var/www/school-dashboard',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      DB_PATH: '/var/www/school-dashboard/backend/school_dashboard.db',
    },
    restart_delay: 3000,
    max_restarts: 10,
    watch: false,
  }],
};
