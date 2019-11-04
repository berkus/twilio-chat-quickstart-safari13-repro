$(function() {
  // Get handle to the chat div
  var $chatWindow = $('#messages');

  // Our interface to the Chat service
  var chatClient;

  // The server will assign the client a random username - store that value
  // here
  var username;

  // Helper function to print info messages to the chat window
  function print(infoMessage, asHtml) {
    var $msg = $('<div class="info">');
    if (asHtml) {
      $msg.html(infoMessage);
    } else {
      $msg.text(infoMessage);
    }
    $chatWindow.append($msg);
  }

  window.printLog = print;

  // Helper function to print chat message to the chat window
  function printMessage(fromUser, message) {
    var $user = $('<span class="username">').text(fromUser + ':');
    if (fromUser === username) {
      $user.addClass('me');
    }
    var $message = $('<span class="message">').text(message);
    var $container = $('<div class="message-container">');
    $container.append($user).append($message);
    $chatWindow.append($container);
    $chatWindow.scrollTop($chatWindow[0].scrollHeight);
  }

  // Alert the user they have been assigned a random username
  print('Logging in...');

  // Get an access token for the current user, passing a username (identity)
  // and a device ID - for browser-based apps, we'll always just use the
  // value "browser"
  $.getJSON('/token/TestUser', {
    device: 'browser'
  }, function(data) {

    // Initialize the Chat client
    Twilio.Chat.Client.create(data.token, {logLevel: 'trace'}).then(client => {
      console.log('Created chat client');
      chatClient = client;
      chatClient.on('connectionStateChanged', state => {
        print(state, false);
      });

      // Paginate a bunch (~600) of joined channels.. this will kill websocket on Safari 13
      chatClient.getSubscribedChannels().then(page => parsePage(page)).catch(error => {
        console.error(error);
        print(error, false);
      });

      // Alert the user they have been assigned a username
      username = data.identity;
      print('You have been assigned a username of: '
      + '<span class="me">' + username + '</span>', true);

    }).catch(error => {
      console.error(error);
      print('There was an error creating the chat client:<br/>' + error, true);
      print('Please check your .env file.', false);
    });
  });

  // Create and join channels prior to websocket test
  function populateChannels() {
    for (var ch = 0; ch < 600; ch++) {
      chatClient.createChannel({isPrivate: true, uniqueName: 'testChannel'+ch}).then(channel => {
        channel.join().then(channel => { console.log("Joined channel "+ch); });
      });
    }
  }

  function parsePage(paginator, process) {
    if (!process) { process = console.log; }
    paginator.items.forEach(item => {
        process(item);
    });
    if (paginator.hasNextPage) {
        paginator.nextPage().then(next => parsePage(next, process));
    }
  }

  var $btn = $('#create-btn');
  $btn.on('click', function(e) {
    populateChannels();
  });
});
