class ObjLogin {

    constructor () {
    }

    // Retorna le dades de l'usuari logat
    llegeixDadesUsuari () {
        let usuari = {
            correu: localStorage.getItem('correu'),
            nom:    localStorage.getItem('nom'),
            token:  localStorage.getItem('token'),
            tipus:  localStorage.getItem('tipus')
        }

        if (usuari.correu === null) {
            // Si no tenim informació d'usuari tornem 'null'
            return null
        } else {
            // Si tenim informació d'usuari, la retornem
            return usuari
        }
    }

    // Aquesta funció crida al servidor per identificar a l'usuari fent servir el token
    async autenticaAmbToken () {
        let usuari = this.llegeixDadesUsuari(),
            objEnviament = {
                correu: usuari ? usuari.correu : null,
                codi:    '',
                token:  usuari ? usuari.token : null
            },
            objRebut = {}

        // Intentem logar a l'usuari amb les dades del 'localStorage'
        try {
            objRebut = await promiseCallServer('POST', '/call/usuariLogin', objEnviament)
            this.autenticaAmbElServidor(objRebut)
        } catch (e) {
            console.error(e)
        }
    }

    // Aquesta funció crida al servidor per identificar a l'usuari fent servir el formulari
    async autenticaAmbFormulari () {
        let refCarrega = document.getElementById('loginLoading'),
            refError = document.getElementById('loginError'),
            refMail = document.getElementById('loginCorreu'),
            refCodi = document.getElementById('loginCodi'),
            objEnviament = {
                correu: refMail.value,
                codi:   refCodi.value,
                token:  ''
            },
            objRebut = {}

        refCarrega.style.display = 'flex'

        // Intentem logar l'usuari amb les dades del formulari
        try {
            objRebut = await promiseCallServer('POST', '/call/usuariLogin', objEnviament)        
        } catch (e) {
            console.error(e)
        }

        refCarrega.style.display = 'none'
        if (objRebut.resultat === 'ok') {
            // Si hem pogut fer login, guardem la informació i amaguem el popup de login (també borrem els valors)
            this.autenticaAmbElServidor(objRebut)
            popups.amagalsTots()
            refMail.value = ''
            refCodi.value = ''
        } else {
            // Mostrem l'error per consola
            console.error(objRebut)

            // Si no hem pogut fer login, mostrem l'error una estona i borrem el valor de la contrasenya
            refError.style.display = 'flex'
            await promiseWait(1500)
            refCodi.value = ''
            refError.style.display = 'none'
        }
    }

    // Actualitza la informació del localStorage segons l'objecte rebut del servidor al fer login
    autenticaAmbElServidor (objRebut) {

        if (objRebut.resultat === 'ok') {

            // Guarda les dades de l'usuari a localStorage
            localStorage.setItem("correu",  objRebut.missatge.correu)
            localStorage.setItem("nom",     objRebut.missatge.nom)
            localStorage.setItem("token",   objRebut.missatge.token)
            localStorage.setItem("tipus",   objRebut.missatge.tipus)

            // Amaga el botó de logar-se del menú i mostra els botons de backoffice
            document.getElementById('botoLoginWeb').style.display = 'none'
            document.getElementById('botoGestioUsuarisWeb').style.display = 'flex'
            document.getElementById('botoGestioProductesWeb').style.display = 'flex'
            document.getElementById('botoLogoutWeb').style.display = 'flex'
            document.getElementById('botoLoginMobil').style.display = 'none'
            document.getElementById('botoGestioUsuarisMobil').style.display = 'flex'
            document.getElementById('botoGestioProductesMobil').style.display = 'flex'
            document.getElementById('botoLogoutMobil').style.display = 'flex'
        } else {
            this.tancaLaSessio()
        }
    }

    tancaLaSessio () {

        // Neteja les dades del localStorage perquè ja no són vàlides
        localStorage.clear()

        // Mostra el botó de logar-se al menú i amaga els botons de backoffice
        document.getElementById('botoLoginWeb').style.display = 'flex'
        document.getElementById('botoGestioUsuarisWeb').style.display = 'none'
        document.getElementById('botoGestioProductesWeb').style.display = 'none'
        document.getElementById('botoLogoutWeb').style.display = 'none'
        document.getElementById('botoLoginMobil').style.display = 'flex'
        document.getElementById('botoGestioUsuarisMobil').style.display = 'none'
        document.getElementById('botoGestioProductesMobil').style.display = 'none'
        document.getElementById('botoLogoutMobil').style.display = 'none'
    }
}
