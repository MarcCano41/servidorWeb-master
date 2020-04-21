class ObjNavegacio {

    constructor () {
        this.seccioActual = 'frontendHome'
        this.dadesSeccio = null
    }


    // Si criden la pàgina des d'una secció, la mostrem enlloc de la pàgina princial
    inicia () {
        let posCoixinet = document.URL.indexOf('#')

        if (posCoixinet !== -1) {
            this.canviaSeccio(document.URL.substring(posCoixinet + 1))
        }
    }

    // Canvia a una nova secció informant del canvi al navegador
    canviaSeccio (seccioNova) {

        // Informem al navegador del canvi de secció
        window.history.pushState( { html: seccioNova }, '', '#' + seccioNova)

        // Mostrem el canvi de seccio
        this.mostraSeccio(seccioNova)
    }

    // Amaga la secció anterior i mostra la nova
    mostraSeccio (seccioNova) {
        let refActual = document.getElementById(this.seccioActual),
            refNova = document.getElementById(seccioNova)

        // S'amaga la seccio que estava visible i es mostra la que s'ha demanat
        refActual.style.display = 'none'
        refNova.style.display = 'flex'
        
        // La seccio actual passa a ser la que s'ha demanat
        this.seccioActual = seccioNova

        // Posiciona l'scroll de la pàgina a dalt
        document.body.scrollTop = 0

        // Neteja les dades de la seccio
        this.dadesSeccio = null

        // Executa la funció de càrrega d'aquesta secció si és necessari
        iniciaSeccio(seccioNova)
    }
}


