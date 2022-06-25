const express = require('express')
const port = 15150
const console = require("./Console").console

class Media_api{

    constructor(){
        this.app = express()
        this.app.use(express.static('public'))
        this.app.listen(port, () => {
            console.info(`api start on rostro15.fr:${port}`)
          })

    }
}
module.exports = Media_api;