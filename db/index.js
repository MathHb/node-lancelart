const {Pool, client} = require('pg');
const pool = new Pool({
  user: 'postgres',
  localhost: 'postgres',
  database: 'Lancelart',
  password: 'theba',
  port: 5432,
})

module.exports = {
  query: (text, params, callback) => pool.query(text, params, callback)
}
