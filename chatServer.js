/*
chatServer.js
Author: David Goedicke (da.goedicke@gmail.com)
Closley based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

var express = require('express'); // web server application
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server
var io = require('socket.io')(http); // connect websocket library to server
var serverPort = 8000;


//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION -----------------------------//
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
  console.log('a new user connected');
  var questionNum = 0; // keep count of question, used for IF condition.
  socket.on('loaded', function() { // we wait until the client has loaded and contacted us that it is ready to go.

    socket.emit('answer', "Hey, I'm ClimbBot!"); //We start with the introduction;
    setTimeout(timedQuestion,4000, socket, "What is your name?"); // Wait a moment and respond with a question.

  });
  socket.on('message', (data) => { // If we get a new message from the client we process it;
    console.log(data);
    questionNum = bot(data, socket, questionNum); // run the bot function with the new message
  });
  socket.on('disconnect', function() { // This function  gets called when the browser window gets closed
    console.log('user disconnected');
  });
});
//--------------------------CHAT BOT FUNCTION-------------------------------//
function bot(data, socket, questionNum) {
  var input = data; // This is generally really terrible from a security point of view ToDo avoid code injection
  var answer;
  var question;
  var waitTime;
  var difference;

  /// These are the main statments that make up the conversation.
  if (questionNum == 0) {
    answer = 'Hello ' + input + ' :)'; // output response
    waitTime = 2500;
    question = 'How old are you?'; // load next question
  } else if (questionNum == 1) {
    var difference = 29-parseInt(input);
    if (difference > 0) {
    answer = 'Wow, ' + input + '? That means you\'re ' + difference + ' years younger than me.'
    waitTime = 2500;
    } else if (difference < 0) {
      answer = 'Wow, ' + input + '? We won\'t talk about how old you are.'
      waitTime = 2500;
    } else if (difference == 0) {
      answer = 'Wow, ' + input + '?  We are the same age!'
      waitTime = 2500;}
    question = 'Where do you live?'; // load next question
  } else if (questionNum == 2) {
    answer = 'Cool, me too! I love living in ' + input + '.';
    waitTime = 2500;
    question = 'Do you want to go climbing?'; // load next question
  } else if (questionNum == 3) {
    if (input.toLowerCase() === 'yes' || input === 1) {
      answer = 'Awesome! Let\'s be climbing buddies!';
      waitTime = 2500;
      question = 'What day of this week do you want to go?';
    } else if (input.toLowerCase() === 'no' || input === 0) {
      answer = 'Are you sure? I think you should reconsider...'
      waitTime = 2500;
      question = 'Do you want to go climbing?'
      waitTime = 2500;
      questionNum--;
    } else if (input.toLowerCase() === 'maybe' || input === 1) {
      answer = 'Maybe? I\'ll take that as a yes.'
      waitTime = 2500;
      question = 'What day of this week do you want to go?';
    } else {
      question = 'Do you want to go climbing?'; // load next question
      answer = 'I did not understand you. Could you please answer "yes", "no", or "maybe"?'
      questionNum--;
      waitTime = 2500;
    }
  } else {
    answer = 'Cool. I\'ll see you on ' + input + '.'; // output response
    waitTime = 0;
    question = '';
  }


  /// We take the changed data and distribute it across the required objects.
  socket.emit('answer', answer);
  setTimeout(timedQuestion, waitTime, socket, question);
  return (questionNum + 1);
}

function timedQuestion(socket, question) {
  if (question != '') {
    socket.emit('question', question);
  } else {
    //console.log('No Question send!');
  }

}
//----------------------------------------------------------------------------//
