function timeNode(date,count){
	this.date = date;
	this.count = count;
}
	  
function wordTimeModel(keyword,timeArray){
	this.keyword = keyword;
	this.timeArray = timeArray;
}
	  
function mostValueModel(minDate,maxDate){
	this.minDate = minDate;
	this.maxDate = maxDate;
}

function chartData(titleArray,dataArray){
	this.titleArray = titleArray;
	this.dataArray = dataArray;
}

function chartMapData(url,dataArray){
	this.url = url;
	this.dataArray = dataArray;
}