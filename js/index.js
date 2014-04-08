// Load native UI library
gui = require('nw.gui'),

// Debug flag
isDebug = gui.App.argv.indexOf('--debug') > -1,
  
// browser window object
win = gui.Window.get(),

// os object
os = require('os'),

// path object
path = require('path'),

// fs object
fs = require('fs'),

// url object
url = require('url'),

// TMP Folder
tmpFolder = path.join(os.tmpDir(), 'Popcornify')
if (!fs.exists(tmpFolder)) {
  fs.mkdir(tmpFolder)
}
console.log(tmpFolder)

// i18n module (translations)
//i18n = require("i18n");

isWin = (process.platform === 'win32');
isLinux = (process.platform === 'linux');
isOSX = (process.platform === 'darwin');

var VideoServer = (function () {
    var instance;
  
    return function Construct_singletone() {
        if (instance) {
            return instance;
        }
        if (this && this.constructor === Construct_singletone) {
            instance = this;
        } else {
            return new Construct_singletone();
        }
    };
}());

var playTorrent = window.playTorrent = function (torrent) {
  //TODO fix running two torrents at a time
  //TODO check for temporary folder. create if not exists
  console.log(torrent);
  //videoStreamer ? $(document).trigger('videoExit') : null;

  // Create a unique file to cache the video (with a microtimestamp) to prevent read conflicts
  var tmpFilename = ( torrent.toLowerCase().split('/').pop().split('.torrent').shift() ).slice(0,100);
  tmpFilename = tmpFilename.replace(/([^a-zA-Z0-9-_])/g, '_') + '.mp4';
  var tmpFile = path.join(tmpFolder, tmpFilename);
  
  // Start Popcornflix (Peerflix)
  var popcornflix = require('peerflix');
  
  videoStreamer = popcornflix(torrent, {
    // Set the custom temp file
    path: tmpFile,
    //port: 554,
    buffer: (3 * 1024 * 1024).toString(),
    connections: 100
  }, function (err, flix) {
    if (err) throw err;

    var started = Date.now(),
      loadedTimeout;

    flix.server.on('listening', function () {
      var href = 'http://127.0.0.1:' + flix.server.address().port + '/';

      console.log('href', href)
//      $('section.main video').attr('src', href);
      
      $('#vlc')[0].playlist.clear()
      $('#vlc')[0].playlist.add(href)
      $('#vlc')[0].playlist.play()
      
      /*loadedTimeout ? clearTimeout(loadedTimeout) : null;

      var checkLoadingProgress = function () {

        var now = flix.downloaded,
          total = flix.selected.length,
        // There's a minimum size before we start playing the video.
        // Some movies need quite a few frames to play properly, or else the user gets another (shittier) loading screen on the video player.
          targetLoadedSize = MIN_SIZE_LOADED > total ? total : MIN_SIZE_LOADED,
          targetLoadedPercent = MIN_PERCENTAGE_LOADED * total / 100.0,

          targetLoaded = Math.max(targetLoadedPercent, targetLoadedSize),

          percent = now / targetLoaded * 100.0;

        if (now > targetLoaded) {
          if (typeof window.spawnVideoPlayer === 'function') {
            window.spawnVideoPlayer(href, subs, movieModel);
          }
          if (typeof callback === 'function') {
            callback(href, subs, movieModel);
          }
        } else {
          typeof progressCallback == 'function' ? progressCallback( percent, now, total) : null;
          loadedTimeout = setTimeout(checkLoadingProgress, 500);
        }
      };
      checkLoadingProgress();


      $(document).on('videoExit', function() {
        if (loadedTimeout) { clearTimeout(loadedTimeout); }

        // Keep the sidebar open
        $("body").addClass("sidebar-open").removeClass("loading");

        // Stop processes
        flix.clearCache();
        flix.destroy();
        videoStreamer = null;

        // Unbind the event handler
        $(document).off('videoExit');

        delete flix;
      });*/
    });
  });  
}

var VideoPlayer = function (opts) {
  var self = this;
  var opts = opts || {};
  var player = opts.mediaElement || null;
  var controls = $(opts.controlElement) || null;
  console.log("player", player, controls);
  
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

$(document).ready(function(){
  $("#torrent-load").click(function(){
    var href = $("#torrent-source").val();
    if (href != "") {
      console.log('loading torrent', href)
      playTorrent(href)
    }
  })
  
  $('.b-open input').on('change', function(e){
    var path = $(this).val();
    console.log("path", path);
    $("#torrent-source").val(path);
    playTorrent(path)
  })
  $(".torrent-open").click(function(){
    console.log('open click');
    $('.b-open input').click();
  });
  
  var player = new VideoPlayer({'mediaElement': $('#vlc')[0], 'controlElement': $('.b-videoplayer-controls')});
  
})