'use strict'
var mysql   = require('mysql')

// Crea la base de dades amb:

// sudo mysql
// CREATE DATABASE serverDB DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;
// GRANT ALL ON serverDB.* TO 'user'@'localhost' IDENTIFIED BY '8ase2pwd';
// FLUSH PRIVILEGES;
// exit;

// Per defecte crea una taula 'usuaris' amb un usuari administrador 'admin@admin.com' i codi 'admin'

class Obj {

    // Configura aquí la connexió amb la base de dades
    constructor () {

        this.host           = '109.237.25.44'
        this.port           = 3306
        this.db             = 'serverDB_mcano'
        this.usr            = 'mcano'
        this.pwd            = '8ase2pwd'
        this.pool           = null

        this.logCyan        = '\x1b[36m%s\x1b[0m '
        this.logYellow      = '\x1b[33m%s\x1b[0m '
    }


    // Inicia la connexió amb la base de dades
    init () {
        this.pool  = mysql.createPool({
            connectionLimit : 10,
            host        : this.host,
            port        : this.port,
            user        : this.usr,
            password    : this.pwd,
            database    : this.db
        })

        this.pool.on('connection', (connection) => { connection.query('SET @@session.group_concat_max_len = @@global.max_allowed_packet') })
        console.log('MySQL connected with destination: ' + this.logCyan, this.db)
    }

    // Tanca la connexió amb la base de dades
    end () {
        this.pool.end()
    }

    // Fer una consulta a la base de dades
    query (queryStr, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                return callback(err)
            } else {
                return connection.query(queryStr, (err, rst) => {
                    connection.release()
                    return callback(err, rst)
                })
            }
        })
    }

    // Fer una consulta a la base de dades amb 'promises'
    promiseQuery (queryStr) {
        return new Promise((resolve, reject) => {
            return this.query(queryStr, (err, rst) => { if (err)  { return reject(err) } else { return resolve(rst) } })
        })
    }

    // Comprova que una taula existeix
    promiseTableExists (table) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.promiseQuery('SELECT * FROM ' + table + ' LIMIT 1')
                return resolve(true)
            } catch (e) {
                return reject(false)
            }
        })
    }
}

// Export
module.exports = Obj

