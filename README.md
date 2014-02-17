# WebRTC B2G demo

This app aims to be a proof of concept about WebRTC in B2G. The main goal of its
develpment process is to know the current status of the WebRTC APIs.

## The app itself

The app being implemented here is a certificated one. For testing it just move
this directory into the apps directory in your Gaia clone.

## How it works

The app needs the device to be connected (have network connection). Once the
user opens the app a room number will be requested. The calling party must not
provide a room number. Once the app gets the media a room number will be shown
as the header of the screen. The room number shown must be shared with the
called party somehow. The called party must provice that room number when
requested. Once both parties share ICE candidates and SDPs the connection starts
and the stream are shared.
