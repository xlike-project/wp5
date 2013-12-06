	function page(divid, pagerid ,pagecount) {
		var items_per_page = pagecount;
		var initPagination = function(divid, pagerid) {
			var num_entries = $(divid).length;
			//alert(num_entries)
			// 创建分页
			$(pagerid).pagination(num_entries, {
				num_edge_entries: 1,
				//边缘页数
				num_display_entries: 2,
				//主体页数
				callback: callback,
				items_per_page: items_per_page,
				//每页显示1项
				prev_text: "<",
				next_text: ">"
			});

			function callback(page_index, jq) {
				//var items_per_page = 3;
				var num_entries = $(divid).css('display', 'none').length;
				var max_elem = Math.min((page_index + 1) * items_per_page, num_entries);
				// 获取加载元素
				for (var i = page_index * items_per_page; i < max_elem; i++) {
					$(divid + ":eq(" + i + ")").css('display', 'block');
				}
				//阻止单击事件
				return false;
			}
		} (divid, pagerid);
	  }
	  
	  function getchartarticle(url,totalPage,div){
		Common.showLoading();
		//document.write(url);
		$.getJSON(url, function(data) {
			var articledata = data.articles;
			//alert(articledata[0].title);
			var html = "<ul id='timechart_article' class='timechart_article'>";
			for(var a in articledata){
				html += "<li><a target='_blank' href='"+articledata[a].url+"'>>" + articledata[a].title +"<span>	(FROM: "+ articledata[a].source +")<span></a></li>";
			}
						
			html += "</ul>";

			var previousurl = "";
			var nexturl = "";
					
			var previouspageNum = 0;
			var nextpageNum = 0;
			var currNum = 0;
			
			var tempurl = url.replace(/&page=[0-9]{1,}/,"");
					
			if(url.indexOf("&page=") != -1){
				var pageafstr = url.substring(url.indexOf("&page="));
				pageafstr = pageafstr.replace(/&page=/,"");
											
				if(pageafstr.indexOf("&") != -1){
					currNum = Number(pageafstr.substring(0,pageafstr.indexOf("&")));
					previouspageNum = currNum - 1;
					nextpageNum = currNum + 1;
				}else {
					currNum = Number(pageafstr);
					previouspageNum = currNum - 1;
					nextpageNum = currNum + 1;
				}
			}else {
				previouspageNum = - 1;
				currNum = 0;
				nextpageNum = 1;
			}
					
			//alert("previouspageNum : " + previouspageNum + " currNum : " + currNum + " nextpageNum : " + nextpageNum + " totalPage : " + totalPage);
					
			html += "<div id='ctrlpage' class='ctrlpage'>";
					
			previousurl = tempurl + "&page=" + previouspageNum;
			nexturl = tempurl + "&page=" + nextpageNum;
					
			if(previouspageNum != -1 && nextpageNum < totalPage){
				html += "<a href='#' id='previous' onclick='getchartarticle(\""+previousurl+"\","+totalPage+",\""+div+"\")'>previous</a>";
				html += "<span id='current'>"+(currNum+1)+"</span>";
				html += "<a href='#' id='next' onclick='getchartarticle(\""+nexturl+"\","+totalPage+",\""+div+"\")'>next</a>";
			}else if(previouspageNum == -1 && nextpageNum < totalPage){
				html += "<span id='current'>"+(currNum+1)+"</span>";
				html += "<a href='#' id='next' onclick='getchartarticle(\""+nexturl+"\","+totalPage+",\""+div+"\")'>next</a>";
			}else if(previouspageNum == -1 && nextpageNum > totalPage){
				html += "<span id='current'>"+(currNum+1)+"</span>";
			}else if(previouspageNum != -1 && nextpageNum >= totalPage){
				html += "<a href='#' id='previous' onclick='getchartarticle(\""+previousurl+"\","+totalPage+",\""+div+"\")'>previous</a>";
				html += "<span id='current'>"+(currNum+1)+"</span>";
			}
				
			html += "</div>";
			$(div).html(html.replace("&amp;","&"));
			Common.hideLoading();
		})
	  }