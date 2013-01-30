/**
 *
 */
(function (namespace) {
  var Story = {};
  var stories = [];
  var currentStoryId = -1;
  
  function updateStoryContent(data, id) {
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
    //update entity list, chart, cloud and map.
    Entity.update(s.entities, s.customEntities);
    var articles = Article.mergeRelated(s);
    Article.update(articles);
    if(Common.doChart())
      Chart.update(s.label, articles);
    Cloud.updateByKeywords(s.keywords.keywords);
    if(Common.online())
      Map.update(articles);
      
    Common.switchTab('article', $("#articleTab"));
  }
  
  function getStoryById(id) {
    for(var i in stories) {
      if(stories[i].id == id)
        return stories[i];
    }
  }
  
  /**
   * Inner Function: Get single story content by its id, and update.
   */
  function getStory(id, history) {
    //var id = stories[index].id;
    var story = getStoryById(id);
    if(Common.online()) {
      $.getJSON(Common.getStoryQueryURL(id, getSearchOptions()), function(data){
        updateStoryContent(data, id);
        Common.hideLoading();
        if(!history)
          Common.addHistory(data, "story");
      })
      .error(function(){
        Common.hideLoading();
        alert("Oops, we got an error.");
      });
    } else {
      //using local data at the moment
      updateStoryContent(storyQuery, id);
      if(!history)
        Common.addHistory(story, "story");
    }
  }
  
  /**
   * Exported Function: Unfolding a story block to display its abstract and article list.
   */
  Story.open = function(id, history){
    settingsHide();
    Article.closePopup();
    if(id == currentStoryId)
      return;
      
    Common.showLoading();
    try{
      getStory(id, history);
      currentStoryId = id;
    } catch (e) {
      Common.hideLoading();
    }
  };
  
  Story.storyItemHtml = function (d, index) {
    var html = "<a href='javascript:void(0);' "
        + "onclick='javascript:Story.open(\"" + d.id + "\");'>"
        + d.label
        + "</a>";
    return html;
  };
  
  /**
   * Exported Function: Update story list.
   */
  Story.update = function(storyList) {
    stories = storyList;
    $("#storyTab").text("Story (" + stories.length + ")");
    
    currentStoryId = -1;
    //$("#stories").slideUp(300);
    var initPagination = function() {
      //story list pageination
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
          container: "#stories",
          pager: "#story-pager",
          itemCreator: Story.storyItemHtml,
          data: stories,
          pagerOpts: Common.getPagerOpts({items_per_page: 15})
        });
    }();
  };
  
  Story.getStories = function() {
    return stories;
  };
  
  namespace.Story = Story;
})(org.xlike.thu);