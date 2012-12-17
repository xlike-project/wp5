/**
 *
 */
Module.import(org.xlike.thu);
(function(namespace) {
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
	Chart.update = function(articleList) {
		try{
			articles = articleList;
			drawAgencyChart(articleList);
			drawLanguageChart(articleList);
			drawTimeChart(articleList);
			//drawNewsChart();
		} catch (e) {
			Common.hideLoading();
		}
	};
	
	Chart.updateByQuery = function (data) {
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
			drawTimeChart(articles);
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
		return pubMap;
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
		
		var last = "-1";
		var labels = [];
		var j = 0;
		if(datMap.length > 10)
		for(var i in datMap) {
			var time = datMap[i][0];
			if((time.substring(0, 10) != last) || (i == datMap.lenght - 1)) {
				//datMap[i][0] = getShortDate(time);
				datMap[i][0] = time;
			} else datMap[i][0] = getShortDate(time);
			last = time.substring(0, 10);
		}
		/*
		//3次二分
		for(var i = 0; i < 3; i ++) {
			var inteval = Math.floor(datMap.length / Math.pow(2, (i + 1)));
			var index = inteval;
			while(index < datMap.length) {
				if(labels[index] == null)
					labels[index] = getShortDate(datMap[index][0]);
				index += inteval;
			}
		}
		for(var i in datMap) {
			if(labels[i])
				datMap[i][0] = labels[i];
			else datMap[i][0] = "";
		}
		//if(datMap.length > 5)
		//	return datMap.slice(0, 5);
		*/
		return datMap;
	}

	function drawTimeChart(articleList) {
		// Create the data table.
		var header = [["Date", "Articles"]];
		var datMap = sortArticlesByDate(articleList);
		var data = google.visualization.arrayToDataTable(header.concat(datMap));

		// Instantiate and draw our chart, passing in some options.
		//clear all children elements
		var div = document.getElementById('time_chart');
		while(div.hasChildNodes())
			div.removeChild(div.firstChild);
		//var chart = new google.visualization.LineChart(div);
		var chart = new google.visualization.AreaChart(div);
		var timeOptions = {width:900,
				   height:80,
				   legend:{ position:'none' },
				   vAxis:{ minValue: 0 },
				   curveType:'function',
				   //pointSize:2,
				   fontSize:9,
				   chartArea:{left:30,top:8,width:'94%',height:'50%'}
				  };
		chart.draw(data, timeOptions);
	}
	
	namespace.Chart = Chart;
})(org.xlike.thu);