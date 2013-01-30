(function (namespace) {
  var Entity = {},
    entities = [],
    customes = [],
    timelines = [],
    MAX_LABEL_LENGTH = 20;
  
  Entity.getEntities = function() {
    return entities;
  };
  Entity.entityItemHtml = function (d) {
    var html = "<input class='icon' type='button' "
          + "title='Add to time line chart'"
          + "onclick='javascript:Entity.timeline(this, \"" + d.uri + "\");'"
          + "onmouseover=\"javascript:swapImg(this, 'on');\" onmouseout=\"javascript:swapImg(this, 'out');\"/>";
    html += "<a href='javascript:void(0);' "
          + "title='" + d.label + "' "
          + "onclick='javascript:Entity.select(\"" + d.uri + "\");'>"
          + (d.label.length < MAX_LABEL_LENGTH ? d.label : d.label.substring(0, MAX_LABEL_LENGTH) + "...") + ' (' + d.count + ')'
          + "</a>";
    return html;
  };
  Entity.update = function (entityList, customeList) {
    entities = entityList;
    if(customeList) {
      customes = customeList;
    }
    else customes = [];
    $("#hotTab").text("Hot (" + entities.length + ")");
    $("#customeTab").text("STA (" + customes.length + ")");
    var initPagination = function() {
      //custome entity list pageination
/*      var pagerOpts = {
            num_edge_entries: 2, //边缘页数
            num_display_entries: 5, //主体页数
            //callback: cusPageSelectCallback,
            items_per_page: items_per_page,
            prev_text:"<",
            next_text:">"
          };
      */
      if(customeList) {
        Common.page({
          container: "#custome-show",
          pager: "#cus-pager",
          itemCreator: Entity.entityItemHtml,
          data: customes,
          pagerOpts: Common.getPagerOpts({items_per_page: 20})
        });
      }
      
      //hot entity list pageination
      Common.page({
        container: "#entities-show",
        pager: "#ent-pager",
        itemCreator: Entity.entityItemHtml,
        data: entityList,
        pagerOpts: Common.getPagerOpts({items_per_page: 20})
      });
    }();   
  };

  Entity.select = function(uri, history) {
    settingsHide();
    Article.closePopup();
    Common.showLoading();
    var storyList = [];
    if(Common.online()) {
      $.getJSON(Common.getEntityQueryURL(uri, getSearchOptions()), function(data) {
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
      var id = onclick.substring(onclick.indexOf('\"') + 1, onclick.lastIndexOf('\"'));
      if(uri == id)
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
      $.getJSON(Common.getEntityQueryURL(uri, getSearchOptions()), addTimeline)
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