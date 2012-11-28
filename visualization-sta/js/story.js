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
		Entity.update(s.entities);
		if(Common.doChart())
			Chart.update(s.articles);
		Cloud.updateByEntities(s.entities);
		if(Common.online())
			Map.update(s.articles);
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
		stories = storyList;
		currentStoryIndex = -1;
		$("#stories").slideUp(300);
		var list = d3.select("#stories");
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
		$("#stories").slideDown(300);
		//Story.open(0);
	};
	
	Story.getStories = function() {
		return stories;
	};
	
	namespace.Story = Story;
})(org.xlike.thu);