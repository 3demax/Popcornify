var VideoPlayer = function (opts) {
  var self = this;
  var opts = opts || {};
  var player = opts.mediaElement || null;
  var controls = $(opts.controlElement) || null;
  
  var registerVLCEvent = function(event, handler) {
    var vlc = player;
    if (vlc) {
        if (vlc.attachEvent) {
            // Microsoft
            vlc.attachEvent (event, handler);
    } else if (vlc.addEventListener) {
        // Mozilla: DOM level 2
        vlc.addEventListener (event, handler, false);
    } else {
        // DOM level 0
        vlc["on" + event] = handler;
    }
    }
  }
  // stop listening to event
  var unregisterVLCEvent = function(event, handler) {
      var vlc = getVLC("vlc");
      if (vlc) {
          if (vlc.detachEvent) {
              // Microsoft
              vlc.detachEvent (event, handler);
      } else if (vlc.removeEventListener) {
          // Mozilla: DOM level 2
          vlc.removeEventListener (event, handler, false);
      } else {
          // DOM level 0
          vlc["on" + event] = null;
      }
    }
  }
  // event callback function for testing
  var handleEvents = function(event) {
      if (!event)
          event = window.event; // IE
      if (event.target) {
          // Netscape based browser
          targ = event.target;
  } else if (event.srcElement) {
      // ActiveX
      targ = event.srcElement;
  } else {
      // No event object, just the value
      console.log("Event value" + event );
      return;
  }
  if (targ.nodeType == 3) // defeat Safari bug
      targ = targ.parentNode;
      console.log("Event " + event.type + " has fired from " + targ );
  }
  // handle mouse grab event from video filter

  var handleMouseGrab = function(event,X,Y) {
      if (!event)
          event = window.event; // IE
          console.log("new position (" + X + "," + Y + ")");
  }

  var onTimeChanged = function(event) {
    var cntrls = controls;
    var event = event;
    var tm = event/1000;
    _.debounce(function(){
      var h = Math.floor(tm/3600);
      var m = Math.floor(tm/60);
      var s = Math.ceil((tm%60)-1);
      $(cntrls).find('.timing').text(
        ((h<10)?"0"+h:h)+":"+
        ((m<10)?"0"+m:m)+":"+
        ((s<10)?"0"+s:s)
      )
    }, 500, true)();
  }
  var onPositionChanged = function(event) {
    var cntrls = controls;
    var event = event;
    _.debounce(function(){
      $(cntrls).find('.progress .indicator').css({'width': (event*100)+"%"})
    }, 500, true)();
  }
  
  var onPlay = function(event) {
    controls.find('.play').removeClass('uk-icon-play');
    controls.find('.play').addClass('uk-icon-pause');
  }
  var onPause = function(event) {
    controls.find('.play').removeClass('uk-icon-pause');
    controls.find('.play').addClass('uk-icon-play');
  }
  
  // Register a bunch of callbacks.
//  registerVLCEvent('MediaPlayerNothingSpecial', handleEvents);
//  registerVLCEvent('MediaPlayerOpening', handleEvents);
//  registerVLCEvent('MediaPlayerBuffering', handleEvents);
  registerVLCEvent('MediaPlayerPlaying', onPlay);
  registerVLCEvent('MediaPlayerPaused', onPause);
//  registerVLCEvent('MediaPlayerForward', handleEvents);
//  registerVLCEvent('MediaPlayerBackward', handleEvents);
//  registerVLCEvent('MediaPlayerEncounteredError', handleEvents);
//  registerVLCEvent('MediaPlayerEndReached', handleEvents);
  registerVLCEvent('MediaPlayerTimeChanged', onTimeChanged);
  registerVLCEvent('MediaPlayerPositionChanged', onPositionChanged);
//  registerVLCEvent('MediaPlayerSeekableChanged', handleEvents);
//  registerVLCEvent('MediaPlayerPausableChanged', handleEvents);
  
  controls.find('.play').click(function(){
    self.playpause();
  });
  Mousetrap.bind('space', function(e) {
    self.playpause();
    e.preventDefault();
});
  controls.find('.progress').click(function(evt){
    var relX = evt.pageX - $(this).offset().left;
    var width = $(this).width();
    var pos = ((relX-5>0)?relX-5:0)/(width-10)
    player.input.position = pos;
  });
  controls.find('.volume').click(function(){
    if (!player.audio.mute) {
      $(this).removeClass('uk-icon-volume-up')
//      $(this).removeClass('uk-icon-volume-down')
      $(this).addClass('uk-icon-volume-off')
    } else {
      $(this).addClass('uk-icon-volume-up')
      $(this).removeClass('uk-icon-volume-off')
    }
    player.audio.toggleMute();
  });
  controls.find('.fullscreen').click(function(){
    win.toggleFullscreen()
  });
  self.playpause = function() {
    if (player.input.position >= 1){
      player.input.position = 0;
    }
    if (player.playlist.isPlaying) {
      player.playlist.pause()
    } else {
      player.playlist.play()
    }
  }
    
  return self;
}

//module.exports = VideoPlayer