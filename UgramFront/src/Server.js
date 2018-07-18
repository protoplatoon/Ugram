
var express = require('express');
var fs = require('fs')
var path = require("path")
var compression = require('compression')
// ...

const appExpress = express();
// appExpress.use(compression())
// server du front pour un deploiement nodeJs

// pour un deploiement static on peut directement utiliser 
// le bundle et le index.html

appExpress.get('*.js', (req, res, next) => {
    req.url = req.url + '.gz';
    res.set('Content-Encoding', 'gzip');
    res.set('Content-Type', 'text/javascript');
    next();
});

appExpress.use("/dist/js", express.static('../dist/js'));

appExpress.get("/", (req, res) => {
    console.log("requete get /")
    fs.readFile('../index.html', 'utf8', function(err, text){
        //console.log("send " + text)
        res.send(text);
    });
})

let port = 80;

appExpress.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/`);
});
