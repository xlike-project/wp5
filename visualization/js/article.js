(function (namespace) {
	var Article = {},
		articles = [];
		
	Article.update = function (articleList) {
		articles = articleList;
		$("#articleTab").text("Article (" + articles.length + ")");
		var items_per_page = 15;
		var initPagination = function() {
			//story list pageination
			var list = d3.select("#articles-hide");
			list.selectAll("li").remove();
			//list.selectAll("p").remove();
			for(var i = 0; i < articleList.length; i ++) {
				list.append("li")
					.append("a")
					.attr("href", "javascript:void(0);")
					.text(articleList[i].title)
					.attr("onclick", "javascript:Article.open('" + articleList[i].url + "');");
				//list.append("p")
				//	.text("LOADING ...")
				//	.style("display", "none");
			}
			
			var num_entries = $("#articles-hide li").length;
			// 创建分页
			
			$("#art-pager").pagination(num_entries, {
				num_edge_entries: 1, //边缘页数
				num_display_entries: 3, //主体页数
				callback: articlePageSelectCallback,
				items_per_page: items_per_page, //每页显示5项
				prev_text:"<",
				next_text:">"
			});
			
			function articlePageSelectCallback(page_index, jq){
				//var items_per_page = 3;
				var num_entries = $("#articles-hide li").length;
				var max_elem = Math.min((page_index+1) * items_per_page, num_entries);
				
				//$("#articles").animate({width : "toggle"}, "fast", function() {
					$("#articles").html("");
					// 获取加载元素
					for(var i=page_index*items_per_page;i<max_elem;i++){
						$("#articles").append($("#articles-hide li:eq("+i+")").clone());
					}
					//$("#articles").animate({width : "toggle"}, "fast");
				//});
				
				//阻止单击事件
				return false;
			}
		}();
	};

	Article.open = function(url) {
		window.open(url, 'newwindow', 'height=768px, width=1024px, scrollbars=yes, resizable=yes');
	};
	
	namespace.Article = Article;
})(org.xlike.thu);