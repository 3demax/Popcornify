// Load native UI library
gui = require('nw.gui'),

// Debug flag
isDebug = gui.App.argv.indexOf('--debug') > -1,
  
// browser window object
win = gui.Window.get(),

os = require('os'),
path = require('path'),
fs = require('fs'),
url = require('url'),

// i18n module (translations)
// i18n module (translations)
//i18n = require("i18n");

isWin = (process.platform === 'win32');
isLinux = (process.platform === 'linux');
isOSX = (process.platform === 'darwin');

VideoServer = require('./js/videoserver')
var videoServer = new VideoServer()

$(document).ready(function(){
  var playTorrent = function(torrent) {
    videoServer.playTorrent(torrent, function(href) {
     $('#vlc')[0].playlist.clear()
     $('#vlc')[0].playlist.add(href)
     $('#vlc')[0].playlist.play()
    })
  }
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