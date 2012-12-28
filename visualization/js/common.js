/**
 * A common module which includes all utility methods and variables, such as 
 * getStories, getArticles, getEntities and so on.
 */

(function (namespace) {
	
	var online = true,			// false means using local data in a file for 
								// development, true for using news feeds online
		doChart = true,
		debug = true,
		sta = false,
		hotTab = true,			// hot emtity tab is shown
		searchUrl = "http://newsfeed.ijs.si/xlike/search?q=",
		searchUrlSTA = "http://newsfeed.ijs.si/xlike-sta/search?q=",
		entityQueryUrl = "http://newsfeed.ijs.si/xlike/entity?uri=",
		entityQueryUrlSTA = "http://newsfeed.ijs.si/xlike-sta/entity?uri=",
		storyQueryUrl = "http://newsfeed.ijs.si/xlike/story?id=",
		storyQueryUrlSTA = "http://newsfeed.ijs.si/xlike-sta/story?id=",
		articleQueryUrl = "http://newsfeed.ijs.si/xlike/article?id=",
		articleQueryUrlSTA = "http://newsfeed.ijs.si/xlike-sta/article?id=",
		
		history = [],
		MAX_HIS = 8,
		items_per_page = 10,
		Common = {};
	Common.pagerOpts = {
						num_edge_entries: 2, //边缘页数
						num_display_entries: 5, //主体页数
						//callback: cusPageSelectCallback,
						items_per_page: items_per_page, //每页显示5项
						prev_text:"<",
						next_text:">"
					};
	Common.online = function() { return online; };
	Common.doChart = function() { return doChart; };
	Common.debug = function() { return debug; };
	Common.sta = function() { return sta; };
	Common.hotTab = function() { return hotTab; };
	Common.getPagerOpts = function(opts) { return $.extend(Common.pagerOpts, opts || {}); };
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
	
	Common.getSearchURL = function(queryStr, opt) {
	
		var url = "";
		if(Common.sta())
			url = searchUrlSTA;
		else url = searchUrl;
		url += encodeURIComponent(queryStr) + "&page=0";
		if(opt) {
			url += "&" + getParaStr(opt);
		}
		url += "&callback=?";
		if(Common.debug())
			console.log(url);
		return url;
	};
	
	Common.getEntityQueryURL = function(id, opt) {
		var url = "";
		if(Common.sta())
			url = entityQueryUrlSTA;
		else url = entityQueryUrl;
		url += encodeURIComponent(id);
		if(opt) {
			url += "&" + getParaStr(opt);
		}
		url += "&callback=?";
		if(Common.debug())
			console.log(url);
		return url;
	};
	
	Common.getStoryQueryURL = function(id, opt) {
		var url = "";
		if(Common.sta())
			url = storyQueryUrlSTA;
		else url = storyQueryUrl;
		url += encodeURIComponent(id);
		if(opt) {
			url += "&" + getParaStr(opt);
		}
		url += "&callback=?";
		if(Common.debug())
			console.log(url);
		return url;
	};
	
	Common.getArticleQueryURL = function(id, opt) {
		var url = "";
		if(Common.sta())
			url = articleQueryUrlSTA;
		else url = articleQueryUrl;
		url += encodeURIComponent(id);
		//if(opt) {
		//	url += "&" + getParaStr(opt);
		//}
		url += "&callback=?";
		if(Common.debug())
			console.log(url);
		return url;
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
			//for(var k in record.stories) {
			//	if(record.stories[k].id == id)
					Story.open(id, true);
			//}
		} else if(type == "search") {
			doSearch(record.label);
		} else {
			return;
		}
		history.splice(i + 1);
		//alert($("#navi > span:gt(" + i + ")").length);
		$("#navi > span:gt(" + i + ")").remove();
	};
	
	/* Utility function for tab switch */
	Common.switchTab = function(id, tab) {
		if($(tab).hasClass("here"))
			return;
		$(tab).addClass("here");
		$(tab).parent().siblings().children("a").removeClass();
		if(id == "story") {
			$("#story").css("display", "block");
			$("#article").css("display", "none");
		} else if(id == "article"){
			$("#story").css("display", "none");
			$("#article").css("display", "block");
		} else if(id == "hot"){
			$("#sta").css("display", "none");
			$("#hot").css("display", "block");
			hotTab = true;
		} else if(id == "sta"){
			$("#hot").css("display", "none");
			$("#sta").css("display", "block");
			hotTab = false;
		}
			
	}
	Common.getRequestParameters = function() {
		var url = location.href; 
		var paraString = url.substring(url.indexOf("?")+1,url.length).split("&"); 
		var paraObj = {}; 
		for (i=0; j=paraString[i]; i++){ 
			paraObj[j.substring(0,j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=")+1,j.length); 
		}
		return paraObj;
	};
	
	Common.page = function(opts) {
		opts = jQuery.extend({
			container: "#list",
			pager: "#pager",
			itemElement: "li",
			itemCreator:createItem,
			data: [],
			//pageSelectCallback: callback,
			pagerOpts: {}
		}, opts||{});
		opts.pagerOpts.callback = callback;
		
		var itemList = opts.container + " " + opts.itemElement;
		
		function callback(page_index, jq) {
			//var items_per_page = 3;
			var num_entries = $(itemList).css('display', 'none').length;
			var max_elem = Math.min((page_index+1) * opts.pagerOpts.items_per_page, num_entries);
			// 获取加载元素
			for(var i=page_index*opts.pagerOpts.items_per_page;i<max_elem;i++){
				$(itemList + ":eq("+i+")").css('display', 'block');
			}
			//阻止单击事件
			return false;
		}
		
		function createItem(d) {
			return "";
		}
		
		$(opts.container).html("");
		if(opts.data.length == 0) {
			$(opts.container).html("<p style='color:gray;text-align:center'>No Data</p>");
			return;
		}
		d3.select(opts.container)
					.selectAll(opts.itemElement)
					.data(opts.data)
					.enter()
					.append(opts.itemElement)
					.html(opts.itemCreator);
		var num_entries = $(itemList).css('display', 'none').length;
		$(opts.pager).pagination(num_entries, opts.pagerOpts);
	};
	
	namespace.Common = Common;
	
})(org.xlike.thu);