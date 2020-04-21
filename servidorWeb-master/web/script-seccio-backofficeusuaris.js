class ObjSeccioBackofficeUsuaris {

    constructor () {
        this.codiImatge = ''
    }

    async iniciaSeccio () {
        let refLoading = document.getElementById('backofficeUsuarisLoading'),
            refContinguts = document.getElementById('backofficeUsuarisContinguts'),
            objRebut = null,
            valor = null,
            codiHTML = '',
            cntUsuari = 0,
            usuari = login.llegeixDadesUsuari(),
            objEnviament = {
                correu: usuari ? usuari.correu : null,
                codi:    '',
                token:  usuari ? usuari.token : null
            }

        // Amaguem els continguts actuals i mostrem la càrrega
        refContinguts.style.display = 'none'
        refLoading.style.display = 'flex'

        // Demanem el llistat d'usuaris al servidor
        objRebut = await promiseCallServer('POST', '/call/llistatUsuaris', objEnviament)

        // Transformem l'objecte rebut en codi HTML
        if (objRebut.resultat === 'ok') {
            navegacio.dadesSeccio = objRebut.missatge

            codiHTML = codiHTML + '<table>'
            codiHTML = codiHTML + '<tr>'
            codiHTML = codiHTML + '<td></td>'
            codiHTML = codiHTML + '<td>Id</td>'
            codiHTML = codiHTML + '<td>Correu</td>'
            codiHTML = codiHTML + '<td>Nom</td>'
            codiHTML = codiHTML + '<td>Tipus</td>'
            codiHTML = codiHTML + '<td></td>'
            codiHTML = codiHTML + '</tr>'
            for (cntUsuari = 0; cntUsuari < navegacio.dadesSeccio.length; cntUsuari = cntUsuari + 1) {
                valor = navegacio.dadesSeccio[cntUsuari]
                codiHTML = codiHTML + '<tr>'
                codiHTML = codiHTML + '<td><img src="' + valor.imatge + '" width="50" /></td>'
                codiHTML = codiHTML + '<td>' + valor.id + '</td>'
                codiHTML = codiHTML + '<td>' + valor.correu + '</td>'
                codiHTML = codiHTML + '<td>' + valor.nom + '</td>'
                codiHTML = codiHTML + '<td>' + valor.tipus + '</td>'
                // No deixem editar l'usuari 'admin@admin.com'
                if (valor.correu !== 'admin@admin.com') {
                    codiHTML = codiHTML + '<td><i class="material-icons botoIcona" onclick="seccioBackofficeUsuaris.mostraEdicioUsuari(' + valor.id + ')">edit</i></td>'
                } else {
                    codiHTML = codiHTML + '<td></td>'
                }
                codiHTML = codiHTML + '</tr>'
            }
            codiHTML = codiHTML + '</table>'
            codiHTML = codiHTML + '</br></br>'
            codiHTML = codiHTML + '<input type="button" value="Afegir usuari" onclick="seccioBackofficeUsuaris.mostraAfegeixUsuari()" />'
        }

        // Amaguem la càrrega i mostrem el llistat de productes en una taula
        refContinguts.innerHTML = codiHTML
        refContinguts.style.display = 'flex'
        refLoading.style.display = 'none'
    }

    mostraEdicioUsuari (id) {
        let refId = document.getElementById('backofficeUsuarisId'),
            refCorreu = document.getElementById('backofficeUsuarisCorreu'),
            refNom = document.getElementById('backofficeUsuarisNom'),
            refTipus = document.getElementById('backofficeUsuarisTipus'),
            refCodi = document.getElementById('backofficeUsuarisCodi'),
            refImatge = document.getElementById('backofficeUsuarisImg'),
            refEsborra = document.getElementById('backofficeUsuarisBotoEsborra'),
            cnt = 0,
            valor = null

        // Busca l'usuari que s'ha d'editar a partir del 'id', i carrega les dades al formulari del popup
        for (cnt = 0; cnt < navegacio.dadesSeccio.length; cnt = cnt + 1) {
            valor = navegacio.dadesSeccio[cnt]
            if (valor.id === id) {
                refId.innerHTML = valor.id
                refCorreu.value = valor.correu
                refNom.value = valor.nom
                refTipus.value = valor.tipus
                refCodi.value = ''
                refImatge.src = valor.imatge
                break;
            }
        }

        // Buidem el valor de les dades de imatge (només serveix per quan escullen una nova imatge)
        this.codiImatge = ''

        // Mostra el botó esborra del popup
        refEsborra.style.display = 'flex'

        popups.mostraPopup('popupBackofficeUsuaris')
    }

    mostraAfegeixUsuari () {
        let refId = document.getElementById('backofficeUsuarisId'),
            refCorreu = document.getElementById('backofficeUsuarisCorreu'),
            refNom = document.getElementById('backofficeUsuarisNom'),
            refTipus = document.getElementById('backofficeUsuarisTipus'),
            refCodi = document.getElementById('backofficeUsuarisCodi'),
            refImatge = document.getElementById('backofficeUsuarisImg'),
            refEsborra = document.getElementById('backofficeUsuarisBotoEsborra')

        // Posa el formulari del pop amb les dades buides
        refId.innerHTML = ''
        refCorreu.value = ''
        refNom.value = ''
        refTipus.value = ''
        refCodi.value = ''
        refImatge.src = '/web/imatges/transparent.png'

        // Buidem el valor de les dades de imatge (només serveix per quan escullen una nova imatge)
        this.codiImatge = ''

        // Amaga el botó esborra del popup
        refEsborra.style.display = 'none'

        popups.mostraPopup('popupBackofficeUsuaris') 
    }

    // Guarda les dades del formulari d'usuari al servidor
    async guardaDadesUsuariAlServidor () {
        let refCarrega = document.getElementById('backofficeUsuarisPopupLoading'),
            refError = document.getElementById('backofficeUsuarisPopupError'),
            refId = document.getElementById('backofficeUsuarisId'),
            refCorreu = document.getElementById('backofficeUsuarisCorreu'),
            refNom = document.getElementById('backofficeUsuarisNom'),
            refTipus = document.getElementById('backofficeUsuarisTipus'),
            refCodi = document.getElementById('backofficeUsuarisCodi'),
            dadesUsuari = login.llegeixDadesUsuari(),
            objEnviament = {
                correuAdmin: dadesUsuari ? dadesUsuari.correu : null,
                tokenAdmin:  dadesUsuari ? dadesUsuari.token : null,
                id: refId.innerHTML,
                correu: refCorreu.value,
                nom: refNom.value,
                tipus: refTipus.value,
                codi: refCodi.value,
                imatge: ''
            },
            objRebut = {}

        if (this.codiImatge !== '') {
            objEnviament.imatge = this.codiImatge
        }

        refCarrega.style.display = 'flex'

        // Intentem enviar les dades al servidor
        try {
            objRebut = await promiseCallServer('POST', '/call/usuariGuarda', objEnviament)
        } catch (e) {
            console.error(e)
        }

        refCarrega.style.display = 'none'
        if (objRebut.resultat === 'ok') {
            // Si hem pogut guardar les dades, tanquem el popup i actualitzem la secció
            popups.amagalsTots()
            this.iniciaSeccio()

        } else {
            // Mostrem l'error per consola
            console.error(objRebut)

            // Si no hem pogut guardar les dades, mostrem l'error una estona 
            refError.style.display = 'flex'
            await promiseWait(1500)
            refError.style.display = 'none'
        }
    }

    async esborraUsuariDelServidor () {
        let refCarrega = document.getElementById('backofficeUsuarisPopupLoading'),
            refError = document.getElementById('backofficeUsuarisPopupError'),
            refId = document.getElementById('backofficeUsuarisId'),
            dadesUsuari = login.llegeixDadesUsuari(),
            objEnviament = {
                correuAdmin: dadesUsuari ? dadesUsuari.correu : null,
                tokenAdmin:  dadesUsuari ? dadesUsuari.token : null,
                id: refId.innerHTML
            },
            objRebut = {}

        refCarrega.style.display = 'flex'

        // Intentem enviar les dades al servidor
        try {
            objRebut = await promiseCallServer('POST', '/call/usuariEsborra', objEnviament)
        } catch (e) {
            console.error(e)
        }

        refCarrega.style.display = 'none'
        if (objRebut.resultat === 'ok') {
            // Si hem pogut esborrar les dades, tanquem el popup i actualitzem la secció
            popups.amagalsTots()
            this.iniciaSeccio()

        } else {
            // Mostrem l'error per consola
            console.error(objRebut)

            // Si no hem pogut esborrar les dades, mostrem l'error una estona 
            refError.style.display = 'flex'
            await promiseWait(1500)
            refError.style.display = 'none'
        }
    }

    mostraImatge () {
        let reader = new FileReader(),
            refArxiu = document.getElementById('backofficeUsuarisArxiu'),
            refImatge = document.getElementById('backofficeUsuarisImg')

        reader.onload = (evt) => {
            this.codiImatge = evt.target.result
            refImatge.src = evt.target.result
        }
        reader.readAsDataURL(refArxiu.files[0])
    }
}
