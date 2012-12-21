/**
 *
 */
Module.import(org.xlike.thu);
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
			   pointSize:3,
	           chartArea:{left:50,top:8,width:'90%',height:'60%'}
			  },
		pieOptions = {width:268,
			   height:150,
	           chartArea:{left:50,top:10,width:'90%',height:'80%'}
			  },
		articles = [];
		Chart = {};
	// Callback that creates and populates a data table,
	// instantiates the pie chart, passes in the data and
	// draws it.
	Chart.update = function(label, articleList) {
		try{
			//articles = articleList;
			drawAgencyChart(articleList);
			drawLanguageChart(articleList);
			drawTimeChart(label, articleList);
			//drawNewsChart();
		} catch (e) {
			Common.hideLoading();
		}
	};
	
	Chart.updateByQuery = function (data, label) {
		try {
			var articles = data.articles;
			if(data.related) {
				for(var i in data.related) {
					articles = articles.concat(data.related[i].articles);
				}
			}
			if(data.sources)
				drawSourceChart(data.sources);
			else drawAgencyChart(articles);
			drawLanguageChart(articles);
			drawTimeChart(label, articles);
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
		//	return pubMap.slice(0, 5);
		return pubMap.slice(0, 10);
	}

	function drawAgencyChart(articleList) {
		// Create the data table.
		var header = [["Publisher", "Number"]];
		var pubMap = sortArticlesByPublisher(articleList);
		var data = google.visualization.arrayToDataTable(header.concat(pubMap));

		// Instantiate and draw our chart, passing in some options.
		var div = document.getElementById('agency_chart');
		//clear all children elements
		while(div.hasChildNodes())
			div.removeChild(div.firstChild);
		//add chart element
		var chart = new google.visualization.ColumnChart(div);
		chart.draw(data, colOptions);
	}
	
	function drawSourceChart(sources) {
		// Create the data table.
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
		var div = document.getElementById('agency_chart');
		//clear all children elements
		while(div.hasChildNodes())
			div.removeChild(div.firstChild);
		//add chart element
		var chart = new google.visualization.ColumnChart(div);
		//var chart = new google.visualization.AreaChart(div);
		chart.draw(data, colOptions);
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
		//	return lanMap.slice(0, 5);
		return lanMap;
	}

	function drawLanguageChart(articleList) {
		// Create the data table.
		var header = [["Language", "Number"]];
		var lanMap = sortArticlesByLanguage(articleList);
		var data = google.visualization.arrayToDataTable(header.concat(lanMap));

		// Instantiate and draw our chart, passing in some options.
		//clear all children elements
		var div = document.getElementById('lang_chart');
		while(div.hasChildNodes())
			div.removeChild(div.firstChild);
		var chart = new google.visualization.PieChart(div);
		chart.draw(data, pieOptions);
	}

	function getShortDate(longDate) {
		var s = longDate.substring(11, 16);
		//while(s.charAt(0) == '0')
		//	s = s.substring(1);
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
			var time = article.date;
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
		var articles = data.articles;
		if(data.related) {
			for(var i in data.related) {
				articles = articles.concat(data.related[i].articles);
			}
		}
		var datMap = sortArticlesByDate(articles);
		var i = 0, 			// index for origin
			j = 0,			// index for datMap
			l = 0,			// index for result array
			ret = [];		// result date-value array
		while(i < origin.length && j < datMap.length) {
			if(origin[i][0] == datMap[j][0]) {		// date strings equal
				ret[l] = [].concat(origin[i]);
				ret[l].push(datMap[j][1]);
				i ++;
				j ++;
			} else if(origin[i][0] < datMap[j][0]) {		//date strings not equal, the origin less
				ret[l] = [].concat(origin[i]);
				ret[l].push(0);
				i ++;
			} else if(origin[i][0] > datMap[j][0]) {		//date strings not equal, the datMap greater
				ret[l] = [datMap[j][0]];
				for(var m = 0; m < origin[0].length - 1; m ++) {
					ret[l].push(0);
				}
				ret[l].push(datMap[j][1]);
				j ++;
			}
			l ++;
		}
		if(i == origin.length) {	// origin complete first
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
		if(j == datMap.length) {	// datMap complete first
			for(;i < origin.length; i ++) {
				ret[l] = [].concat(origin[i]);
				ret[l].push(0);
				l ++;
			}
		}
		return ret;
	}
	
	Chart.addTimeline= function(data) {
		var ret = merge(timelineData, data);
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
	
	Chart.removeTimeline = function(label) {
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
		var data = google.visualization.arrayToDataTable(dataArray);
		drawMultiLineTimeChart(data);
	};
	
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
	
	function getDateArray(dates) {
		var datArray = [];
		for(var i in dates) {
			var item = [];
			item[0] = dates[i].interval;
			item[1] = dates[i].frequency;
			datArray.push(item);
		}
		return datArray;
	}
	
	function drawMultiLineTimeChart(data) {
		var div = document.getElementById('time_chart');
		while(div.hasChildNodes())
			div.removeChild(div.firstChild);
		if(data.getNumberOfColumns() < 2) {
			return;
		}
		//var chart = new google.visualization.LineChart(div);
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
	}
	
	namespace.Chart = Chart;
})(org.xlike.thu);