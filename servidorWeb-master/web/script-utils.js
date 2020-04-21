// Fa una crida al servidor
async function promiseCallServer (method, url, obj) {

    return new Promise((resolve, reject) => {
   
        let req = new XMLHttpRequest()
   
        req.onreadystatechange = (res) => {
            
            let responseObj = null
   
            if (req.readyState === 4) {

                try {
                    responseObj = JSON.parse(req.responseText)
                } catch (e) {
                    console.error(e, req.responseText)
                    return reject({ result: 'ko', message: 'Error parsing JSON' })
                }
   
                if (req.status >= 200 && req.status < 300) {
   
                    return resolve(responseObj)
   
                } else {

                    return reject(responseObj)
                }
            }
        }

        req.open(method, url, true)
        req.send(JSON.stringify(obj))
    })
}

// Espera una estona abans de seguir amb el codi
async function promiseWait (time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => { resolve() }, time)
    })
}
