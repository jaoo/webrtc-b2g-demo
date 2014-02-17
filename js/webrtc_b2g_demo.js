/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var WebRTCB2GDemo = (function() {
  /** Title/header node */
  var header = null;

  /** Close button node */
  var closeButton = null;

  /** Accept button node */
  var acceptButton = null;

  /** Screen node */
  var roomRequestScreen = null;

  /** Screen node */
  var audioControlScreen = null;

  /** Room input node */
  var roomInput = null;

  /** PeerConnection object */
  var PeerConnection = null;

  /** Holds the connection */
  var connection = null;

  /** SessionDescription object */
  var SessionDescription = null;

  /** IceCandidate object */
  var IceCandidate = null;

  /** Flag */
  var amITheCallerParty = true;

  /** Localization */
  var _ = null;

  /** Media to share */
  var media = 'audio';

  /**
   * Init function.
   */
  function wbd_init() {
    _ = navigator.mozL10n.get;

    // Retrieve the various page elements
    header = document.getElementById('title');
    closeButton = document.getElementById('close');
    acceptButton = document.getElementById('accept');
    roomRequestScreen = document.getElementById('room-screen');
    roomInput = roomRequestScreen.querySelector('input');
    roomInput.focus();

    audioControlScreen = document.getElementById('audio-screen');

    // Event handlers
    closeButton.addEventListener('click', wdb_onClose);
    acceptButton.addEventListener('click', wdb_onAccept);

    PeerConnection = window.mozRTCPeerConnection;
    SessionDescription = window.mozRTCSessionDescription;
    IceCandidate = window.mozRTCIceCandidate;
    navigator.getUserMedia =
      navigator.getUserMedia || navigator.mozGetUserMedia;
  }

  /**
   * Handler for the 'Accept' button.
   */
  function wdb_onAccept() {
    acceptButton.hidden = true;
    roomRequestScreen.hidden = true;
    audioControlScreen.hidden = false;

    FirebaseProxy.init();
    if (roomInput.value) {
      // If the user does not provide a room number he/she becomes the caller
      // party. He/she starts the WebRTC dance.
      amITheCallerParty = false;
      FirebaseProxy.setRoomId(roomInput.value);
    }

    // Set the room number as the header in the app.
    header.textContent = _('room') + ' ' + FirebaseProxy.getRoomId();

    var servers = {
      iceServers: [
        {url: 'stun.l.google.com:19302'},
        {url: 'stun1.l.google.com:19302'},
        {url: 'stun2.l.google.com:19302'},
        {url: 'stun3.l.google.com:19302'},
        {url: 'stun4.l.google.com:19302'}
      ]
    };
    var options = {
      optional: [
        {DtlsSrtpKeyAgreement: true}
      ]
    };
    
    connection = new PeerConnection();
    connection.onaddstream = wbd_onAddStream;

    var constrains = {
      audio: true
    };
    if (media === 'video') {
      constrains = {
        video: true
      };
    }

    try {
      navigator.getUserMedia(
        constrains,
        wbd_getUserMediaSuccessCallback,
        wdb_onError
      );

    } catch(e) {
      wdb_onError(e);
    }
  }

  /**
   * Callback function to be called as success callback for the getUserMedia
   * function.
   */
  function wbd_getUserMediaSuccessCallback(stream) {
    var localMedia = document.getElementById('local-' + media);
    localMedia.hidden = false;
    if (media === 'audio') {
      localMedia.controls = true;
    }
    localMedia.mozSrcObject = stream;
    localMedia.muted = true;
    localMedia.play();

    // Add stream to the connection.
    connection.addStream(stream);

    wdb_connect();
  }

  /**
   * Connect up the peer.
   */
  function wdb_connect() {
    var offerConstrains = {
      mandatory: {
        OfferToReceiveAudio: true
      }
    };

    if (amITheCallerParty) {
      connection.createOffer(wdb_sendOffer, wdb_onError, offerConstrains);
    } else {
    console.log('jaoo wdb_connect waiting for an offer.');
      FirebaseProxy.recv('offer', wdb_recvOffer);
    }
  }

  /**
   * Send the offer to the callee party through Firebase.
   */
  function wdb_sendOffer(offer) {
    console.log('jaoo wdb_sendOffer(' + JSON.stringify(offer) + ')');
    connection.setLocalDescription(offer);

    // Send the offer SDP to Firebase.
    FirebaseProxy.send('offer', JSON.stringify(offer));

    // Wait for an answer SDP from Firebase.
    console.log('jaoo wdb_sendOffer waiting for an answer.');
    FirebaseProxy.recv('answer', function(answer){
      console.log('jaoo wdb_sendOffer recv answer(' + answer + ')');
      connection.setRemoteDescription(
        new SessionDescription(JSON.parse(answer))
      );
    });
  }

  /**
   * Receive the offer from the caller party through Firebase.
   */
  function wdb_recvOffer(offer) {
    console.log('jaoo wdb_recvOffer(' + offer + ')');
    var answerConstrains = {
      mandatory: {
        OfferToReceiveAudio: true
      }
    };

    connection.setRemoteDescription(new SessionDescription(JSON.parse(offer)));
    connection.createAnswer(wdb_sendAnswer, wdb_onError, answerConstrains);
  }

  /**
   * Send the answer to the caller party through Firebase.
   */
  function wdb_sendAnswer(answer) {
    console.log('jaoo wdb_sendAnswer(' + JSON.stringify(answer) + ')');
    connection.setLocalDescription(answer);
    FirebaseProxy.send('answer', JSON.stringify(answer));
  }

  /**
   * Handler for 'onaddstream' even thrown over the peer connection object.
   */
  function wbd_onAddStream(obj) {
    console.log('jaoo wbd_onAddStream');
    var remoteMedia = document.getElementById('remote-' + media);
    remoteMedia.hidden = false;
    if (media === 'audio') {
      remoteMedia.controls = true;
    }
    remoteMedia.mozSrcObject = obj.stream;
    remoteMedia.muted = false;
    remoteMedia.play();
    console.log('jaoo wbd_onAddStream done');
  }

  /**
   * Handler for generic errors.
   */
  function wdb_onError(e) {
    console.error('Oh no!, something bad happened: ' + e);
  }

  /**
   * Handler for closing the app.
   */
  function wdb_onClose() {
    var localMedia = document.getElementById('local-' + media);
    if (localMedia.mozSrcObject) {
      localMedia.mozSrcObject.stop();
      localMedia.mozSrcObject = null;
    }
    window.close();
  }

  // Public API.
  return {
    init: wbd_init
  };
})();

window.addEventListener('load', function callSetup(evt) {
  window.removeEventListener('load', callSetup);

  WebRTCB2GDemo.init();
});
