const {Pool, client} = require('pg');
const pool = new Pool({
  user: 'postgres',
  localhost: 'postgres',
  database: 'usuario',
  password: 'theba',
  port: 5432,
})

module.exports = {
  query: (text, params, callback) => pool.query(text, params, callback)
}
