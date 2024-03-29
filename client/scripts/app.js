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
app.friends = [];
app.rooms = [];
app.currentRoom;


app.init = function() {
  app.fetch();
  app.displayRooms();

  $('#send').submit(function(event) {
      app.handleSubmit();
      event.preventDefault();
  });

  $('#room').submit(function(event) {

      app.addRoom( $('#newRoom').val() );
      event.preventDefault();
  });

  $('#refresh').on('click', function(event) {
      app.clearMessages();
      app.fetch();
  });

  $(document).on('click', '.room', function() {
      var roomName = $(this).text()
      app.currentRoom = roomName;
      app.clearMessages();
      app.fetch();
  });

  $('.leaveRoom').on('click', function(event) {
      app.currentRoom = null;
      app.clearMessages();
      app.fetch();
  });

  // must use $(document).on('click', 'username') instead of $('.username').on('click')
  // because fetch has not yet retrieved the list of messages by the time
  // $('.username').on('click') is run. Meaning, there is nothing to attach the
  // on click event to.
  // $(document).on('click') attaches the listeners when document is done loading.
  $(document).on('click', '.username', function() {
    var friend = $(this).text();
    app.addFriend(friend);
  })
};

// send message that user entered
app.handleSubmit = function() {
  console.log('retrieving')
  var userMessage = {};
  //use jQuery to get stuff in the input box
  userMessage.username = app.username;
  userMessage.text = $('#message').val();
  userMessage.roomname = app.currentRoom;
  var cleanInput = app.XSSCleaner(userMessage);
  delete cleanInput.warning;
  app.send(userMessage);
  console.log(userMessage);
}

// send message to Parse
app.send = function(message){
  $.ajax({
    url: app.server,
    type: 'POST',
    data:  JSON.stringify(message),
    contentType: 'application/json',
    success: function(data) {
      app.clearMessages();
      app.fetch();
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
    data: {
      order: '-createdAt'
    },
    success: function(data) {
      console.log(data, "data");
      console.log('chatterbox: got message');
      app.processData(data);
    },
    error: function(data) {
      console.log('chatterbox: did not get message');
    }
  });
}

//filter message for one room
// app.filterMessagesByRoom = function(room){
//   app.fetch();
//   _.filter(data.results, function() {
//     return data.results[i].roomname === app.currentRoom;
//   });

//   for (var i = 0; i < data.results.length; i++) {
//     var messageObj = {};

//     messageObj.timeCreated = app.timeConvert(data.results[i].createdAt);
//     messageObj.username = data.results[i].username;
//     messageObj.roomname = data.results[i].roomname;
//     messageObj.message = data.results[i].text;

//     app.addMessage(messageObj);
//   }

// }

// // fetch messages for one room
// app.fetchMessagesByRoom = function(room){
//   console.log('fetch room')
//   $.ajax({
//     url: app.server,

//     type: 'GET',
//     contentType: 'application/json',
//     dataType: 'JSON',
//     data: {
//       order: '-createdAt',
//       roomname: room,
//     },
//     success: function(data) {
//       console.log(data, 'room data');
//       console.log('chatterbox: got message');
//       app.processData(data);
//     },
//     error: function(data) {
//       console.log('chatterbox: did not get message');
//     }
//   });
// }


// process the raw data from parse
app.processData = function(data) {
  if (app.currentRoom) {
    var newArr = _.filter(data.results, function(item) {
    return item.roomname === app.currentRoom;
    });
    console.log(newArr, 'filtering newArr')
  } else {
    var newArr = data.results;
  }

  for (var i = 0; i < newArr.length; i++) {

    var messageObj = {};
    messageObj.timeCreated = app.timeConvert(data.results[i].createdAt);
    messageObj.username = data.results[i].username;
    messageObj.roomname = data.results[i].roomname;
    messageObj.message = data.results[i].text;

    app.addMessage(messageObj);
  }
};

app.timeConvert = function(time) {
  return time;
};

// add room
app.addRoom = function(room) {
  app.rooms.push(room)
  var $room  = $('<p><a href="#" class ="room">' + room + '</a></p>');
  $('#roomSelect').append($room);
}

app.displayRooms = function(){
  if(app.rooms.length > 0){
    for(var i =0; i < app.rooms.length; i++){
  var $room  = $('<p><a href="#" class ="room">' + room + '</a></p>');
    $('#roomSelect').append($room);
    }
  }
};



// display the processed messages
app.addMessage = function(message) {
    console.log('display');

  var cleanMessage = app.XSSCleaner(message);

  //if message.warning is true, do something...
  var $username = $('<a href="#" class="username">' + cleanMessage.username + '</a>');
  var $text = $('<p class="text">' + cleanMessage.message + '</p>');
  var $date = $('<span class="date">' + cleanMessage.timeCreated + '</span>');

  var $container = $('<li class="'+cleanMessage.roomname+'"></li>');
  $container.append($username);
  $container.append($text);
  $container.append($date);
  if (cleanMessage.warning === true) {
    var $warning = $('<span class="warning">' + "This message may have been altered to prevent an attempted attack." + '</span>');
    $container.append($warning);
  }

  if(app.friends.indexOf(cleanMessage.username) >= 0) {
    $container.addClass('friend');
  }
  $('#chats').append($container);

}

app.clearMessages = function() {
  $('#chats').children().remove();
};

app.addFriend = function(friend) {
  app.friends.push(friend);
  console.log(friend)
}


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



