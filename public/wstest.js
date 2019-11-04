// this fails in Safari 10.1 but works in 10.03 (and other browsers)
var ws = new WebSocket('wss://echo.websocket.org');

ws.onerror = function(evt) {
  // Not sure why, but error events don't seem to include the actual error
  // The console, however, will have the following error:
  // WebSocket connection to 'wss://echo.websocket.org/' failed: Failed to send WebSocket frame.
  console.log("WebSocket error - see console for message");
}

ws.onclose = function(evt) {
  console.log(`WebSocket closed with code: ${evt.code}, reason: ${evt.reason}`);
}

ws.onopen = function() {
  console.log('sending first binary message');
  ws.send(new Uint8Array(23085)); // works
  console.log('bufferedAmount is ' + ws.bufferedAmount); // 0

  // this gets the error
  console.log('sending second binary message');
  ws.send(new Uint8Array(23085)); // triggers error and close
  console.log('bufferedAmount is ' + ws.bufferedAmount); // 0

  console.log('sending third binary message');
  ws.send(new Uint8Array(23085));
  console.log('bufferedAmount is ' + ws.bufferedAmount);

  ws.close();
}

