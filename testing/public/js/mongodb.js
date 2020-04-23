//Keeping the header here for now, if anything doesnt work this is what I had. Maybe adding/removing these will help
/*
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/coloured-animals";
const express = require('express');
const bodyParser = require('body-parser')
const app = express();

app.use(express.static('public'))

app.use(bodyParser.urlencoded({extended:true}))
*/


var db;

//this array contains all the usernames already generated, to avoid duplicates
var alreadyUsed = [];

//Dont know if the below is needed here or server.js Keeping it here for now
MongoClient.connect(url, function(err, database){
    if(err) throw err;
    db = database;
    app.listen(8080);
});


//This is just testing for the database contents in server.js, feel free to remove.

/*
app.get('/all', function(req, res) {
    
    var output = "<h1>Everything</h1>";

    db.collection('animals').find().toArray(function(err, result) {
        if (err) throw err;

        for (var i = 0; i < result.length; i++) {
            output += "<div>"
            output += "<p>" + result[i].name + "</p>"
            output += "</div>"
        }
    });
    db.collection('colours').find().toArray(function(err, result) {
        if (err) throw err;

        for (var i = 0; i < result.length; i++) {
            output += "<div>"
            output += "<p>" + result[i].colour + "</p>"
            output += "</div>"
        }
        res.send(output);
    });
});
*/

//The below are all just testing of the method in server.js, feel free to remove.

/*
app.get('/', function(req, res) {
    res.render('public/index')
});

app.get('/generate', function(req, res) {
    generateUsername()
    
    var output = "<h1>Everything</h1>" + alreadyUsed.length;

    for (var i = 0; i < alreadyUsed.length; i++) {
        output += "<div>"
        output += "<p>" + alreadyUsed[i] + "</p>"
        output += "</div>"
    }
    
    res.send(output)
});

app.get('/reset', function(req, res) {
    resetUsername()
    res.send("It has been reset!")
});
*/


//This function generates & returns a username, and puts it in the alreadyUsed array to avoid duplicates.
function generateUsername(){
    db.collection('colours').find().toArray(function(err, result1) {
        if (err) throw err;
        db.collection('animals').find().toArray(function(err, result2) {
            if (err) throw err;
            //Nested find().toArray() because of the use of two collections.

            do{
                //initializes output to be returned later & boolean of wether generated username is a duplicate
                var output = "";
                var used = false;

                //adds random colour & name to output, thus making the username
                output += result1[Math.floor(Math.random() * result1.length)].colour;
                output += result2[Math.floor(Math.random() * result2.length)].name;
            
                //conpares it to each username already generated, and if it already exits, repeates the while loop
                for(var i=0;i<alreadyUsed.length;i++){
                    if(alreadyUsed[i]===output){
                        used = true;
                    }
                }
            }
            while(used) //This only repeats if there is a duplicate

            //adds non-duplicate to the array of already used usernames
            alreadyUsed.push(output)
        });
    });

    //returns the just now added username
    return alreadyUsed[alreadyUsed.length-1];
}

function resetUsername(){
    //empties already used array to allow new game to have new usernames
    alreadyUsed.splice(0, alreadyUsed.length)
}