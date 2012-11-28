/**
 * A common module which includes all utility methods and variables, such as 
 * getStories, getArticles, getEntities and so on.
 */

(function (namespace) {
	
	var online = true,			// false means using local data in a file for 
								// development, true for using news feeds online
		doChart = true,
		searchUrl = "http://newsfeed.ijs.si/xlike/search?q=",
		entityQueryUrl = "http://newsfeed.ijs.si/xlike/entity?uri=",
		storyQueryUrl = "http://newsfeed.ijs.si/xlike/story?id=",
		
		history = [],
		MAX_HIS = 8,
		Common = {};
	Common.online = function() { return online; };
	Common.doChart = function() { return doChart; };
	/**
	 * Find single article object from a article list by article id. Return null
	 * if not found.
	 */ 
	Common.getArticleById = function(aid, articles) {
		if(typeof articles != "object")
			articles = currentArticles;
		for(var i in articles) {
			if(articles[i].aid == aid)
				return articles[i];
		}
		return null;
	};

	/**
	 * Find article objects which are associated with some stories from all article
	 * list according to the article id. Return empty array if no any article 
	 * found.
	 */
	Common.getArticles = function(storyList) {
		var articleList = [];
		for(var i = 0; i < storyList.length; i ++) {
			var as = storyList[i].articles;
			for(var j = 0; j < as.length; j ++) {
				var aid = as[j].aid;
				for(var l = 0; l < articles.length; l ++) {
					if(articles[l].aid == aid)
						articleList = articleList.concat(articles[l]);
				}//end l
			}// end j
		}//end i
		return articleList;
	};

	/**
	 * Find entity objects which are associated with some articles from all entity
	 * list according to the entity id. Return empty array if no any entity found.
	 */
	Common.getEntities = function(articleList) {
		var entityList = [];
		for(var i = 0; i < articleList.length; i ++) {
			var a = articleList[i];
			var es = a.entities;
			for(var j = 0; j < es.length; j ++) {
				var url = es[j].url;
				for(var l = 0; l < entities.length; l ++) {
					if(url == entities[l].url)
						entityList = entityList.concat(entities[l]);
				}//end l
			}//end j
		}//end i
		return entityList;
	};
	
	Common.getSearchURL = function(queryStr) {
		return searchUrl + encodeURIComponent(queryStr) + "&page=0&callback=?";
	};
	
	Common.getEntityQueryURL = function(id) {
		return entityQueryUrl + encodeURIComponent(id) + "&callback=?";
	};
	
	Common.getStoryQueryURL = function(id) {
		return storyQueryUrl + encodeURIComponent(id) + "&callback=?";
	};
	
	Common.showLoading = function() {
		$("#loading").css({
			"position": "absolute",
			"margin-left": "1px",
			"margin-top": "1px",
			"height": function () { return $(document).height(); },
			"filter": "alpha(opacity=60)",
			"opacity": "0.6",
			"overflow": "hidden",
			"width": function () { return $(document).width(); },
			"z-index": "999",
			"background": "url('images/loading.gif')",
			"background-repeat": "no-repeat",
			"background-position": "center center",
			"background-color": "gray",
			"display": "block"
		});
	};
	
	Common.hideLoading = function() {
		//$("#loading").css("display", "none");
		$("#loading").fadeOut("slow");
	};
	
	Common.addHistory = function(data, type) {
		var click = "javascript:";
		var record = {};
		if(type == "entity") {//entity
			if(history.length > 0  && data.uri == history[history.length - 1].id)
				return;
			click += "Common.backTo(\"" + data.uri + "\", \"" + type + "\");";
			record.label = data.label;
			record.id = data.uri;
		} else if(type == "story") {//story
			if(history.length > 0 && data.id == history[history.length - 1].id)
				return;
			click += "Common.backTo(\"" + data.id + "\", \"" + type + "\");";
			record.label = data.label;
			record.id = data.id;
		} else if(type == "search") {//search
			if(history.length > 0 && data == history[history.length - 1].label)
				return;
			click += "Common.backTo(\"" + data + "\", \"" + type + "\");";
			record.label = data;
		} else {
			return;
		}
		if($("#navi > span").length == MAX_HIS) {
			history.splice(0, 1);
			
			var first = $("#navi > span:eq(0)");
			var width = first.width();
			first.fadeOut(1000,function() {
				$("#navi > span:gt(0)").animate({left: '-=' + width}, 1000, function() {
					first.remove();
				});
			});
			
		}
		record.data = data;
		record.entities = Entity.getEntities();
		record.stories = Story.getStories();
		record.articles = Chart.getArticles();
		
		history.push(record);
		$("#navi").append("<span>&gt;&nbsp;<a href='javascript:void(0)';"
			+ " title='" + record.label + "'"
			+ " onclick='" + click +"'>"
			+ shortcut(record.label) + "</a>");
		
	};
	
	function shortcut(label) {
		if(label.length > 25)
			return label.substring(0, 22) + "...";
		else return label;
	}
	
	Common.backTo = function(id, type) {
		var i = 0;
		for(i = history.length - 1; i > 0; i--) {
			if(history[i].id == id)
				break;
		}
		if(i > history.length - 1)
			return;
			
		var record = history[i];
		Entity.update(record.entities);
		if(type == "entity")
			Entity.select(id, true);
		else if(type == "story") {
			Story.update(record.stories);
			for(var k in record.stories) {
				if(record.stories[k].id == id)
					Story.open(k, true);
			}
		} else if(type == "search") {
			doSearch(record.label);
		} else {
			return;
		}
		history.splice(i + 1);
		//alert($("#navi > span:gt(" + i + ")").length);
		$("#navi > span:gt(" + i + ")").remove();
	};
	
	namespace.Common = Common;
	
})(org.xlike.thu);