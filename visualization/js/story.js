/**
 *
 */
(function (namespace) {
	var Story = {};
	var stories = [];
	var currentStoryIndex = -1;
	
	function updateStoryContent(data, index) {
		var s = data;
		if(typeof s != "object")
			s = eval(s);
		var html = "<ul id='news'>";
		var count = 0;
		for(var i in s.articles) {
			if(s.articles[i] == null)
				continue;
			var obj = s.articles[i];
			html += "<li>&gt; <a style='font-weight: normal;' href='" + obj.url + "'>" + obj.title + "</a></li>";
			count ++;
			if(count ==10)
				break;
		}
		html += "</ul>";
		var p = $("#stories > p:eq(" + index + ")");
		p.css("display","block");
		p.slideUp(300).html(html).slideDown(300);
		//update entity list, chart, cloud and map.
		Entity.update(s.entities, s.customEntities);
		Article.update(s.articles);
		if(Common.doChart())
			Chart.update(s.articles);
		Cloud.updateByKeywords(s.keywords.keywords);
		if(Common.online())
			Map.update(s.articles);
			
		Common.switchTab('article', $("#articleTab"));
	}
	/**
	 * Inner Function: Get single story content by its id, and update.
	 */
	function getStory(index, history) {
		var id = stories[index].id;
		if(Common.online()) {
			$.getJSON(Common.getStoryQueryURL(id), function(data){
				updateStoryContent(data, index);
				Common.hideLoading();
				if(!history)
					Common.addHistory(stories[index], "story");
			})
			.error(function(){
				Common.hideLoading();
				$("#stories > p:eq(" + index + ")").html("Oops, we got an error...");
			});
		} else {
			//using local data at the moment
			updateStoryContent(storyQuery, index);
			if(!history)
				Common.addHistory(stories[index], "story");
		}
	}
	
	/**
	 * Exported Function: Unfolding a story block to display its abstract and article list.
	 */
	Story.open = function(index, history){
		settingsHide();
		if(index == currentStoryIndex)
			return;
		var cp = $("#stories > p:eq(" + currentStoryIndex + ")");
		if(cp.length != 0)
			cp.slideUp(300);
		
		Common.showLoading();
		try{
			getStory(index, history);
			currentStoryIndex = index;
		} catch (e) {
			Common.hideLoading();
		}
	};

	/**
	 * Exported Function: Update story list.
	 */
	Story.update = function(storyList) {
		var items_per_page = 15;
		stories = storyList;
		$("#storyTab").text("Story (" + stories.length + ")");
		
		currentStoryIndex = -1;
		//$("#stories").slideUp(300);
		var initPagination = function() {
			//story list pageination
			var list = d3.select("#stories-hide");
			list.selectAll("li").remove();
			list.selectAll("p").remove();
			for(var i = 0; i < storyList.length; i ++) {
				list.append("li")
					.append("a")
					.attr("href", "javascript:void(0);")
					.text(storyList[i].label)
					.attr("onclick", "javascript:Story.open(" + i + ");");
				list.append("p")
					.text("LOADING ...")
					.style("display", "none");
			}
			
			var num_entries = $("#stories-hide li").length;
			// 创建分页
			
			$("#story-pager").pagination(num_entries, {
				num_edge_entries: 1, //边缘页数
				num_display_entries: 3, //主体页数
				callback: storyPageSelectCallback,
				items_per_page: items_per_page, //每页显示5项
				prev_text:"<",
				next_text:">"
			});
			
		}();
		
		function storyPageSelectCallback(page_index, jq){
			//var items_per_page = 3;
			var num_entries = $("#stories-hide li").length;
			var max_elem = Math.min((page_index+1) * items_per_page, num_entries);
			
			//$("#stories").animate({width : "toggle"}, "fast", function() {
				$("#stories").html("");
				// 获取加载元素
				for(var i=page_index*items_per_page;i<max_elem;i++){
					$("#stories").append($("#stories-hide li:eq("+i+")").clone());
				}
				//$("#stories").animate({width : "toggle"}, "fast");
			//});
			
			//阻止单击事件
			return false;
		}
		
		//$("#stories").slideDown(300);
		//Story.open(0);
	};
	
	Story.getStories = function() {
		return stories;
	};
	
	namespace.Story = Story;
})(org.xlike.thu);