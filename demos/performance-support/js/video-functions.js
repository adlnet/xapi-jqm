var video = "vPrtNzvDS5M"; // Change this to your video ID
// "global" variables read by ADL.XAPIYoutubeStatements
ADL.XAPIYoutubeStatements.changeConfig({
  "actor":  getActor(),
  "videoActivity": {"id":"https://www.youtube.com/watch?v=" + video, "definition":{"name": {"en-US":video}} }
});
function initYT() {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('How-to-make-french-toast-xapi-jqm-video', {
    height: '190',
    width: '300',
    videoId: video,
    playerVars: { 'autoplay': 0 },
    events: {
      'onReady': ADL.XAPIYoutubeStatements.onPlayerReady,
      'onStateChange': ADL.XAPIYoutubeStatements.onStateChange
    }
  });
}

initYT();

/*
 * Custom Callbacks
 */
ADL.XAPIYoutubeStatements.onPlayerReadyCallback = function(stmt) {
  console.log("on ready callback");
}
// Dispatch Youtube statements with XAPIWrapper
ADL.XAPIYoutubeStatements.onStateChangeCallback = function(event, stmt) {
  console.log(stmt);
  if (stmt) {
    stmt['timestamp'] = (new Date()).toISOString();
    ADL.XAPIWrapper.sendStatement(stmt, function(){});
  } else {
    console.warn("no statement found in callback for event: " + event);
  }
}