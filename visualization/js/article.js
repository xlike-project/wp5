(function (namespace) {
  var Article = {},
    articles = [],
    dialog;
  
  var armaxlen = 65;
  
  //var flag = 0;
  var articleidArray = new Array();
  
  Article.articleItemHtml = function (d) {
	articleidArray.push(d.id);
	
	var title = d.title;
	if(title.length > armaxlen){
		title = title.substring(0,armaxlen) + "...";
	}
	
    var html = "<a href='javascript:void(0);' ";
    if(d.related)
      html += "style='color:gray;' ";
    html += "onclick=\"javascript:Article.open('" + d.id + "');\"> >"
        + title + " </br><i class='i'>(" + d.source + " " + d.date + ")</i>"
        + "</a>";
    return html;
  };
  
  Article.update = function (articleList) {
    articles = articleList;
    $("#articleTab").text("Article (" + articles.length + ")");
    var initPagination = function() {
      //article list pageination
      /*
      var pagerOpts = {
            num_edge_entries: 2, //边缘页数
            num_display_entries: 5, //主体页数
            //callback: cusPageSelectCallback,
            items_per_page: items_per_page, //每页显示5项
            prev_text:"<",
            next_text:">"
          };
      */
      Common.page({
          container: "#articles",
          pager: "#art-pager",
          itemCreator: Article.articleItemHtml,
          data: articles,
          pagerOpts: Common.getPagerOpts({items_per_page: 15})
        });
    }();
  };

  Article.open = function(id) {
    //window.open("article.html?id=" + id, 'article', 'height=768px, width=1024px, scrollbars=yes, resizable=yes');
    settingsHide();
	
	if(dialog && dialog.dialog('isOpen')) {
      //dialog.dialog('option', 'title', "");
      dialog.dialog('close');
      $("#title").text("");
      $("#from").text("");
      $("#date").text("");
      $("#url").text("");
      $("#abstract").text("");
      $("#load").show();
    }
    dialog = $("#article-dialog").dialog({"width":800, "height": 600, 'title': 'Article Details'});
    Article.load(id);
  };
  
  Article.load = function(id) {
    //Common.showLoading();
    $("#load").show();
    $("#artpanel").hide();
    $.getJSON(Common.getArticleQueryURL(id), function(data) {
      try{
        //$("#title").text(data.title);
		var previousid = 0;
		var nextid = 0;
		
		for(var i in articleidArray){
			if(articleidArray[i] == id){
				previousid = (i) - 1;
				nextid = parseInt(i) + 1;
				break;
			}
		}
		
		var navigation = "<span id='navart'>";
		
		if(previousid <= -1 && nextid < articleidArray.length + 1){
			navigation += "<a href='#' class='navarticle' onclick=\"javascript:Article.open('" + articleidArray[nextid] + "');\" style='color: #A52A2A;'>next</a>";
		}else if(previousid > -1 && nextid < articleidArray.length + 1){
			navigation += "<a href='#' class='navarticle' onclick=\"javascript:Article.open('" + articleidArray[previousid] + "');\" style='color: #A52A2A;'>previous</a>";
			navigation += "<a href='#' class='navarticle' onclick=\"javascript:Article.open('" + articleidArray[nextid] + "');\" style='color: #A52A2A;'>next</a>";
		}else if(previousid > -1 && nextid >= articleidArray.length + 1){
			navigation += "<a href='#' class='navarticle' onclick=\"javascript:Article.open('" + articleidArray[previousid] + "');\" style='color: #A52A2A;'>previous</a>";
		}
		navigation += "</span>";
		
		$("#title").html(data.title + navigation);
        //dialog.dialog('option', 'title', 'Article Details');
        $("#from").html("<i>" + data.source + "</i>");
        $("#date").html("<i>" + data.date + "</i>");
        $("#url").html("<a href='" + data.url + "' _target=blank><i>" + data.url + "</i></a>");
        $("#abstract").html(data.abstract.replace(new RegExp("\n", "g"), "<br/><br/>"));
        //create entity, cutome-entity, story and related article list
        var initPagination = function() {
          //article list pageination
          var articles = Article.mergeRelated(data);
          /*var pagerOpts = {
                num_edge_entries: 2, //边缘页数
                num_display_entries: 5, //主体页数
                //callback: cusPageSelectCallback,
                items_per_page: items_per_page, //每页显示5项
                prev_text:"<",
                next_text:">"
              };
              */
          $("#relart").text("Related Articles (" + articles.length + ")");
          Common.page({
              container: "#related-articles",
              pager: "#ret-art-pager",
              itemCreator: Article.articleItemHtml,
              data: articles,
              pagerOpts: Common.getPagerOpts({items_per_page: 10})
            });
          var stories = [];
          for(var j = 0; j < data.related.length; j ++) {
            if(data.related[j].stories)
              stories = stories.concat(data.related[j].stories);
          }
          $("#relsto").text("Related Stories (" + stories.length + ")");
          //hack stories list in Story context to make history works
          var s = Story.getStories();
          Array.prototype.splice.apply(s, [s.length, 0].concat(stories)); 
          Common.page({
              container: "#related-stories",
              pager: "#ret-story-pager",
              itemCreator: Story.storyItemHtml,
              data: stories,
              pagerOpts: Common.getPagerOpts({items_per_page: 10})
            });
          //pagerOpts.items_per_page = 10;
          //hack entities list in Entity context to make history works
          var e = Entity.getEntities();
          Array.prototype.splice.apply(e, [e.length, 0].concat(data.entities)); 
          $("#relent").text("Related Entities (" + data.entities.length + ")");
          Common.page({
              container: "#related-entities",
              pager: "#ret-ent-pager",
              itemCreator: Entity.entityItemHtml,
              data: data.entities,
              pagerOpts: Common.getPagerOpts({items_per_page: 10})
            });
        }();
        //Common.hideLoading();
        $("#load").hide();
        $("#artpanel").show();
        } catch(e) {
          //Common.hideLoading();
          $("#load").hide();
          alert("Oops, we got an error...");
          console.log(e);
          
        }
    })
    .error(function(){ Common.hideLoading(); alert("Oops, we got an error...");});
  };
  Article.mergeRelated = function(data) {
    var as = [];
    if(data.articles)
      as = as.concat(data.articles);
    
    if(data.related) {
      for(var i in data.related) {
        for(var j in data.related[i].articles) {
          var a = data.related[i].articles[j];
          a.related = true;
          as.push(a);
        }
      }
    }
    return as;
  };
  
  Article.closePopup = function () {
    if(dialog && dialog.dialog('isOpen')) {
      dialog.dialog('close');
    }
  };
  
  namespace.Article = Article;
})(org.xlike.thu);