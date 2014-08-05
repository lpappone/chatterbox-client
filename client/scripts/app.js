// YOUR CODE HERE:
// var timeCreated;
// var username;
// ajax request to get messages from parse
$(document).ready(function() {
  app.init();
});


var app = {};

app.username = document.URL.split('=').pop();
app.server = 'https://api.parse.com/1/classes/chatterbox';


app.init = function() {
  app.fetch();

  $('#submit').on('click', function() {
      app.retrieveMessage();
  });

};



// retrieve message that user entered
app.retrieveMessage = function() {
  console.log('retrieving')
  var userMessage = {};
  //use jQuery to get stuff in the input box
  userMessage.username = app.username;
  userMessage.text = $('#userInput').text();
  userMessage.roomname = null;
  //var cleanInput = app.XSSCleaner(userMessage);
  //delete cleanInput.warning;
  console.log(userMessage);
  app.send(userMessage);
}



// send message to Parse
app.send = function(message){
  console.log('sending')
  //var message = app.retrieveMessage();
  $.ajax({
    url: app.server,
    type: 'POST',
    data:  JSON.stringify(message),
    contentType: 'application/json',
    success: function(data) {
      console.log('chatterbox: post message');
    },
    error: function(data) {
      console.log('chatterbox: did not post message');
    }
  });

}


app.fetch = function() {
  $.ajax({
    url: app.server,
    type: 'GET',
    contentType: 'application/json',
    dataType: 'JSON',
    success: function(data) {
      console.log(data);
      console.log('chatterbox: got message');
      app.processData(data);
    },
    error: function(data) {
      console.log('chatterbox: did not get message');
    }
  });
}

// process the raw data from parse
app.processData = function(data) {

  for (var i = 0; i < data.results.length; i++) {

    var messageObj = {};
    messageObj.timeCreated = app.timeConvert(data.results[i].createdAt);
    messageObj.username = data.results[i].username;
    messageObj.message = data.results[i].text;

    app.displayMessage(messageObj);
  }
};

app.timeConvert = function(time) {
  return time;
};


// display the processed messages
app.displayMessage = function(message) {
    console.log('display');

  var cleanMessage = app.XSSCleaner(message);

  //if message.warning is true, do something...
  var $username = $('<span class="username">' + cleanMessage.username + '</span>');
  var $text = $('<p class="text">' + cleanMessage.message + '</p>');
  var $date = $('<span class="date">' + cleanMessage.timeCreated + '</span>');
  var $container = $('<li></li>');
  $container.append($username);
  $container.append($text);
  $container.append($date);
  if (cleanMessage.warning === true) {
    var $warning = $('<span class="warning">' + "This message may have been altered to prevent an attempted attack." + '</span>');
    $container.append($warning);
  }
  $('#messages').append($container);

}


// add message. use ajax to send message to parse.

// XSS cleaner to check outgoing and incoming message
app.XSSCleaner = function(message) {
  // iterate through every property in the message
  for(var key in message) {
    var oldValue = message[key];
    message[key] = DOMPurify.sanitize(message[key]);
    if (oldValue !== message[key]) {
      message.warning = true;
    }
  }
  return message;
};



