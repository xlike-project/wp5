var cloudflag = true;

(function (namespace) {
  var cloudWidth = 268,
    cloudHeight = 140,
	
	recloudWidth = 900,
    recloudHeight = 500,
    
	Cloud = {};

  function getEntitiesMap(articleList) {
    var map = [];
    for(var i = 0; i < articleList.length; i ++) {
      if(articleList[i] == null)
        continue;
      var es = articleList[i].entities;
      for(var j = 0; j < es.length; j ++) {
        var uri = es[j].uri;
        for(var l = 0; l < entities.length; l ++) {
          if(uri == entities[l].uri) {
            var m = 0;
            for(; m < map.length; m ++) {
              if(map[m].uri == uri) {
                map[m].size += 1;
                break;
              }
            }//end m
            if(m > map.length - 1) {
              map[m] = {};
              map[m].uri = uri;
              map[m].text = entities[l].label;
              map[m].size = 1;
            }
          }//end if
        }//end l
      }//end j
    }//end i 
    return map;
  }
  
  function getSize(d) { return d.size; }

  function draw(words) {
	var div = document.getElementById('news_cloud');
	$(div).html("");
	if(words.length > 0){
		var fill = d3.scale.category10()
      .domain([d3.min(words, getSize), d3.max(words, getSize)]);
    d3.select("#news_cloud").select("svg").remove();
    d3.select("#news_cloud").append("svg")
      .attr("width", cloudWidth)
      .attr("height", cloudHeight)
      .append("g")
      .attr("transform", "translate(" + (cloudWidth/2) + "," + (cloudHeight/2) + ")")
      .selectAll("text")
      .data(words)
      .enter().append("text")
      .style("font", "Microsoft YaHei")
      .style("font-size", function(d) { return d.size + "px"; })
      .style("cursor", "hand")
      .attr("fill", function(d){ return fill(d.size); })
      .attr("text-anchor", "middle")
      .attr("transform", function(d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .text(function(d) { return d.text; })
      .on("click", function (d) { 
		$("#search").val(d.text);
		//alert("22222222");
		cloudflag = false;
		search(); 
	   });
	}else {
		$(div).html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
	}
	cloudflag = true;
  }
  
  function redraw(words){
	var div = document.getElementById('renews_cloud');
	$(div).html("");
	if(words.length > 0){
		var fill = d3.scale.category10()
      .domain([d3.min(words, getSize), d3.max(words, getSize)]);
	  
	d3.select("#renews_cloud").select("svg").remove();
    d3.select("#renews_cloud").append("svg")
      .attr("width", recloudWidth)
      .attr("height", recloudHeight)
      .append("g")
      .attr("transform", "translate(" + (recloudWidth/2) + "," + (recloudHeight/2) + ")")
      .selectAll("text")
      .data(words)
      .enter().append("text")
      .style("font", "Microsoft YaHei")
      .style("font-size", function(d) { return d.size + "px"; })
      .style("cursor", "hand")
      .attr("fill", function(d){ return fill(d.size); })
      .attr("text-anchor", "middle")
      .attr("transform", function(d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .text(function(d) { return d.text; })
      .on("click", function (d) { $("#search").val(d.text); search(); });
	}else {
		$(div).html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
	}
  }

  function update(data) {
    var fontSizeScale = d3.scale.linear()
      .domain([d3.min(data, getSize), d3.max(data, getSize)])
      .range([15, 25]);
    var rotateScale = d3.scale.ordinal()
      .domain([0, 1, 2, 3])
      .range([0, 90, 0, 270]);
    d3.layout.cloud().size([cloudWidth, cloudHeight])
      .words(data)
      //.uri(function(d) { return d.uri; })
      .rotate(function(d) { return rotateScale(d.size % 4); })
      .fontSize(function(d) { return ~~fontSizeScale(d.size); })
      .on("end", draw)
      .start();
  }
  
  function reupdate(data) {
    var fontSizeScale = d3.scale.linear()
      .domain([d3.min(data, getSize), d3.max(data, getSize)])
      .range([25, 35]);
    var rotateScale = d3.scale.ordinal()
      .domain([0, 1, 2, 3])
      .range([0, 100, 0, 280]);
    d3.layout.cloud().size([recloudWidth, recloudHeight])
      .words(data)
      //.uri(function(d) { return d.uri; })
      .rotate(function(d) { return rotateScale(d.size % 4); })
      .fontSize(function(d) { return ~~fontSizeScale(d.size); })
      .on("end", redraw)
      .start();
  }
  
  Cloud.updateByArticles = function (articleList) {
    var dat = getEntitiesMap(articleList);
    //dat = [{uri:"...", text: "Hello", size: 0.9}, ...];
    update(dat);
	
	reupdate(dat);
  };
  
  Cloud.updateByEntities = function (entityList) {
    var dat = [];
    for(var i in entityList) {
      var entity = entityList[i];
      var d = {};
      d.uri = entity.uri;
      d.text = entity.label;
      d.size = entityList.length - i;
      dat.push(d);
    }
    update(dat);
	
	reupdate(dat);
  };
  
  Cloud.updateByKeywords = function (keywords) {
    var dat = [];
	var redat = [];
	
    for(var i in keywords) {
      var word = keywords[i];
      var d = {};
      //d.uri = entity.uri;
      d.text = word.keyword;
      d.size = word.weight;
      dat.push(d);
      if(i == 20)
        break;
    }
	
	for(var i in keywords) {
      var word = keywords[i];
      var d = {};
      //d.uri = entity.uri;
      d.text = word.keyword;
      d.size = word.weight;
      redat.push(d);
	  
	  if(i == 50){
		break;
	  }
    }
    update(dat);
	reupdate(redat);
  };
  
  namespace.Cloud = Cloud;
})(org.xlike.thu);