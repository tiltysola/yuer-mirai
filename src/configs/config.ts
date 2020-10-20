const config = {
  host: 'yuer.acgme.cn',
  http_port: 3001,
  ws_port: 3001,
  use_nginx: true, // 如果使用了nginx转发，这里设置 True
  nginx_port: 80,
  db_engine: 'mongo', // MongoDB only!!!
  db_info: {
    host: 'localhost',
    port: '27017'
  }
}

export default config