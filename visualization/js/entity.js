(function (namespace) {
	var Entity = {},
		entities = [],
		customes = [],
		timelines = [],
		MAX_LABEL_LENGTH = 20;
	
	Entity.getEntities = function() {
		return entities;
	};
	
	Entity.update = function (entityList, customeList) {
		var items_per_page = 20;
		entities = entityList;
		if(customeList) {
			customes = customeList;
		}
		else customes = [];
		$("#hotTab").text("Hot (" + entities.length + ")");
		$("#customeTab").text("STA (" + customes.length + ")");
		var initPagination = function() {
			//custome entity list pageination
			if(customeList) {
				$("#custome-show").html("");
				d3.select("#custome-show")
					.selectAll("li")
					.data(customes)
					.enter()
					.append("li")
					.html(function (d) {
					var html = "<input class='icon' type='button' "
						+ "title='Add to time line chart'"
						+ "onclick='javascript:Entity.timeline(this, \"" + d.uri + "\");'"
						+ "onmouseover=\"javascript:swapImg(this, 'on');\" onmouseout=\"javascript:swapImg(this, 'out');\"/>";
					html += "<a href='javascript:void(0);' "
						+ "title='"	+ d.label + "' "
						+ "onclick='javascript:Entity.select(\"" + d.uri + "\");'>"
						+ (d.label.length < MAX_LABEL_LENGTH ? d.label : d.label.substring(0, MAX_LABEL_LENGTH) + "...") + ' (' + d.count + ')'
						+ "</a>";
					return html;
				});
				
				var num_entries = $("#custome-show li").length;
				$("#custome-show li").css('display', 'none');
				// 创建分页
				$("#cus-pager").pagination(num_entries, {
					num_edge_entries: 1, //边缘页数
					num_display_entries: 3, //主体页数
					callback: cusPageSelectCallback,
					items_per_page: items_per_page, //每页显示5项
					prev_text:"<",
					next_text:">"
				});
				
			}
			
			//hot entity list pageination
			$("#entities-show").html("");
			d3.select("#entities-show")
				.selectAll("li")
				.data(entityList)
				.enter()
				.append("li")
				.html(function (d) {
					var html = "<input class='icon' type='button' "
						+ "title='Add to time line chart'"
						+ "onclick='javascript:Entity.timeline(this, \"" + d.uri + "\");'"
						+ "onmouseover=\"javascript:swapImg(this, 'on');\" onmouseout=\"javascript:swapImg(this, 'out');\"/>";
					html += "<a href='javascript:void(0);' "
						+ "title='"	+ d.label + "' "
						+ "onclick='javascript:Entity.select(\"" + d.uri + "\");'>"
						+ (d.label.length < MAX_LABEL_LENGTH ? d.label : d.label.substring(0, MAX_LABEL_LENGTH) + "...") + ' (' + d.count + ')'
						+ "</a>";
					return html;
				});
			$("#entities-show li").css('display', 'none');
			var num_entries = $("#entities-show li").length;
			// 创建分页
			
			$("#ent-pager").pagination(num_entries, {
				num_edge_entries: 1, //边缘页数
				num_display_entries: 3, //主体页数
				callback: entPageSelectCallback,
				items_per_page: items_per_page, //每页显示5项
				prev_text:"<",
				next_text:">"
			});
			
		}();
	 
		//entities = entities.concat(customes);
		function cusPageSelectCallback(page_index, jq){
			//var items_per_page = 3;
			var num_entries = $("#custome-show li").length;
			var max_elem = Math.min((page_index+1) * items_per_page, num_entries);
			
			//$("#custome-show").animate({width : "toggle"}, "fast", function() {
				//$("#custome-show").html("");
				$("#custome-show li").css('display', 'none');
				// 获取加载元素
				for(var i=page_index*items_per_page;i<max_elem;i++){
					//$("#custome-show").append($("#custome li:eq("+i+")").clone());
					$("#custome-show li:eq("+i+")").css('display', 'block');
				}
				//$("#custome-show").animate({width : "toggle"}, "fast");
			//});
			
			//阻止单击事件
			return false;
		}

		function entPageSelectCallback(page_index, jq){
			//var items_per_page = 3;
			var num_entries = $("#entities-show li").length;
			$("#entities-show li").css('display', 'none');
			var max_elem = Math.min((page_index+1) * items_per_page, num_entries);
			
			//$("#entities-show").animate({width : "toggle"}, "fast", function() {
				//$("#entities-show").html("");
				// 获取加载元素
				for(var i=page_index*items_per_page;i<max_elem;i++){
					//$("#entities-show").append($("#entities li:eq("+i+")").clone());
					$("#entities-show li:eq("+i+")").css('display', 'block');
				}
				//$("#entities-show").animate({width : "toggle"}, "fast");
			//});
			//阻止单击事件
			return false;
		}
	};

	Entity.select = function(uri, history) {
		settingsHide();
		Common.showLoading();
		var storyList = [];
		if(Common.online()) {
			$.getJSON(Common.getEntityQueryURL(uri), function(data) {
				try{
					var articles = Article.mergeRelated(data);
					Chart.update(data.label, articles);
					//Cloud.updateByArticles(data.articles);
					Cloud.updateByKeywords(data.keywords.keywords);
					Map.update(articles);
					Story.update(data.stories);
					Article.update(articles);
					var elem = getElementByURI(uri);
					//Entity.timeline(elem, data);
					clearTimeline();
					addTimelineMark(elem);
					timelines.push(data);
					Common.hideLoading();
					if(!history)
						Common.addHistory(getEntityByURI(uri), "entity");
				} catch(e) {
					Common.hideLoading();
					alert("Oops, we got an error...");
					console.log(e);
				}
			})
			.error(function(){ Common.hideLoading(); alert("Oops, we got an error...");});
		} else {
			try{
				//use local data entityQuery
				if(Common.doChart())
					Chart.update(entityQuery.articles);
				//Cloud.updateByArticles(entityQuery.articles);
				Map.update(entityQuery.articles);
				Story.update(entityQuery.stories);
				Common.hideLoading();
				if(!history)
					Common.addHistory(getEntityByURI(uri), "entity");
			} catch(e) {
				Common.hideLoading();
			}	
		}
		
	};
	
	function clearTimeline() {
		timelines = [];
		$("#entities-show li input").css('background-image', 'url(images/chart-gray.png)')
			.attr('onmouseover', "javascript:swapImg(this, 'on');")
			.attr('onmouseout', "javascript:swapImg(this, 'out');");
		$("#custome-show li input").css('background-image', 'url(images/chart-gray.png)')
			.attr('onmouseover', "javascript:swapImg(this, 'on');")
			.attr('onmouseout', "javascript:swapImg(this, 'out');");
	}
	
	function getElementByURI(uri) {
		var e = null,
			id = "";
		if(Common.hotTab()) {
			//hot entity is selected
			id = "#entities-show";
		} else {
			//custome entity is selected
			id= "#custome-show";
		}
		$(id + " li").each(function (index, element) {
			var button = $(this).children("input");
			var onclick = button.attr("onclick");
			if(onclick.indexOf(uri) != -1)
				e = button;
		});
		return e;
	}
	
	function getEntityByURI(uri) {
		for(var i in entities) {
			if(entities[i].uri == uri)
				return entities[i];
		}
		for(var i in customes) {
			if(customes[i].uri == uri)
				return customes[i];
		}
	}
	
	Entity.timeline = function(e, data) {
		var uri = null;
		if(typeof data == 'string')
			uri = data;
		else uri = data.uri;
		var found = false;
		var i = 0;
		for(i in timelines) {
			if(timelines[i].uri == uri) {
				found = true;
				break;
			}
		}
		if(found) {
			Chart.removeTimeline(timelines[i].label);
			timelines.splice(i, 1);
			removeTimelineMark(e);
		} else if(typeof data == 'string') {
			Common.showLoading();
			$.getJSON(Common.getEntityQueryURL(uri), addTimeline)
				.error(function(){ Common.hideLoading(); alert("Oops, we got an error...");});
		} else {
			addTimeline(data);
		}
	};
	
	function addTimeline(data) {
		try {
			Chart.addTimeline(data);
			timelines.push(data);
			var e = getElementByURI(data.uri);
			addTimelineMark(e);
			Common.hideLoading();
		} catch(e) {
			Common.hideLoading();
			alert("Oops, we got an error...");
			console.log(e);
		}
	}
	
	function addTimelineMark(e) {
		$(e).css('background-image', 'url(images/chart.png)')
			.removeAttr('onmouseover')
			.removeAttr('onmouseout')
			.attr('title', 'Remove from time line chart');
	}
	
	function removeTimelineMark(e) {
		$(e).css('background-image', 'url(images/chart-gray.png)')
			.attr('onmouseover', "javascript:swapImg(this, 'on');")
			.attr('onmouseout', "javascript:swapImg(this, 'out');")
			.attr('title', 'Add to time line chart');
	}
	
	namespace.Entity = Entity;
})(org.xlike.thu);