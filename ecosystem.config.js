module.exports = {
  apps: [
    {
      name: 'ai-warroom',
      script: 'dist/node/server.js',
      watch: ['dist'],
      ignore_watch: ['node_modules', 'src'],
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        OPENROUTER_API_KEY: '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',
        AGENT_CONFIG_DIR: './agent-config'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        OPENROUTER_API_KEY: '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',
        AGENT_CONFIG_DIR: './agent-config'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: 'logs/output.log',
      error_file: 'logs/error.log'
    }
  ]
}; 