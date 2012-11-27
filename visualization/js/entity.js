(function (namespace) {
	var Entity = {},
		entities = [],
		MAX_LABEL_LENGTH = 16;
	
	Entity.getEntities = function() {
		return entities;
	};
	
	Entity.update = function (entityList) {
		var items_per_page = 20;
		entities = entityList;
		var initPagination = function() {
			//custome entity list pageination
			/*
			d3.select("#custome")
				.selectAll("li")
				.data(custome)
				.enter()
				.append("li")
				.append("a")
				.attr("href", "javascript:void(0);")//function (d) { return d.url; })
				.text(function (d) { return d.labels[0].text + ' (' + d.stories.length + ')'; })
				.on("click", function(d) {
					selectEntity(d);
				});
			var num_entries = $("#custome li").length;
			// 创建分页
			$("#cus-pager").pagination(num_entries, {
				num_edge_entries: 1, //边缘页数
				num_display_entries: 3, //主体页数
				callback: cusPageSelectCallback,
				items_per_page: items_per_page, //每页显示5项
				prev_text:"<",
				next_text:">"
			});
			*/
			//hot entity list pageination
			$("#entities").html("");
			d3.select("#entities")
				.selectAll("li")
				.data(entityList)
				.enter()
				.append("li")
				.append("a")
				.attr("href", "javascript:void(0);")
				.attr("title", function(d) { return d.label; })
				.attr("onclick", function(d) { return "javascript:Entity.select('" + d.uri + "');";})
				.text(function (d) { return d.label.length < MAX_LABEL_LENGTH ? d.label : d.label.substring(0, MAX_LABEL_LENGTH) + "..."; });
				//.on("click", function(d) {
				//	Entity.select(d);
				//});
			var num_entries = $("#entities li").length;
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
/*	 
		function cusPageSelectCallback(page_index, jq){
			//var items_per_page = 3;
			var num_entries = $("#custome li").length;
			var max_elem = Math.min((page_index+1) * items_per_page, num_entries);
			
			$("#custome-show").animate({width : "toggle"}, "fast", function() {
				$("#custome-show").html("");
				// 获取加载元素
				for(var i=page_index*items_per_page;i<max_elem;i++){
					$("#custome-show").append($("#custome li:eq("+i+")").clone());
				}
				$("#custome-show").animate({width : "toggle"}, "fast");
			});
			
			//阻止单击事件
			return false;
		}
*/
		function entPageSelectCallback(page_index, jq){
			//var items_per_page = 3;
			var num_entries = $("#entities li").length;
			var max_elem = Math.min((page_index+1) * items_per_page, num_entries);
			
			$("#entities-show").animate({width : "toggle"}, "fast", function() {
				$("#entities-show").html("");
				// 获取加载元素
				for(var i=page_index*items_per_page;i<max_elem;i++){
					$("#entities-show").append($("#entities li:eq("+i+")").clone());
				}
				$("#entities-show").animate({width : "toggle"}, "fast");
			});
			//阻止单击事件
			return false;
		}
	};

	Entity.select = function(uri, history) {
		Common.showLoading();
		var storyList = [];
		if(Common.online()) {
			$.getJSON(Common.getEntityQueryURL(uri), function(data) {
				try{
					Chart.update(data.articles);
					//Cloud.updateByArticles(data.articles);
					Map.update(data.articles);
					Story.update(data.stories);
					Common.hideLoading();
					if(!history)
						Common.addHistory(getEntityByURI(uri), "entity");
				} catch(e) {
					Common.hideLoading();
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
	
	function getEntityByURI(uri) {
		for(var i in entities) {
			if(entities[i].uri == uri)
				return entities[i];
		}
	}
	
	namespace.Entity = Entity;
})(org.xlike.thu);