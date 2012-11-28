Module.import(org.xlike.thu);

function onKeyPress(e) {
	var key = e.keyCode || e.which;
	if (key==13)
		search();
}

function search() {
	var input = $("#search").val();
	if(input.trim() == "")
		return;
	doSearch(input);
	Common.addHistory(input, "search");
}

function doSearch(input) {

	var query = input;
	if(typeof input == "undefined")
		query = $("#search").val();
	if(query.trim() == "")
		return;
	//alert(query);
	
	var url = Common.getSearchURL(query);
	//alert(url);
	Common.showLoading();
	if(Common.online()) {
		$.getJSON(url, function(data) {
				updatePage(data);
			}).error(function(){ Common.hideLoading(); alert("Oops, we got an error...");});
	} else {
		updatePage(search);
	}
}

function updatePage(data) {
	try{
		Entity.update(data.entities);
		Story.update(data.stories);
		if(Common.doChart())
			Chart.update(data.articles);
		if(Common.online())
			Map.update(data.articles);
		Cloud.updateByArticles(data.articles);
		Common.hideLoading();
	} catch(e) {
		Common.hideLoading();
	}
}