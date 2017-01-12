(function(ADL){

    var debug = true;
    var log = function(message)
    {
      if (!debug) return false;
      try
      {
        console.log(message);
        return true;
      }
      catch(e) { return false; }
    }

    XAPIYoutubeStatements = function() {

      var actor = {"mbox":"mailto:anon@example.com", "name":"anonymous"};
      var videoActivity = {};
      var started = false;

      this.changeConfig = function(options) {
        actor = options.actor;
        videoActivity = options.videoActivity;
      }

      this.onPlayerReady = function(event) {
        var message = "yt: player ready";
        log(message);
        ADL.XAPIYoutubeStatements.onPlayerReadyCallback(message);
      }

      this.onStateChange = function(event) {
        var curTime = player.getCurrentTime().toString();
        var ISOTime = "PT" + curTime.slice(0, curTime.indexOf(".")+3) + "S";
        var stmt = null;
        var e = "";
        switch(event.data) {
          case -1:
            e = "unstarted";
            log("yt: " + e);
            stmt = playVideo(ISOTime);
            break;
          case 0:
            e = "ended";
            log("yt: " + e);
            stmt = completeVideo(ISOTime);
            break;
          case 1:
            e = "playing";
            log("yt: " + e);
            stmt = playVideo(ISOTime);
            break;
          case 2:
            e = "paused";
            log("yt: " + e);
            stmt = pauseVideo(ISOTime);
            break;
          case 3:
            e = "buffering";
            log("yt: " + e);
            break;
          case 5:
            e = "cued";
            log("yt: " + e);
            break;
          default:
        }
        if (stmt){
          ADL.XAPIYoutubeStatements.onStateChangeCallback(e, stmt);
        }
      }

      function buildStatement(stmt) {
        if (stmt){
          var stmt = stmt;
          stmt.actor = actor;
          stmt.object = videoActivity;          
        }
        return stmt;
      }

      var convertISOSecondsToNumber = function(time) { return Number(time.slice(2, -1)); };

      function playVideo(ISOTime) {
        var stmt = {};
        /*if (competency) {
          stmt["context"] = {"contextActivities":{"other" : [{"id": "compID:" + competency}]}};
        }*/

        if (convertISOSecondsToNumber(ISOTime) == 0) {
          // stmt.verb = ADL.verbs.launched;
          if (!started){
            stmt.verb = ADL.verbs.initialized;
            started = true;            
          }
          else {
            stmt = null;
          }
        } else {
          if (!started) {
            stmt.verb = ADL.verbs.resumed;
            stmt.result = {"extensions":{"resultExt:resumed":ISOTime}};
            started = false;
          }
          else{
            stmt = null;
          }
        }
        return buildStatement(stmt);
      }

      function pauseVideo(ISOTime) {
        var stmt = {};

        started = false;
        stmt.verb = ADL.verbs.suspended;
        stmt.result = {"extensions":{"resultExt:paused":ISOTime}};

        /*if (competency) {
            stmt["context"] = {"contextActivities":{"other" : [{"id": "compID:" + competency}]}};
        }*/
        return buildStatement(stmt);
      }

      function completeVideo(ISOTime) {
        var stmt = {};

        // stmt.verb = ADL.verbs.completed;
        stmt.verb = {"id": "http://adlnet.gov/expapi/verbs/watched", "display":{"en-US": "watched"}}
        stmt.result = {"duration":ISOTime, "completion": true};
        started = false;
        /*if (competency) {
            stmt["context"] = {"contextActivities":{"other" : [{"id": "compID:" + competency}]}};
        }*/
        return buildStatement(stmt);
      }

    }

    ADL.XAPIYoutubeStatements = new XAPIYoutubeStatements();

    ADL.XAPIYoutubeStatements.onPlayerReadyCallback = function(message) {};
    ADL.XAPIYoutubeStatements.onStateChangeCallback = function(stmt) {};

}(window.ADL = window.ADL || {}));
