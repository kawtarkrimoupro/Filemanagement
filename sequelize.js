const Sequelize = require("sequelize");
const config = require("./config/config.json");
const LogsModel = require('./models/logs.js')

const db_conf = config.database_settings;

const sequelize = new Sequelize(
  db_conf.dbName,
  db_conf.username,
  db_conf.password, {
      host:db_conf.host,
      dialect: db_conf.dialect
  }
);

const Logs = LogsModel(sequelize, Sequelize);

sequelize.sync().then(() => {
    console.log("database created")
})

module.exports = Logs;