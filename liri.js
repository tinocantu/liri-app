//Read the env variables
require("dotenv").config();

//Require NPM packages
var keys = require("./keys.js");
var request = require("request");
var Spotify = require('node-spotify-api');
var Twitter = require("twitter");
var inquirer = require("inquirer");
var fs = require("fs");

//Spotify and Twitter Keys
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);


//Get action to do from the user and determine what function to run
inquirer
    .prompt([
        {
            type: "list",
            message: "Hi! I´m Liri. What do you want me to show you?",
            choices: ["Your last 20 tweets?", "A song's Spotify information", "A movie's information (plot, cast, release year, country, ratings, etc..)", "Do one of the above commands randomly"],
            name: "whatToShow"
        }
    ]).then(function (response) {
        switch (response.whatToShow) {
            case "Your last 20 tweets?":
                tweets();
                break;

            case "A song's Spotify information":
                song();
                break;

            case "A movie's information (plot, cast, release year, country, ratings, etc..)":
                movie();
                break;

            case "Do one of the above commands randomly":
                var randomNumber = Math.floor((Math.random() * 3) + 1);
                switch (randomNumber) {
                    case 1:
                        tweets();
                        break;

                    case 2:
                        song();
                        break;

                    case 3:
                        movie();
                        break;
                }
        }
    });

//Funcion to be ran when the Twitter option is selected
var tweets = function () {
    client.get("statuses/user_timeline", function (error, tweets, response) {
        if (error) throw error;
        console.log("\n These are your last 20 tweets \n")
        for (i = 0; i < 20; i++) {
            console.log(i + 1 + ". " + tweets[i].text);
        }
    });
}

//Funtion to be ran when the Song option is selected
var song = function () {
    inquirer
        .prompt([
            {
                type: "input",
                message: "What song do you want to search?",
                name: "songName"
            }
        ]).then(function (response) {

            spotify.search({ type: 'track', query: response.songName, limit: 5 }, function (err, data) {
                if (err) {
                    return console.log('Error occurred: ' + err);
                }

                console.log("\n These are the songs (max 5) found for " + response.songName);

                for (i = 0; i < data.tracks.items.length; i++) {

                    var artistsArray = [];
                    for (j = 0; j < data.tracks.items[i].artists.length; j++) {
                        artistsArray.push(data.tracks.items[i].artists[j].name);
                    }

                    console.log("\nArtist(s): " + artistsArray.join(", "));
                    console.log("Track name: " + data.tracks.items[i].name);
                    console.log("Preview: " + data.tracks.items[i].preview_url);
                    console.log("Album: " + data.tracks.items[i].album.name);
                    console.log("\n-----------------------------------------------------------------");
                }
            });
        });
}

//Funcion to be ran if Movie option is selected
var movie = function () {
    inquirer
        .prompt([
            {
                type: "input",
                message: "What movie do you want to search?",
                name: "movieName"
            }
        ]).then(function (response) {

            var movieChosen = response.movieName;
            var movieSearch = movieChosen.split(" ").join("%20")

            request("http://www.omdbapi.com/?t=" + movieSearch + "&y=&plot=short&apikey=trilogy", function (error, response, body) {

                if (!error && response.statusCode === 200) {
                    var bodyObj = JSON.parse(body);
                    console.log("\nHere's the information of " + movieChosen);
                    console.log("\nTitle: " + bodyObj.Title);
                    console.log("Year: " + bodyObj.Year);
                    console.log("IMDB Rating: " + bodyObj.Ratings[0].Value);
                    console.log("Rotten Tomatoes Rating: " + bodyObj.Ratings[1].Value);
                    console.log("Country: " + bodyObj.Country);
                    console.log("Language: " + bodyObj.Language);
                    console.log("Plot: " + bodyObj.Plot);
                    console.log("Cast: " + bodyObj.Actors);
                }
            });

        });
}
