window.onload = function() {

  function sendMessage(url, otherData) {
    var newEntry = document.createElement('div');
    newEntry.innerHTML = url + ' and other data = ' + otherData;
    document.getElementById('debug').appendChild(newEntry);
  }

  cast.receiver.logger.setLevelValue(0);
  window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
  castReceiverManager.onReady = function(event) {
    window.castReceiverManager.setApplicationState("Application ready");
  };

  // create a CastMessageBus to handle messages for a custom namespace
  window.messageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:org.yourInstitution.youtApp');

  window.messageBus.onMessage = function(event) {
      var msg = JSON.parse(event.data);
      if (msg.force) {
        return loadPage(msg.url);
      }
      sendMessage(msg.url, msg.otherData);
      window.messageBus.send(event.senderId, event.data);
  }

  window.castReceiverManager.start({statusText: "Application is starting"});

};
