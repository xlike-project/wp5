/**
 *
 */
Module.import(org.xlike.thu);
var mintopNum = 8;
var maxtopNum = 20;
var pageSize = 10;

(function(namespace) {
  var timelineData = []
    timelineHeader = [['Date']];
  // Load the Visualization API and the piechart package.
  if(typeof google == "undefined")
    alert("Oops, fail to load google library...");
    
  if(Common.doChart())
    google.load('visualization', '1.0', {'packages':['corechart']});

  // Set chart options
  var colOptions = {width:268,
         height:140,
             legend:{ position:'none' },
         vAxis:{ minValue: 0 },
         curveType:'function',
		 hAxis:{slantedText: true},
         pointSize:3,
             chartArea:{left:50,top:8,width:'90%',height:'60%'}
        },
    pieOptions = {width:268,
         height:150,
             chartArea:{left:50,top:10,width:'90%',height:'80%'}
        },
    articles = [];
    Chart = {};
	
	var recolOptions = {width:900,
         height:210,
             legend:{ position:'none' },
         vAxis:{ minValue: 0 },
         curveType:'function',
		 hAxis:{slantedText: true},
         pointSize:3,
             chartArea:{left:80,top:8,width:'95%',height:'50%'}
        };
    var repieOptions = {width:450,
         height:400,
             chartArea:{left:80,top:8,width:'95%',height:'100%'}
        };
		
	var timelineOptions = {
				//width:1168,
				width: 790,
				height: 150,
				fontSize: 9,
				title: 'TimeTrend',
				hAxis: {
					title: '',
					logScale: true,
					slantedText: true
				},
				legend: {
					position: 'top',
					textStyle: {
						color: 'black',
						fontSize: 9
					}
				},
				lineWidth: 1,
				tooltip: {
					textStyle: {
						color: 'green'
					},
					showColorCode: true
				},
				vAxis: {
					gridlines: {
						count: 3
					}
				},
				chartArea:{left:55,top:8,right:10,width:'90%',height:'40%'}
			};	
		
	var retimelineOptions = {
			width:900,
			height:210,
			fontSize: 9,
			title: 'TimeTrend',
			hAxis: {
				title: '',
				logScale: true,
				slantedText: true,
				viewWindowMode: 'pretty'
			},
			legend: {
				position: 'top',
				textStyle: {
					color: 'black',
					fontSize: 9
				}
			},
			lineWidth: 1,
			tooltip: {
				textStyle: {
					color: 'green'
				},
				showColorCode: true
			},
			vAxis: {
				gridlines: {
					count: 4
				}
			},
			chartArea:{left:80,top:8,width:'94%',height:'50%'}
		};	
		
		
  // Callback that creates and populates a data table,
  // instantiates the pie chart, passes in the data and
  // draws it.
  Chart.update_old = function(label, articleList) {
    try{
      //articles = articleList;
      drawAgencyChart(articleList);
      drawLanguageChart(articleList);
      //drawTimeChart(label,articleList);
	  
	  addTimeline(label,articleList);
      //drawNewsChart();
    } catch (e) {
      Common.hideLoading();
    }
  };
  
  Chart.update = function(label,articleList,sourceList,datesList,url) {
    try{
      //articles = articleList;
      //drawAgencyChart(articleList);
	  drawAgencyChartSources(sourceList);
	  redrawAgencyChartSources(sourceList,url);  
	  
      drawLanguageChart(articleList);
	  redrawLanguageChart(articleList,url);
	  
      //drawTimeChart(label, articleList);
	  //drawTimeChart(label, datesList);
	  //drawTimeChartDates(label, datesList);
	  addTimeline(label,datesList,url);
	  readdTimeline(label, datesList,url);
      //drawNewsChart();
    } catch (e) {
      Common.hideLoading();
    }
  };
  
   Chart.updateByQuery = function (data, label, url) {
    try {
      var articles = data.articles;
	  var sources = data.sources;		  
	  var dates = data.dates;
	  
      if(data.related) {
        for(var i in data.related) {
          articles = articles.concat(data.related[i].articles);
        }
      }
	  
	  //alert("url :" + url);
	  //document.write(url);
      if(data.sources){
        drawSourceChart(sources);
		redrawAgencyChartSources(sources,url);  
      }else{ 
	    drawAgencyChart(articles);
		redrawAgencyChartSources(sources,url);  
	  }
		
      drawLanguageChart(articles);
	  redrawLanguageChart(articles,url);
        //drawTimeChart(label, dates);
		//drawTimeChartDates(label, dates);
		//redrawTimeChartDates(label, dates,url);
	  addTimeline(label,dates,url);
	  readdTimeline(label, dates,url);
    } catch (e) {
      Common.hideLoading();
    }
  };
  
  Chart.updateByQuery_old = function (data, label) {
    try {
      var articles = data.articles;
      if(data.related) {
        for(var i in data.related) {
          articles = articles.concat(data.related[i].articles);
        }
      }
      if(data.sources)
        drawSourceChart(data.sources);
      else 
	    drawAgencyChart(articles);
        drawLanguageChart(articles);
        //drawTimeChart(label, articles);
		addTimeline(label,datesList);
	    //readdTimeline(label, datesList);
    } catch (e) {
      Common.hideLoading();
    }
  };
  
  Chart.getArticles = function() {
    return articles;
  };
  
  function sortArticlesByPublisher(articleList) {
    var pubMap = [];
    for(i in articleList) {
      var article = articleList[i];
      if(article == null)
        continue;
      var j = 0;
      for(; j < pubMap.length; j ++) {
        if(pubMap[j][0] == article.source) {
          pubMap[j][1] += 1;
          break;
        }
      }
      if(j > pubMap.length - 1) {
        var newPub = [];
        newPub[0] = article.source;
        newPub[1] = 1;
        pubMap.push(newPub);
      }
    }
    pubMap = pubMap.sort(function (a, b) {
      return b[1] - a[1];
    });
    //if(pubMap.length > 5)
    //  return pubMap.slice(0, 5);
    return pubMap.slice(0, 10);
  }

  function drawAgencyChart(articleList) {
    // Instantiate and draw our chart, passing in some options.
    var div = document.getElementById('agency_chart');
    //clear all children elements
    while(div.hasChildNodes())
      div.removeChild(div.firstChild);
    // Create the data table.
    var header = [["Publisher", "Articles"]];
    var pubMap = sortArticlesByPublisher(articleList);
	alert(pubMap.length);
    if(pubMap.length > 0) {
      header = header.concat(pubMap);
      var data = google.visualization.arrayToDataTable(header);
      //add chart element
      var chart = new google.visualization.ColumnChart(div);
      chart.draw(data, colOptions);
    } else {
      $(div).html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
    }
  }
  
  function getChartData(articleList){
	var dataArray = new Array();
	if(articleList.length > 0){
		for(var i in  articleList){
			var itemArray = new Array();
			itemArray[0] = articleList[i].source;
			itemArray[1] = articleList[i].count;
			dataArray.push(itemArray);
		}
	}
	return dataArray;
  }
  
  function getChartSourcesData(articleList){
	var dataArray = new Array();
	if(articleList.length > 0){
		for(var i in  articleList){
			var itemArray = new Array();
			itemArray[0] = articleList[i].uri;
			itemArray[1] = articleList[i].source;
			itemArray[2] = articleList[i].count;
			dataArray.push(itemArray);
		}
	}
	return dataArray;
  }
  
  function drawAgencyChartSources(articleList){
	var div = document.getElementById('agency_chart');
	while(div.hasChildNodes())
      div.removeChild(div.firstChild);
	  
	var dataTable = new google.visualization.DataTable();
	dataTable.addColumn('string', 'Publisher');
	dataTable.addColumn('number', 'Articles');
	
	var dataArray = getChartData(articleList);
	
	if(dataArray.length > 0){
		if(dataArray.length > mintopNum){
			dataArray = dataArray.slice(0,mintopNum);
		}	
	
		dataTable.addRows(dataArray);
		var chart = new google.visualization.ColumnChart(div);
		chart.draw(dataTable, colOptions);
	}else {
		$(div).html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
	}
  }
   
  function redrawAgencyChartSources(articleList,url){
	var div = document.getElementById('rechart_agency');
	while(div.hasChildNodes())
      div.removeChild(div.firstChild);
	  
	var dataTable = new google.visualization.DataTable();
	dataTable.addColumn('string', 'Publisher');
	dataTable.addColumn('number', 'Articles');
	
	var dataArray = getChartData(articleList);
	var sourcesArray = getChartSourcesData(articleList);
	
	if(dataArray.length > 0){
		if(dataArray.length > maxtopNum){
			dataArray = dataArray.slice(0,maxtopNum);
		}	
	
		dataTable.addRows(dataArray);
		var chart = new google.visualization.ColumnChart(div);
		chart.draw(dataTable, recolOptions);
		
		google.visualization.events.addListener(chart, 'select', function(){
			var selectArray = sourcesArray[chart.getSelection()[0].row];
			var sourcesname = selectArray[0];
			var articlesum = selectArray[2];
			
			url = getSourcesUrl(url,sourcesname);
			var totalPage = getTotalPageNum(articlesum);
			getchartarticle(url,totalPage,"#top_article_agency");
		});
	}else {
		$(div).html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
	}
  }
  
  function drawSourceChart(sources) {
	var div = document.getElementById('agency_chart');
    // Create the data table.
	if(sources.length > 0){
		var header = [["Publisher", "Articles"]];
		var pubMap = [];
		var other = 0;
		for(var i in sources) {
		  if(i < 10) {
			var newPub = [];
			newPub[0] = sources[i].source;
			newPub[1] = sources[i].count;
			pubMap.push(newPub);
		  } else {
			other += sources[i].count;
		  }
		}
		var newPub = [];
		newPub[0] = 'Others';
		newPub[1] = other;
		//pubMap.push(newPub);
    
		var data = google.visualization.arrayToDataTable(header.concat(pubMap));

		// Instantiate and draw our chart, passing in some options.
		
		//clear all children elements
		while(div.hasChildNodes())
		  div.removeChild(div.firstChild);
		//add chart element
		var chart = new google.visualization.ColumnChart(div);
		//var chart = new google.visualization.AreaChart(div);
		chart.draw(data, colOptions);
	}else {
		$(div).html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
	}
  }

  function sortArticlesByLanguage(articleList) {
    var lanMap = [];
    for(i in articleList) {
      var article = articleList[i];
      if(article == null)
        continue;
      var j = 0;
      for(; j < lanMap.length; j ++) {
        if(lanMap[j][0] == article.language) {
          lanMap[j][1] += 1;
          break;
        }
      }
      if(j > lanMap.length - 1) {
        var newLan = [];
        newLan[0] = article.language;
        newLan[1] = 1;
        lanMap.push(newLan);
      }
    }
    lanMap = lanMap.sort(function (a, b) {
      return b[1] - a[1];
    });
    //if(lanMap.length > 5)
    //  return lanMap.slice(0, 5);
    return lanMap;
  }

  function drawLanguageChart(articleList) {
    // Instantiate and draw our chart, passing in some options.
    //clear all children elements
    var div = document.getElementById('lang_chart');
    while(div.hasChildNodes())
      div.removeChild(div.firstChild);
    // Create the data table.
    var header = [["Language", "Articles"]];
    var lanMap = sortArticlesByLanguage(articleList);
    if(lanMap.length > 0) {
      var data = google.visualization.arrayToDataTable(header.concat(lanMap));
      var chart = new google.visualization.PieChart(div);
      chart.draw(data, pieOptions);
    } else {
      $(div).html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
    }
  }

  function redrawLanguageChart(articleList,url) {
    // Instantiate and draw our chart, passing in some options.
    //clear all children elements
    var div = document.getElementById('rechart_lang');
    while(div.hasChildNodes())
      div.removeChild(div.firstChild);
    // Create the data table.
    var header = [["Language", "Articles"]];
    var lanMap = sortArticlesByLanguage(articleList);
    if(lanMap.length > 0) {
      var data = google.visualization.arrayToDataTable(header.concat(lanMap));
      var chart = new google.visualization.PieChart(div);
      chart.draw(data, repieOptions);
	  
	  google.visualization.events.addListener(chart, 'select', function(){
			var selectArray = lanMap[chart.getSelection()[0].row];
			var langname = selectArray[0];
			var articlesum = selectArray[1];
			
			url = getLangUrl(url,"&lang=" + langname);

			var totalPage = getTotalPageNum(articlesum);
			getchartarticle(url,totalPage,"#top_article_lang");
		});
    } else {
      $(div).html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
    }
  }
  
  function getShortDate(longDate) {
    var s = longDate.substring(11, 16);
    //while(s.charAt(0) == '0')
    //  s = s.substring(1);
    return s;
  }

  function sortArticlesByDate(articleList) {
    var datMap = [];
    for(var i in articleList) {
      var article = articleList[i];
      if(article == null)
        continue;
      var j = 0;
      //var time = getShortDate(article.date);
      //var time = article.date;
	  var time = article.interval;
      for(; j < datMap.length; j ++) {
        if(datMap[j][0] == time) {
          datMap[j][1] += 1;
          break;
        }
      }
      if(j > datMap.length - 1) {
        var newLan = [];
        newLan[0] = time;
        newLan[1] = 1;
        datMap.push(newLan);
      }
    }
    datMap = datMap.sort(function (a, b) {
      return a[0] > b[0] ? 1 : -1;
    });
    return datMap;
  }
  
  function shortenDateStr(datMap) {
    var ret = [];
    var last = "-1";
    for(var i in datMap) {
      ret[i] = [];
      var time = datMap[i][0];
      if((time.substring(0, 10) != last) || (i == datMap.lenght - 1)) {
        //ret[i][0] = getShortDate(time);
        ret[i][0] = time;
      } else ret[i][0] = getShortDate(time);
      for(var j = 1; j < datMap[i].length; j ++) {
        ret[i][j] = datMap[i][j];
      }
      last = time.substring(0, 10);
    }
    return ret;
  }

  function merge(origin, data) {
  /*
    var articles = data.articles;
	
    if(data.related) {
      for(var i in data.related) {
        articles = articles.concat(data.related[i].articles);
      }
    }
	*/
	alert("before :" + "data.label :" + JSON.stringify(origin));
	
	var articles = data.dates;
    var datMap = sortArticlesByDate(articles);
	
	alert("after :" + "data.label :" + JSON.stringify(articles));
    var i = 0,       // index for origin
      j = 0,      // index for datMap
      l = 0,      // index for result array
      ret = [];    // result date-value array
    while(i < origin.length && j < datMap.length) {
      if(origin[i][0] == datMap[j][0]) {    // date strings equal
        ret[l] = [].concat(origin[i]);
        ret[l].push(datMap[j][1]);
        i ++;
        j ++;
      } else if(origin[i][0] < datMap[j][0]) {    //date strings not equal, the origin less
        ret[l] = [].concat(origin[i]);
        ret[l].push(0);
        i ++;
      } else if(origin[i][0] > datMap[j][0]) {    //date strings not equal, the datMap greater
        ret[l] = [datMap[j][0]];
        for(var m = 0; m < origin[0].length - 1; m ++) {
          ret[l].push(0);
        }
        ret[l].push(datMap[j][1]);
        j ++;
      }
      l ++;
    }
    if(i == origin.length) {  // origin complete first
      for(;j < datMap.length; j ++) {
        ret[l] = [datMap[j][0]];
        if(origin.length > 0) {
          for(var m = 0; m < origin[0].length - 1; m ++) {
            ret[l].push(0);
          }
        }
        ret[l].push(datMap[j][1]);
        l ++;
      }
    }
    if(j == datMap.length) {  // datMap complete first
      for(;i < origin.length; i ++) {
        ret[l] = [].concat(origin[i]);
        ret[l].push(0);
        l ++;
      }
    }
    return ret;
  }
  
  function drawMultiTimeLineChart(chartData,divid,chartoptions){
	var titleArray = chartData.titleArray;
	var dataArray = chartData.dataArray;

	if(titleArray.length > 1 && dataArray.length > 0){
		var dataTable = new google.visualization.DataTable();
		dataTable.addColumn('string', 'date');
		for(var i = 1;i < titleArray.length;i ++){
			dataTable.addColumn('number', titleArray[i]);
		}
		dataTable.addRows(dataArray);

		var chart = new google.visualization.AreaChart(document.getElementById(divid));
		chart.draw(dataTable, chartoptions);
		
		google.visualization.events.addListener(chart, 'select', function(){
			var selectArray = dataArray[chart.getSelection()[0].row];
			var date = selectArray[0];
			var articlesum = selectArray[chart.getSelection()[0].column];
			//replace pagesize=10 £¬add Date 
			var i = 0;
			for(key in linemap){
				if(chart.getSelection()[0].column == (i + 1)){
					url = linemap[key].url;
					break;
				}
				i ++;
			}
			alert("url :" + url);
			url = url.replace(/&ts=[0-9]{1,}d/g,"");
			
			url = getDateUrl(url,date);
			//url = url.replace(/&callback=[\s\S]{1,}&/,"&calback=&");
			var totalPage = getTotalPageNum(articlesum);
			
			getchartarticle(url,totalPage,"#top_article_time");
		});
	}else {
		//$("#time_chart").html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
		var div = "#" + divid;
		$(div).html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
		$("#top_article_time").html("");
	}
  }
  
  Chart.removeTimeline = function(label) {
	delete linemap[label]; 
	var chartData = getChartDataArray();
	var divid = "time_chart";
	drawMultiTimeLineChart(chartData,divid,timelineOptions);
  };
  
  Chart.removereTimeline = function(label) {
	delete linemap[label]; 
	var chartData = getChartDataArray();
	var divid = "retime_chart";
	drawMultiTimeLineChart(chartData,divid,retimelineOptions);
  };
  
  function addTimeline(label,dates,url) {
	var datatempArray = dates;
	var keyword = label;
	var keywordDataArray = getKeywordDataFromUrl(datatempArray);
	var allKeywordDataArray = getKeywordData(allDateArray,keywordDataArray);
	linemap[keyword] = new chartMapData(url,allKeywordDataArray);
	
	var chartData = getChartDataArray();
	//drawMultiTimeLineChart(chartData,divid,timelineOptions,url);
	var titleArray = chartData.titleArray;
	var dataArray = chartData.dataArray;
	var div = document.getElementById("time_chart");
	/*
	while(div.hasChildNodes())
      div.removeChild(div.firstChild);
	  */
	$(div).html("");
	//alert(titleArray.length);
	if(titleArray.length > 1 && dataArray.length > 0){
		var dataTable = new google.visualization.DataTable();
		dataTable.addColumn('string', 'date');
		for(var i = 1;i < titleArray.length;i ++){
			dataTable.addColumn('number', titleArray[i]);
		}
		dataTable.addRows(dataArray);

		var chart = new google.visualization.AreaChart(div);
		chart.draw(dataTable, timelineOptions);
	}else {
		//$("#time_chart").html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
		$(div).html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
	}
  }
  
  function readdTimeline(label,dates,url) {
	var chartData = getChartDataArray();
	var titleArray = chartData.titleArray;
	var dataArray = chartData.dataArray;

	var div = document.getElementById("retime_chart");
	/*
	while(div.hasChildNodes())
      div.removeChild(div.firstChild);
	*/
	$(div).html("");
	if(titleArray.length > 1 && dataArray.length > 0){
		var dataTable = new google.visualization.DataTable();
		dataTable.addColumn('string', 'date');
		for(var i = 1;i < titleArray.length;i ++){
			dataTable.addColumn('number', titleArray[i]);
		}
		dataTable.addRows(dataArray);
		var chart = new google.visualization.AreaChart(div);
		chart.draw(dataTable, retimelineOptions);
		
		google.visualization.events.addListener(chart, 'select', function(){
			if(JSON.stringify(chart.getSelection()) != "[]"){
				var selectArray = dataArray[chart.getSelection()[0].row];
				var date = selectArray[0];
				var articlesum = selectArray[chart.getSelection()[0].column];

				//replace pagesize=10 £¬add Date 
				var i = 0;
				for(key in linemap){
					if(chart.getSelection()[0].column == (i + 1)){
						url = linemap[key].url;
						break;
					}
					i ++;
				}
				
				url = url.replace(/&ts=[0-9]{1,}d/g,"");
				url = getDateUrl(url,date);
				//url = url.replace(/&callback=[\s\S]{1,}&/,"&calback=&");
				var totalPage = getTotalPageNum(articlesum);
				
				getchartarticle(url,totalPage,"#top_article_time");
			}
		});
	}else {
		//$("#time_chart").html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
		$(div).html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
	}
  }
  
  //Chart.addTimeline= function(data) {
  Chart.addTimeline= function(label,dates,url) {
	var datatempArray = dates;
	var keyword = label;
	
	var keywordDataArray = getKeywordDataFromUrl(datatempArray);
	var allKeywordDataArray = getKeywordData(allDateArray,keywordDataArray);
	linemap[keyword] = new chartMapData(url,allKeywordDataArray);
	
	var chartData = getChartDataArray();
	var div = document.getElementById("time_chart");
	while(div.hasChildNodes())
      div.removeChild(div.firstChild);
	
	var titleArray = chartData.titleArray;
	var dataArray = chartData.dataArray;
	if(titleArray.length > 1 && dataArray.length > 0){
		var dataTable = new google.visualization.DataTable();
		dataTable.addColumn('string', 'date');
		for(var i = 1;i < titleArray.length;i ++){
			dataTable.addColumn('number', titleArray[i]);
		}
		dataTable.addRows(dataArray);

		var chart = new google.visualization.AreaChart(div);
		chart.draw(dataTable, timelineOptions);
	}else {
		//$("#time_chart").html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
		$(div).html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
	}
  };
  
  Chart.readdTimeline= function(label,dates,url) {
	var chartData = getChartDataArray();
	var div = document.getElementById("retime_chart");
	while(div.hasChildNodes())
      div.removeChild(div.firstChild);
	  
	var titleArray = chartData.titleArray;
	var dataArray = chartData.dataArray;
	
	if(titleArray.length > 1 && dataArray.length > 0){
		var dataTable = new google.visualization.DataTable();
		dataTable.addColumn('string', 'date');
		for(var i = 1;i < titleArray.length;i ++){
			dataTable.addColumn('number', titleArray[i]);
		}
		dataTable.addRows(dataArray);

		var chart = new google.visualization.AreaChart(div);
		chart.draw(dataTable, retimelineOptions);
		
		google.visualization.events.addListener(chart, 'select', function(){
			if(JSON.stringify(chart.getSelection()) != "[]"){
				var selectArray = dataArray[chart.getSelection()[0].row];
				var date = selectArray[0];
				var articlesum = selectArray[chart.getSelection()[0].column];

				var i = 0;
				for(key in linemap){
					if(chart.getSelection()[0].column == (i + 1)){
						url = linemap[key].url;
						break;
					}
					i ++;
				}
				
				url = url.replace(/&ts=[0-9]{1,}d/g,"");
				url = getDateUrl(url,date);
				//url = url.replace(/&callback=[\s\S]{1,}&/,"&calback=&");
				var totalPage = getTotalPageNum(articlesum);
				getchartarticle(url,totalPage,"#top_article_time");
			}
		});
	}else {
		//$("#time_chart").html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
		$(div).html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
	}
  };
  
  Chart.addTimeline_old = function(data) {
    var ret = merge(timelineData, data);
	//document.write(JSON.stringify(ret));
    /*if(Common.debug()) {
      for(var i = 0; i < ret.length; i ++) {
        console.log(ret[i]);
      }
    }*/
	
	var shortRet = shortenDateStr(ret);
    var header = [timelineHeader[0].concat([data.label])];
    var dataArray = header.concat(shortRet);
    /*if(Common.debug()) {
      for(var i = 0; i < dataArray.length; i ++) {
        console.log(dataArray[i]);
      }
    }*/
	
    var data = google.visualization.arrayToDataTable(dataArray);
    drawMultiLineTimeChart(data);
    timelineData = ret;
    timelineHeader = header;
  };
  
  Chart.removeTimeline_old = function(label) {
  // TODO: deal with the special condition:
  // 'query input' == 'entity label'
    for(var j = 1; j < timelineHeader[0].length; j ++) {
      if(timelineHeader[0][j] == label)
        break;
    }
    timelineHeader[0].splice(j, 1);
    for(var i in timelineData) {
      timelineData[i].splice(j, 1);
    }
    /*
    if(Common.debug()) {
      for(var i = 0; i < timelineData.length; i ++) {
        console.log(timelineData[i]);
      }
    }*/
    if(timelineHeader[0].length < 2) {
      // if there is no any time line data
      timelineHeader = [['Date']];
      timelineData = [];
    }
    var shortData = shortenDateStr(timelineData);
    var dataArray = timelineHeader.concat(shortData);
	
	alert(JSON.stringify(dataArray));
	
    var data = google.visualization.arrayToDataTable(dataArray);
    drawMultiLineTimeChart(data);
  };
    
  function drawTimeChartDates(label, datesList){
	var dataArray = getDateArray(label,datesList);
	var div = document.getElementById('time_chart');
	
	while(div.hasChildNodes())
      div.removeChild(div.firstChild);
	
	var dataTable = new google.visualization.DataTable();
	dataTable.addColumn('string', 'Date');
	dataTable.addColumn('number', 'frequency');
	
	if(dataArray.length > 0){
		dataTable.addRows(dataArray);
		var chart = new google.visualization.AreaChart(div);
		var timeOptions = {
			 //width:1168,
			 width:790,
             height:80,
             legend:{ position:'in' },
             vAxis:{ minValue: 0 },
             curveType:'function',
             //pointSize:1,
             fontSize:9,
             chartArea:{left:30,top:8,width:'94%',height:'50%'}
            };
		chart.draw(dataTable, timeOptions);
	}else {
		$(div).html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
	}
  }
  
  function redrawTimeChartDates(label, datesList,url){
	var dataArray = getDateArray(label,datesList);
	var div = document.getElementById('retime_chart');
	
	while(div.hasChildNodes())
      div.removeChild(div.firstChild);
	
	var dataTable = new google.visualization.DataTable();
	dataTable.addColumn('string', 'Date');
	dataTable.addColumn('number', 'frequency');
	
	if(dataArray.length > 0){
		dataTable.addRows(dataArray);
		var chart = new google.visualization.AreaChart(div);
		var timeOptions = {
			hAxis: {
				title: '',  
				logScale : true , 
				slantedText: true ,
				viewWindowMode :'pretty'
			},
			 width:900,
             height:200,
             legend:{ position:'in' },
             vAxis:{ minValue: 0 },
             curveType:'function',
             //pointSize:1,
             fontSize:9,
             chartArea:{left:80,top:8,width:'95%',height:'50%'}
            };
		chart.draw(dataTable, timeOptions);
	
		//url = url.replace(/&callback=[\s\S]{1,}&/,"&calback=&");
		google.visualization.events.addListener(chart, 'select', function(){
			var selectArray = dataArray[chart.getSelection()[0].row];
			var date = selectArray[0];
			var articlesum = selectArray[1];
			
			//replace pagesize=10 £¬add Date 
			url = url.replace(/&ts=[0-9]{1,}d/g,"");
			
			url = getDateUrl(url,date);
			//url = url.replace(/&callback=[\s\S]{1,}&/,"&calback=&");
			var totalPage = getTotalPageNum(articlesum);
			
			getchartarticle(url,totalPage,"#top_article_time");
		});
	}else {
		$(div).html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
	}
  }
  
  function getTotalPageNum(articleNum){
	var totalnum = 0;
	if(articleNum % pageSize == 0){
		totalnum = articleNum / pageSize;
	}else {
		totalnum = parseInt(articleNum / pageSize) + 1;
	}
	return totalnum;
  }
  
  function getLangUrl(url,langname){
	url = url.replace(/&pagesize=[0-9]{1,}/,"&pagesize=" + pageSize);
	url = url.replace(/&lang=[a-z]{1,}/g,"");
	url = url + langname;
	
	return url;
  }
  
  function getSourcesUrl(url,sourcesname){
	url = url.replace(/&pagesize=[0-9]{1,}/,"&pagesize=" + pageSize);

	if(url.indexOf("&source=") != -1){
		var sourcesindex = url.indexOf("&source=");
	    var sourcesafstr = url.substring(sourcesindex).replace(/&source=/,"");
				
		if(sourcesafstr.indexOf("&") != -1){
			var afstr = sourcesafstr.substring(sourcesafstr.indexOf("&"));
			afstr += "&source=" + encodeURIComponent(sourcesname);
			url += afstr;
		}else {
			url =  url.substring(0,sourcesindex) + "&source=" + encodeURIComponent(sourcesname);
		}
	}else {
		url += "&source=" + encodeURIComponent(sourcesname);
	}
	return url;
  }
  
  function getDateUrl(url,date){
	url = url.replace(/&pagesize=[0-9]{1,}/,"&pagesize=" + pageSize);
			
	if(url.indexOf("&date=") != -1){
		var dateindex = url.indexOf("&date=");
	    var dateafstr = url.substring(dateindex).replace(/&date=/,"");
				
		if(dateafstr.indexOf("&") != -1){
			var afstr = dateafstr.substring(dateafstr.		indexOf("&"));
			afstr += "&date=" + encodeURIComponent(date);
			url += afstr;
		}else {
			url =  url.substring(0,dateindex) + "&date=" + encodeURIComponent(date);
		}
	}else {
		url += "&date=" + encodeURIComponent(date);
	}
	return url;
  }
   
  function drawTimeChart(label, articleList) {
    // Create the data table.
    var header = [["Date", label]];
    var datMap = sortArticlesByDate(articleList);
    var shortDatMap = shortenDateStr(datMap);
    /*if(Common.debug()) {
      for(var i = 0; i < shortDatMap.length; i ++) {
        console.log(shortDatMap[i]);
      }
    }*/
    //var datMap = getDateArray(dates);
    var dataArray = header.concat(shortDatMap);
    var data = google.visualization.arrayToDataTable(dataArray);
	
    drawMultiLineTimeChart(data);
    timelineData = datMap;
    timelineHeader = header;
  }
  
  function getDateArray(label,dates) {
    var datArray = new Array();
	
	dates.sort(sort_by('interval',false,String));
	
    for(var i in dates) {
      var item = new Array();
      item[0] = dates[i].interval;
      item[1] = dates[i].frequency;
      datArray.push(item);
	  //datArray.push(new timeNode(dates[i].interval,dates[i].frequency));
    }
	
	var fi = 0;
	var fj = 0;
	var resultArray = new Array();
	
	var mapArray = new Array();
	
	for(var i = fi;i < datArray.length;i ++){
		for(var j = fj;j < allDateArray.length; j ++){
			if(allDateArray[j].date != datArray[i][0]){
				var item = new Array();
				item[0] = allDateArray[i].date;
				item[1] = allDateArray[i].count;
				resultArray.push(item);
				mapArray.push(new timeNode(item[0],item[1]));
				//resultArray.push(minandmaxDataArray[j]);
			}else{
				resultArray.push(datArray[i]);
				mapArray.push(new timeNode(datArray[i][0],datArray[i][1]));
				fi = i + 1;
				fj = j + 1;
				break;
			}
		}
	}
	
	linemap[label] = mapArray;
	//var allKeywordDataArray = getKeywordData(minandmaxDataArray,datArray);
	
    return resultArray;
  }
  
  function drawMultiLineTimeChart(data) {
    var div = document.getElementById('time_chart');
    while(div.hasChildNodes())
      div.removeChild(div.firstChild);
    if(data.getNumberOfColumns() < 2) {
      return;
    }
    //var chart = new google.visualization.LineChart(div);
    if(data.getNumberOfRows() > 0) {
      var chart = new google.visualization.AreaChart(div);
      var timeOptions = {width:900,
             height:80,
             legend:{ position:'in' },
             vAxis:{ minValue: 0 },
             curveType:'function',
             //pointSize:1,
             fontSize:9,
             chartArea:{left:30,top:8,width:'94%',height:'50%'}
            };
      chart.draw(data, timeOptions);
    } else {
      $(div).html("<p style='color:gray;text-align:center'>&lt;No Data&gt;</p>");
    }
  }
  
  namespace.Chart = Chart;
})(org.xlike.thu);