'use strict'
const express       = require('express')
const path          = require('path')
const dbLib         = require('./servidor/db.js')
const productesLib  = require('./servidor/productes.js')
const usuarisLib    = require('./servidor/usuaris.js')
const utilsLib      = require('./servidor/utils.js')

var app = express()
var port = process.env.PORT || 3002
var db = new dbLib()
var productes = new productesLib()
var usuaris = new usuarisLib()
var utils = new utilsLib()

// Funcions per iniciar el servidor i les rutes
// ------------------------------------------------------------------------

// Iniciem objectes
db.init()
productes.init()
usuaris.init()
utils.init()

// Rutes per fer consultes AJAX
app.use('/call', cridaAJAX)

// Rutes estàtiques per servir arxius
app.use('/web', express.static(path.join(__dirname + '/web/')))
app.use('/favicon.ico', (crida, resposta) => { resposta.sendFile(path.join(__dirname + '/web/appicons/favicon.ico')) })
app.use('/', (crida, resposta) => { resposta.sendFile(path.join(__dirname + '/web/index.html')) })

// Posar el servidor en funcionament
app.listen(port, () => console.log('App listening on port:', port, '\nNavigate to: http://localhost:' + port))


// Funcions personalitzades
// ------------------------------------------------------------------------

async function cridaAJAX (crida, resposta) {
    let url = crida.url,
        objRebut = null

    // Agafa les dades que ens han enviat des de la web
    try {
        objRebut = await utils.promiseGetPostData(crida)
    } catch (e) {
        console.error(e)
        return
    }

    // Crida a la funció que cal segons la crida que s'ha fet de de la web
    switch (url) {
    case '/usuariLogin':        usuaris.login(db, utils, objRebut, resposta); break;
    case '/llistatUsuaris':     usuaris.llistat(db, utils, objRebut, resposta); break;
    case '/usuariGuarda':       usuaris.guarda(db, utils, objRebut, resposta); break;
    case '/usuariEsborra':      usuaris.esborra(db, utils, objRebut, resposta); break;
    case '/llistatProductes':   productes.llistat(db, utils, objRebut, resposta); break;
    // TODO: A les crides de gestió de productes caldrà passar 'usuaris' com a paràmetre, per veure si té permisos d'administració
    default: resposta.json({ resultat: "ko", missatge: "Crida desconeguda" })
    }
}







