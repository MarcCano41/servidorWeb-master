class ObjPopups {

    constructor () {
    }

    // Mostra un popup
    mostraPopup (nom) {
        document.getElementById('popups').style.display = 'flex'
        document.getElementById(nom).style.display = 'flex'
    }

    // Amaga els popups només s'hi s'ha fet click a la capa 'popups'
    amagaAmbClick (evt) {

        if (evt !== null && evt.target.id === 'popups') {
            evt.preventDefault()
            this.amagalsTots()
        }
    }

    // Amaga els popups
    amagalsTots () {
        let refBack = document.getElementById('popups'),
            capesPopups = refBack.children,
            cnt = 0
        
        // Amaguem tots els popups
        for (cnt = 0; cnt < capesPopups.length; cnt = cnt + 1) {
            capesPopups[cnt].style.display = 'none'
        }

        // Amaguem també el fons
        refBack.style.display = 'none'
    }
}

