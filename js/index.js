// browser window object
//win = gui.Window.get(),

// os object
os = require('os'),

// path object
path = require('path'),

// fs object
fs = require('fs'),

// url object
url = require('url'),

// TMP Folder
tmpFolder = path.join(os.tmpDir(), 'Popcornify'),

// i18n module (translations)
//i18n = require("i18n");

isWin = (process.platform === 'win32');
isLinux = (process.platform === 'linux');
isOSX = (process.platform === 'darwin');

var playTorrent = window.playTorrent = function (torrent) {
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
    buffer: (1.5 * 1024 * 1024).toString(),
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

$(document).ready(function(){
  $("#torrent-load").click(function(){
    var href = $("#torrent-source").val();
    if (href == null) { return }
      console.log('loading torrent', href)
      playTorrent(href)
    }
  })
})