var express = require('express');
var app = express();

app.get("/startGame", function(req, res) {
    console.log("Loading data from JSON source...")
    url1 = createURL()
    $.ajax({
        type: "GET",
        url: url1,
        success: function(result) {
            console.log("Response Code: " + result.response_code)
            if (result.response_code == 0) {
                response = result.results;
                console.log("Loaded")
                qCount = -1;
                nextQ()
            }
        }
    })
    console.log(result.results);
})

app.use(express.static('public'))
app.listen(8080); 