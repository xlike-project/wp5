function getdiffDay(url){
	var startindex = url.indexOf("ts=");
	
	var date ;
	if(startindex != -1){
		var temp = url.substring(startindex,url.length);
		var endindex = temp.indexOf("&");
		var datestr = "";
		if(endindex != -1){
			datestr = temp.substring(0,endindex);
		}else {
			datestr = temp;
		}
		date = datestr.substring(datestr.indexOf("="));
		date = date.substring(1,date.indexOf("d"));
	}else {
		date = 1;
	}
	
	return date;
}

function getMinAndMaxDate(date){
	//var date = getdiffDay(url);
	var d=new Date()
	d.setDate(d.getDate()-date);
	//var maxDate = new Date().format("yyyy-MM-dd hh:mm:ss");
	//var minDate = d.format("yyyy-MM-dd hh:mm:ss");
	var maxDate = new Date();
	maxDate.setDate(maxDate.getDate() - 1);
	maxDate = maxDate.format("yyyy-MM-dd")
	var minDate = d.format("yyyy-MM-dd");
	
	return new mostValueModel(minDate,maxDate);
}

function diffdate(startTimeNode, endTimeNode) {
    var start_time = startTimeNode.date;
    var end_time = endTimeNode.date;
    var new_str_time = start_time + ' 00:00:00';
    var new_time = new_str_time.replace(/:/g, '-');
    time = new_time.replace(/ /g, '-');
    var arr = time.split("-");
    var datum = new Date(Date.UTC(arr[0], arr[1] - 1, arr[2], arr[3] - 8, arr[4], arr[5]));
    var start_time = (datum.getTime() / 1000);
    var new_end_time = end_time + ' 00:00:00';
    var new_time = new_end_time.replace(/:/g, '-');
    time = new_time.replace(/ /g, '-');
    var arr = time.split("-");
    var datum = new Date(Date.UTC(arr[0], arr[1] - 1, arr[2], arr[3] - 8, arr[4], arr[5]));
    var end_time = (datum.getTime() / 1000);
    if (end_time < start_time) {
        var a = start_time;
        var start_time = end_time;
        var end_time = a;
    }
    var time_arr = new Array();
    for (var i = start_time; i <= end_time;) {
        var date = new Date(parseInt(i) * 1000);
        var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        var currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        //time_arr = time_arr.concat(date.getFullYear() + "-" + month + "-" + currentDate);  
        if (i == start_time) {
            time_arr.push(startTimeNode);
        } else if (i == end_time) {
            time_arr.push(endTimeNode);
        } else {
            time_arr.push(new timeNode(date.getFullYear() + "-" + month + "-" + currentDate, 0));
        }

        i += 86400;
    }

    return time_arr;
}

function sort_by(field, reverse, primer){
	reverse = (reverse) ? -1 : 1; 
	return function(a,b){ 
	    a = a[field]; 
	    b = b[field]; 
	    if (typeof(primer) != 'undefined'){ 
		a = primer(a); 
		b = primer(b); 
	    } 
	    if (a>b) {
	    	if(field == "time"){
	    		return reverse * 1; 
	    	}else if(field == "interval"){
				return reverse * 1; 
			}else if(field == "date"){
				return reverse * 1; 
			}
	    }
	    if (a<b) {
	    	if(field == "time"){
	    		return reverse * -1; 
	    	}else if(field == "interval"){
				return reverse * -1; 
			}else if(field == "date"){
				return reverse * -1; 
			}
	    }
	    	
	    return 0; 
	} 
}

function getallDateArray(minandmaxDate){
	var resultArray = diffdate(new timeNode(minandmaxDate.minDate,0),new timeNode(minandmaxDate.maxDate,0));
	resultArray.sort(sort_by('date', false, String));
	
	return resultArray;
}

function getKeywordData(minandmaxDataArray,dataArray){
	var resultArray = new Array();
	
	var datamap = {};
	
	for(var i in dataArray){
		datamap[dataArray[i].date] = dataArray[i].count;
	}
	
	for(var i in minandmaxDataArray){
		if(typeof datamap[minandmaxDataArray[i].date] != "undefined"){
			resultArray.push(new timeNode(minandmaxDataArray[i].date,datamap[minandmaxDataArray[i].date]));
		}else {
			resultArray.push(new timeNode(minandmaxDataArray[i].date,0));
		}
	}
	
	return resultArray;
}

function getKeywordDataFromUrl(dataArray){
	var resultArray = new Array();
	
	for(var i in dataArray){
		var date = dataArray[i].interval;
		var count = dataArray[i].frequency;
		resultArray.push(new timeNode(date,count));
	}
	return resultArray;
}

function getChartDataArray(){
	var titleArray = new Array();
	var dataArray = new Array();
	titleArray.push("Date");
	for(var i in allDateArray){
		var tempArray = new Array();
		tempArray.push(allDateArray[i].date);
		dataArray.push(tempArray);
	}
	
	for(key in linemap){
		titleArray.push(key);
		var data = linemap[key].dataArray;
		data.sort(sort_by('date', false, String));
		for(var i in data){
			var tempArray = dataArray[i];
			var count = data[i].count;
			tempArray.push(count);
			//dataArray[i] = dataArray[i].push(data[i].count);
			dataArray[i] = tempArray;
		}
	}
	return new chartData(titleArray,dataArray);
}

function getsuggestConcepts() {
/*
    $.post('searchword',
    //{suggest:backurl},
    function(data) {
        var availableTags = data.searchword.split(",");
        var loginfo = "";

        task(data.username);

        $("#tags").autocomplete({
            source: function(request, response) {
                //var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), "i" );
                //从数据源中，取出前十条符合条件的词
                var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
                var flag = 0;
                response($.grep(availableTags,
                function(item) {
                    //alert("item :" + item + " " + item.search(matcher));
                    if (matcher.test(item) && (flag <= 9)) {
                        flag++;
                        return matcher.test(item);
                    }
                }));
            }
        });

        //		$("#tags" ).autocomplete({
        //			source: availableTags
        //		});
    },
    'json');
	*/
	
	$.post('searchword',function(data) {
        var availableTags = data.searchword.split(",");
        var loginfo = "";

        task(data.username);

        $("#search").autocomplete({
            source: function(request, response) {
                //var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), "i" );
                //从数据源中，取出前十条符合条件的词
                var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
                var flag = 0;
                response($.grep(availableTags,
                function(item) {
                    //alert("item :" + item + " " + item.search(matcher));
                    if (matcher.test(item) && (flag <= 9)) {
                        flag++;
                        return matcher.test(item);
                    }
                }));
            }
        });
    },
    'json');
}