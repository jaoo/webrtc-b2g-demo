/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var FirebaseProxy = (function() {
  /** Firebase database location */
  var FIREBASE_DB_LOCATION = 'https://webrtc-b2g-demo.firebaseio.com/';

  /** Firebase object */
  var firebase = null;

  /** Firebase room reference */
  var rooms = null;

  /** */
  var room = null;

  /**
   *  Init function.
   */
  function fbp_init() {
    firebase = new Firebase(FIREBASE_DB_LOCATION);
    rooms = firebase.child('rooms');
    room = fbp_getId();
  }

  /**
   * Send data to Firebase.
   */
  function fbp_send(key, data) {
  	rooms.child(room).child(key).set(data);
  }

  /**
   * Receive data from Firebase.
   */
  function fbp_recv(type, callback) {
    rooms.child(room).child(type).on("value", function(dataSnapshot) {
      var data = dataSnapshot.val();
      if (data && (callback && (typeof callback === 'function'))) {
        callback(data);
      }
    });
  }

  /**
   * Helper function.
   */
  function fbp_getRoomId() {
    return room;
  }

  /**
   * Helper function.
   */
  function fbp_setRoomId(id) {
    room = id;
  }

  /**
   * Helper function.
   */
  function fbp_getId() {
    return (Math.random() * 10000 + 10000 | 0).toString();
  }

  // Public API.
  return {
    init: fbp_init,
    setRoomId: fbp_setRoomId,
    getRoomId: fbp_getRoomId,
    send: fbp_send,
    recv: fbp_recv
  };
})();
