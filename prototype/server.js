var express = require('express');
var app = express();

app.get('/', function(req, res){
    res.send('root');
});


app.listen(8080); 