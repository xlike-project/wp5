Module.import(org.xlike.thu);

var entityUrlMap = {};
var maxacnum = 10;
  
function onKeyPress(e) {
  var key = e.keyCode || e.which;
  var input = $("#search").val();
  var url = Common.getSuggestConceptsURL(input);
  
  $.getJSON(url,function(response){
	//var data = response;
	var availableTags = new Array();
    entityUrlMap = {};
	for(var i in response){
		//var labels = response[i].label + " [ent]";
		var label = response[i].label;
		var labels = "[" + label + "]";
		availableTags.push(labels);
		//alert(response[i].uri);
		entityUrlMap[labels] = response[i].uri;
	}
	linemap = {};
	  
	$("#search").autocomplete({
		source: function(request, response) {
			var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
			var flag = 0;
			response($.grep(availableTags,function(item) {
				if (matcher.test(item) && (flag < maxacnum)) {
					flag++;
					return matcher.test(item);
				}
			}));
		}
	});
  }).error(function(){ 
	Common.hideLoading(); 
	alert("Oops, we got an error...");
  });

  if (key==13)
    search();
}

function addKeyListener(){
	$(document).ready(function () {
		$('#search').keyup(function(event) {
		  //alert('Handler for .keyup() called.');
		  onKeyPress(event);
		});
	});
}
function search() {
  settingsHide();
  var input = $("#search").val();
  if(input.trim() == "")
    return;
  //var index = input.trim().indexOf("[ent]");

  //alert(entityUrlMap[input.trim()]);
  
  //if((index != -1) && ((index + 5) == input.trim().length)){
	//Entity.select(entityUrlMap[input.trim()]);
 // }else {
	doSearch(input, false);
 // }
  
  Common.addHistory(input, "search");
}

function doSearch(input, isDefault) {
  addKeyListener();
  var query = input;
  if(typeof input == "undefined")
    query = $("#search").val();
  //if(query.trim() == "")
  //  return;
  //alert(query);
  
  var url = "";
  if(isDefault)
    url = Common.getSearchURL(query);
  else 
    url = Common.getSearchURL(query, getSearchOptions());
  //alert(url);
  Common.showLoading();
  if(Common.online()) {
	//alert(url);
    $.getJSON(url, function(data) {
		//alert(url);
        //updatePage(data, isDefault, query);
		updatePage(data, isDefault, query ,url);
      })
      .error(function(){ 
        Common.hideLoading(); 
        alert("Oops, we got an error...");
      });
  } else {
    updatePage(search, isDefault);
  }
}

function updatePage(data, isDefault, query) {
  try{
    Entity.update(data.entities, data.customEntities);
    Story.update(data.stories);
    if(!isDefault) {
      var articles = Article.mergeRelated(data);
      if(Common.doChart())
        Chart.updateByQuery(data, query);
      if(Common.online())
        Map.update(articles);
      //Cloud.updateByArticles(data.articles);
      Cloud.updateByKeywords(data.keywords.keywords);
      
      Article.update(articles);
    }
    Common.hideLoading();
  } catch(e) {
    Common.hideLoading();
    console.log(e);
  }
}

function updatePage(data, isDefault, query ,url) {
  diffday = getdiffDay(url);
  minandmaxDate = getMinAndMaxDate(diffday);
  allDateArray = getallDateArray(minandmaxDate);
  linemap = {};
  try{
    Entity.update(data.entities, data.customEntities);
    Story.update(data.stories);
    if(!isDefault) {
      var articles = Article.mergeRelated(data);
      if(Common.doChart())
        Chart.updateByQuery(data, query , url);
      if(Common.online())
        Map.update(articles);
      //Cloud.updateByArticles(data.articles);
      Cloud.updateByKeywords(data.keywords.keywords);
      
      Article.update(articles);
    }
    Common.hideLoading();
  } catch(e) {
    Common.hideLoading();
    console.log(e);
  }
}

function loadDefault() {
  //TODO
  doSearch("", true);
}

function swapImg(elem, tag) {
  if(tag == 'on') {
    //alert($(elem).attr('onmouseover'));
    $(elem).css('background-image', 'url(images/chart.png)');
  } else {
    $(elem).css('background-image', 'url(images/chart-gray.png)');
  }
}