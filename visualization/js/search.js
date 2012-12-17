Module.import(org.xlike.thu);

function onKeyPress(e) {
	var key = e.keyCode || e.which;
	if (key==13)
		search();
}

function search() {
	settingsHide();
	var input = $("#search").val();
	if(input.trim() == "")
		return;
	doSearch(input, false);
	Common.addHistory(input, "search");
}

function doSearch(input, isDefault) {
	var query = input;
	if(typeof input == "undefined")
		query = $("#search").val();
	//if(query.trim() == "")
	//	return;
	//alert(query);
	
	var url = "";
	if(isDefault)
		url = Common.getSearchURL(query);
	else url = Common.getSearchURL(query, getSearchOptions());
	//alert(url);
	Common.showLoading();
	if(Common.online()) {
		$.getJSON(url, function(data) {
				updatePage(data, isDefault);
			})
			.error(function(){ 
				Common.hideLoading(); 
				alert("Oops, we got an error...");
			});
	} else {
		updatePage(search, isDefault);
	}
}

function updatePage(data, isDefault) {
	try{
		Entity.update(data.entities, data.customEntities);
		Story.update(data.stories);
		if(!isDefault) {
			var articles = data.articles;
			if(data.related) {
				for(var i in data.related) {
					articles = articles.concat(data.related[i].articles);
				}
			}
			if(Common.doChart())
				Chart.updateByQuery(data);
			if(Common.online())
				Map.update(articles);
			//Cloud.updateByArticles(data.articles);
			Cloud.updateByKeywords(data.keywords.keywords);
			
			Article.update(articles);
		}
		Common.hideLoading();
	} catch(e) {
		Common.hideLoading();
	}
}

function loadDefault() {
	//TODO
	doSearch("", true);
}