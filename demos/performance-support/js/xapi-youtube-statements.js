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
      var seeking = false;
      var prevTime = 0.0;

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
        console.log(seeking);
        switch(event.data) {
          case -1:
            e = "unstarted";
            log("yt: " + e);
            stmt = initializeVideo(ISOTime);
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
            prevTime = Date.now();
            setTimeout(function() {pauseVideo(ISOTime);}, 100);
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

      function initializeVideo(ISOTime) {
        var stmt = {};

        stmt.verb = {
          id: ADL.videoprofile.references.initialized['@id'],
          display: {"en-US": "initialized"}
        };

        return buildStatement(stmt);
      }

      function playVideo(ISOTime) {
        var stmt = {};
        /*if (competency) {
          stmt["context"] = {"contextActivities":{"other" : [{"id": "compID:" + competency}]}};
        }*/

        // calculate time from paused state
        var elapTime = (Date.now() - prevTime) / 1000.0;

        if (prevTime == 0.0 || elapTime > 0.075) {
          stmt.verb = {
            id: ADL.videoprofile.verbs.played['@id'],
            display: ADL.videoprofile.verbs.played.prefLabel
          };
          stmt.result = {"extensions":{"resultExt:resumed":ISOTime}};
        }
        else {
          seeking = true;
          return seekVideo(ISOTime);
        }

        return buildStatement(stmt);
      }

      function pauseVideo(ISOTime) {
        var stmt = {};

        // check for seeking
        if (!seeking) {
          stmt.verb = {
            id: ADL.videoprofile.verbs.paused['@id'],
            display: ADL.videoprofile.verbs.paused.prefLabel
          };
          stmt.result = {"extensions":{"resultExt:paused":ISOTime}};

          // manually send 'paused' statement because of interval delay
          stmt = buildStatement(stmt);
          if (stmt) {
            ADL.XAPIYoutubeStatements.onStateChangeCallback("paused", stmt);
          }
        }
        else {
          seeking = false;
        }

        /*if (competency) {
            stmt["context"] = {"contextActivities":{"other" : [{"id": "compID:" + competency}]}};
        }*/
      }

      function seekVideo(ISOTime) {
        var stmt = {};

        stmt.verb = {
          id: ADL.videoprofile.verbs.seeked['@id'],
          display: ADL.videoprofile.verbs.seeked.prefLabel
        }
        stmt.result = {"extensions":{"resultExt:seeked":ISOTime}};

        return buildStatement(stmt);
      }

      function completeVideo(ISOTime) {
        var stmt = {};

        stmt.verb = {
          id: ADL.videoprofile.references.completed['@id'],
          display: {"en-US": "completed"}
        }
        stmt.result = {"duration":ISOTime, "completion": true};
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
