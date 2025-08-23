module.exports = {
  apps: [
    {
      name: "employee_portal_nextjs",
      cwd: "/var/www/html/employee_portal_nextjs/employee_portal_nextjs",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3013",
      env: { NODE_ENV: "production" },
    },
  ],
};
