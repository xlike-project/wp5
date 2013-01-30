/**
 *
 */
(function(namespace) {

  var icons = ["hot.png", "hot32.png", "hot48.png"],
    
    currentMarkers = [],
    visibleInfoWin = [],
    Map = {
      map: null,
      geocoder: null
    };

  Map.update = function(articleList) {
    drawMarkers(sortArticleByLocation(articleList), articleList.length);
  };

  function getLinkListHtml(articles) {
    var html = "<ul>";
    for(i in articles) {
      var a = "<li><a target=_blank ";
      if(articles[i].related)
        a += "style='color:gray;' ";
      a += "href='" 
        + articles[i].url + "'>" 
        + "&gt;&nbsp;" + articles[i].title
        + " (<i>FROM: " + articles[i].source + "</i>)"
        + "</a></li>";
      html += a;
    }
    html += "</ul>";
    return html;
  };
  
  Map.closeAllInfoWin = function() {
    for(i in visibleInfoWin)
      visibleInfoWin[i].close();
    visibleInfoWin = [];
  };

  function sortArticleByLocation(articleList) {
    var locMap = [];
    for(i in articleList) {
      var article = articleList[i];
      if(article == null)
        continue;
      var j = 0;
      var loc = "";
      loc = article.country;
      if(article.city != null && article.city != "")
        loc = article.city + "," + loc;
      for(; j < locMap.length; j ++) {
        if(locMap[j].loc.toLowerCase() == loc.toLowerCase()) {
          locMap[j].articles.push(article);
          break;
        }
      }
      if(j > locMap.length - 1) {
        var newLoc = {};
        newLoc.loc = loc;
        newLoc.location = article.location;
        newLoc.articles = [].concat(article);
        locMap.push(newLoc);
      }
    }
    return locMap;
  }

  function createMarker(latlng, title, articles, scale) {
    //var unit = Math.floor(total / 3);
    //var scale = Math.floor(articles.length / unit) + 1;
    var iconFile = "images/" + icons[scale];
    var icon = new google.maps.MarkerImage(iconFile);
    var size = 16 * (scale + 1);
    icon.scaledSize = new google.maps.Size(size, size);
    icon.anchor = new google.maps.Point(size / 2, size / 2);
    var marker = new google.maps.Marker({
        icon: icon,
        map: Map.map,
        position: latlng,
        title: title + ", " + articles.length + " article(s)."
      });
    //marker.value = number;
    var myHtml = getLinkListHtml(articles);
    var infowindow = new google.maps.InfoWindow({
      content: myHtml
    });
    google.maps.event.addListener(marker,"click", function() {
      //var myHtml = "<b>#" + number + "</b><br/>" + message[number -1];
      settingsHide();
      infowindow.open(Map.map, marker);
      visibleInfoWin.push(infowindow);
    });
    return marker;
  }

  function drawMarkers(locMap, total) {
    //remove all current markers from map
    if(currentMarkers) {
      for(i in currentMarkers)
        currentMarkers[i].setMap(null);
      currentMarkers.length = 0;
    }
    
    //add new markers to map
    // commented because of google map api loading failure
    var getCount = function (d) {
      return d.articles.length;
    };
    var sizeScale = d3.scale.linear()
      .domain([d3.min(locMap, getCount), d3.max(locMap, getCount)])
      .rangeRound([0, 1, 2]);
    for (var i = 0; i < locMap.length; i++) {
      /*
      (function(i) {
        if(Map.geocoder)
          Map.geocoder.geocode({ 'address': locMap[i].loc }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              var marker = createMarker(
                results[0].geometry.location, 
                results[0].formatted_address, 
                locMap[i].articles,
                total);
              currentMarkers.push(marker);
            }
          });
      })(i);
      */
      var marker = createMarker(
        new google.maps.LatLng(locMap[i].location[0], locMap[i].location[1]),
        locMap[i].loc, 
        locMap[i].articles,
        sizeScale(locMap[i].articles.length));
      currentMarkers.push(marker);
    }
  }
  namespace.Map = Map;
})(org.xlike.thu);

function initialize() {
  var mapOptions = {
    zoom: 2,
    center: new google.maps.LatLng(40, 30),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: true
  };
  
  org.xlike.thu.Map.map = new google.maps.Map(document.getElementById("map"), mapOptions);
  org.xlike.thu.Map.geocoder = new google.maps.Geocoder();
  //drawMarkers(sortArticleByLocation(articles));
  google.maps.event.addListener(org.xlike.thu.Map.map,"click", function() {
    org.xlike.thu.Map.closeAllInfoWin();
  });
  
  loadDefault();
}

function loadScript() {
  script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyAt_fSm9zCSNOzjitnPyLQlbVeoIvffWk8&sensor=false&language=en&callback=initialize";
  document.body.appendChild(script);
}
window.onload = loadScript;
