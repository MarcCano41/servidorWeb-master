'use strict'
const crypto    = require('crypto')

class Obj {

    constructor () {
    }

    // Inicia l'objecte
    init () {
        // TODO
    }

    async login (db, utils, data, result) {

        let sql = '',
            taulaUsuarisExisteix = false,
            correu = utils.preventInjection(data.correu),
            codi = crypto.createHash('md5').update(utils.preventInjection(data.codi)).digest("hex"),
            token = utils.preventInjection(data.token),
            taula = null
    
        // Forçem una espera perquè es vegi la càrrega (TODO: esborrar-ho)
        if (token === '') {
            await utils.promiseWait(1000) 
        }
        
        // Mira si la taula "usuaris" existeix
        try {
            taulaUsuarisExisteix = await db.promiseTableExists('usuaris')
        } catch (e) {
            console.warn('Avis, funció login: la taula "usuaris" no existeix')
        }
    
        // Si la taula "usuaris" no existeix, en crea una i afegeix l'usuari "admin@admin.com" amb codi "admin"
        if (!taulaUsuarisExisteix) {
            try {
                sql = 'CREATE TABLE usuaris (id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, correu VARCHAR(50) NOT NULL, codi VARCHAR(50) NOT NULL, token VARCHAR(50) NOT NULL, nom VARCHAR(50) NOT NULL, tipus VARCHAR(10) NOT NULL, imatge VARCHAR(255))'
                await db.promiseQuery(sql)
                sql = 'INSERT INTO usuaris (correu, codi, token, nom, tipus, imatge) VALUES ("admin@admin.com", "21232f297a57a5a743894a0e4a801fc3", "", "Administrador", "admin", "/web/imatges/usuari-1.png")'
                await db.promiseQuery(sql)
            } catch (e) {
                console.error(e)
                return result.json({ resultat: "ko", missatge: "Error, funcio usuaris.login: no s'ha pogut crear la taula usuaris"})  
            }
        }
    
        // Si l'usuari vol identificar-se fent servir el codi
        if (token === '') {
            // Demana la informació de l'usuari que es vol logar comprovant el codi
            try {
                sql = 'SELECT correu, nom, token, tipus FROM usuaris WHERE correu="' + correu + '" AND codi = "' + codi + '"'
                taula = await db.promiseQuery(sql)
            } catch (e) {
                console.error(e)
                return result.json({ resultat: "ko", missatge: "Error, funcio usuaris.login: ha fallat la comprovació de l'usuari i el codi"})  
            }
            // Si l'usuari existeix i s'ha identificat correctament, li assignem un 'token' aleatori
            if (typeof taula === 'object' && typeof taula.length === 'number' && taula.length === 1) {
                token = crypto.createHash('md5').update("token" + Math.random()).digest("hex")
                try {
                    sql = 'UPDATE usuaris SET token = "' + token + '" WHERE correu="' + correu + '" AND codi = "' + codi + '"'
                    await db.promiseQuery(sql)
                } catch (e) {
                    console.log(e)
                    return result.json({ resultat: "ko", missatge: "Error, funcio usuaris.login: ha fallat al escriure el token a la base de dades"})    
                }
                taula[0].token = token
            }
        } else {
            // Si l'usuari vol identificar-se fent servir el token comprovem que el token és vàlid
            try {
                sql = 'SELECT correu, nom, token, tipus FROM usuaris WHERE correu="' + correu + '" AND token = "' + token + '"'
                taula = await db.promiseQuery(sql)
            } catch (e) {
                console.error(e)
                return result.json({ resultat: "ko", missatge: "Error, funcio usuaris.login: ha fallat al comprovar l'usuari i el token"})  
            }
        }
    
        // Si l'usuari existeix i s'ha identificat correctament (amb codi o amb token) retornem 'ok'
        if (typeof taula === 'object' && typeof taula.length === 'number' && taula.length === 1) {
            result.json({ resultat: "ok", missatge: taula[0] })
        } else {
            result.json({ resultat: "ko", missatge: [] })
        }
    }

    async llistat (db, utils, data, result) {
        let sql = '',
            usuariEsAdmin = false,
            correu = utils.preventInjection(data.correu),
            token = utils.preventInjection(data.token),
            taula = null

        // Forçem una espera perquè es vegi la càrrega (TODO: esborrar-ho)
        await utils.promiseWait(1000) 

        // Mira si l'usuari té permisos d'administració
        try {
            usuariEsAdmin = await this.usuariEsAdmin(db, correu, token)
        } catch (e) {
            console.log(e)
            return result.json({ resultat: "ko", missatge: "Error, funcio usuaris.llistat: hi ha hagut un error al comprovar els permisos de l'usuari"})  

        }

        if (!usuariEsAdmin) {
            return result.json({ resultat: "ko", missatge: "Error, funcio usuaris.llistat: l'usuari no té permisos d'administració"})  
        } else {
            sql = 'SELECT * FROM usuaris'
            taula = await db.promiseQuery(sql)
            return result.json({ resultat: "ok", missatge: taula })  
        }
    }

    async guarda (db, utils, data, result) {
        let sql = '',
            usuariEsAdmin = false,
            correuAdmin = utils.preventInjection(data.correuAdmin),
            tokenAdmin = utils.preventInjection(data.tokenAdmin),
            codi = crypto.createHash('md5').update(utils.preventInjection(data.codi)).digest("hex"),
            taula = [],
            resultatInsert = null,
            insertId = 0,
            pathImatgeComplet = ''

        // Forçem una espera perquè es vegi la càrrega (TODO: esborrar-ho)
        await utils.promiseWait(1000) 

        // Mira si l'usuari té permisos d'administració
        try {
            usuariEsAdmin = await this.usuariEsAdmin(db, correuAdmin, tokenAdmin)
        } catch (e) {
            console.log(e)
            return result.json({ resultat: "ko", missatge: "Error, funcio usuaris.guarda: hi ha hagut un error al comprovar els permisos de l'usuari"})  

        }

        if (!usuariEsAdmin) {
            return result.json({ resultat: "ko", missatge: "Error, funcio usuaris.guarda: l'usuari no té permisos d'administració"})  
        } else {
            // Busquem algun usuari amb aquest correu
            try {
                sql = 'SELECT id FROM usuaris WHERE correu="' + data.correu + '"'
                taula = await db.promiseQuery(sql)
            } catch (e) {
                return result.json({ resultat: "ko", missatge: "Error, funcio usuaris.guarda: hi ha hagut un error al insertar un nou usuari"})  
            }
            // Si hem trobat un usuari amb aquest correu, apuntem l'identificador
            if (taula.length >= 1 && taula[0].tipus === 'admin') {
                data.id = taula[0].id
            }
            // Guardem les dades
            if (data.id === '') {
                // Si no tenim 'id' afegim un nou usuari
                try {
                    sql = 'INSERT INTO usuaris (correu, codi, token, nom, tipus) VALUES ("' + data.correu + '", "' + codi + '", "", "' + data.nom + '", "' + data.tipus + '")'
                    resultatInsert = await db.promiseQuery(sql)
                } catch (e) {
                    return result.json({ resultat: "ko", missatge: "Error, funcio usuaris.guarda: hi ha hagut un error al insertar un nou usuari"})  
                }
                // Si han pujat una imatge, la guardem
                if (data.imatge !== '') {
                    insertId = resultatInsert.insertId
                    // Guardem la imatge en un arxiu
                    try {
                        pathImatgeComplet = await utils.guardaImatge('./web/imatges/usuari-' + insertId, data.imatge)
                    } catch (e) {
                        console.log(e)
                        return result.json({ resultat: "ko", missatge: "Error, funcio usuaris.guarda: hi ha hagut un error al guardar la imatge al insert"})  
                    }
                    // Actualitzem el camp imatge
                    try {
                        sql = 'UPDATE usuaris SET imatge="' + pathImatgeComplet + '" WHERE id=' + insertId
                        await db.promiseQuery(sql)
                    } catch (e) {
                        console.log(e)
                        return result.json({ resultat: "ko", missatge: "Error, funcio usuaris.guarda: hi ha hagut un error al actualitzar el nom de la imatge al insert"})  
                    }
                }
            } else {
                // Si tenim id modifiquem les dades d'aquesta fila
                try {
                    sql = 'UPDATE usuaris SET correu="' + data.correu + '", codi="' + codi + '", nom="' + data.nom + '", tipus="' + data.tipus + '" WHERE id=' + data.id
                    await db.promiseQuery(sql)
                } catch (e) {
                    return result.json({ resultat: "ko", missatge: "Error, funcio usuaris.guarda: hi ha hagut un error al actualitzar l'usuari"})  
                    console.log('update', taula)
                }
                // Si han pujat una imatge, la guardem
                if (data.imatge !== '') {
                    // Guardem la imatge en un arxiu
                    try {
                        pathImatgeComplet = await utils.guardaImatge('./web/imatges/usuari-' + data.id, data.imatge)
                    } catch (e) {
                        console.log(e)
                        return result.json({ resultat: "ko", missatge: "Error, funcio usuaris.guarda: hi ha hagut un error al guardar la imatge al update"})  
                    }
                    // Actualitzem el camp imatge
                    try {
                        sql = 'UPDATE usuaris SET imatge="' + pathImatgeComplet + '" WHERE id=' + data.id
                        await db.promiseQuery(sql)
                    } catch (e) {
                        return result.json({ resultat: "ko", missatge: "Error, funcio usuaris.guarda: hi ha hagut un error al actualitzar el nom de la imatge al update"})  
                    }
                }
            }
            return result.json({ resultat: "ok", missatge: {} })  
        }
    }

    async esborra (db, utils, data, result) {
        let sql = '',
            usuariEsAdmin = false,
            correuAdmin = utils.preventInjection(data.correuAdmin),
            tokenAdmin = utils.preventInjection(data.tokenAdmin),
            taula = []

        // Forçem una espera perquè es vegi la càrrega (TODO: esborrar-ho)
        await utils.promiseWait(1000) 

        // Mira si l'usuari té permisos d'administració
        try {
            usuariEsAdmin = await this.usuariEsAdmin(db, correuAdmin, tokenAdmin)
        } catch (e) {
            console.log(e)
            return result.json({ resultat: "ko", missatge: "Error, funcio usuaris.esborra: hi ha hagut un error al comprovar els permisos de l'usuari"})  

        }

        if (!usuariEsAdmin) {
            return result.json({ resultat: "ko", missatge: "Error, funcio usuaris.esborra: l'usuari no té permisos d'administració"})  
        } else {
            // Busquem algun usuari amb aquest correu
            try {
                sql = 'DELETE FROM usuaris WHERE id="' + data.id + '"'
                taula = await db.promiseQuery(sql)
            } catch (e) {
                return result.json({ resultat: "ko", missatge: "Error, funcio usuaris.esborra: hi ha hagut un error al esborrar l'usuari"})  
            }
            return result.json({ resultat: "ok", missatge: {} })  
        }
    }

    // Retorna 'true' si l'usuari és administrador
    async usuariEsAdmin (db, correu, token) {
        return new Promise(async (resolve, reject) => {
            let sql = '',
                taula = null
            try {
                sql = 'SELECT tipus FROM usuaris WHERE correu="' + correu + '" AND token = "' + token + '"'
                taula = await db.promiseQuery(sql)
                if (taula.length === 1 && taula[0].tipus === 'admin') {
                    return resolve(true)
                } else {
                    return resolve(false)
                }
            } catch (e) {
                return reject(e)
            }
        })
    }
}

// Export
module.exports = Obj

