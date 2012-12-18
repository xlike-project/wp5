//点击国家列表旁的添加按钮是触发，添加国家
function addCountries(){
	var allStr = "all countries and regions";
	var selectCountry = $("#slCountries").val();
	if(selectCountry == "all"){
		$("#countries").html(allStr);
		return;
	}
	$("#countries").html($("#countries").html().replace(allStr, ""));
	addCountry(selectCountry);
	
}
//实际的添加国家函数
function addCountry(country){
	var allStr = "all countries and regions";
	$("#countries").html($("#countries").html().replace(allStr, ""));
	var selectCountry = country;
	var existed = 0;
	var count = 0;
	$("#countries").find("span").each(function(){
		if($(this).text() == selectCountry){
			alert(selectCountry + " has been already in the list");
			existed = 1;
			return;
		}
		count ++;
	});
	if(existed == 1)
		return;
	if(count>=5){
		alert("You can select no more than 5 countries/regions");
			return;
	}
	var newSpan = "<span style=\"margin-right:2px;\">"+selectCountry+"<img src=\"images/del.jpg\" onclick=\"javascript:delCountries('"+selectCountry+"');\" /></span>";
	$("#countries").html($("#countries").html()+newSpan);
}
//点击国家旁边的删除按钮时触发，删除国家
function delCountries(country){
	$("#countries").find("span").each(function(){
		if($(this).text() == country){
			$(this).remove();
		}		
	});
	var allStr = "all countries and regions";
	if($("#countries").html().trim()== "")
		$("#countries").html(allStr);
}
//通过参数字符串设置控件状态，该字符串可以从cookie读取
function setParaStr(paras){
	var paraArray = paras.split("&");
	var paraCount = paraArray.length;
	var i=0;
	$("input:checkbox[name='cbLanguage']").removeAttr("checked");
	$("input:checkbox[name='cbGroup']").removeAttr("checked");
	for(i = 0; i < paraCount; i++){
		var items = paraArray[i].split("=");
		if(items.length < 2)
			continue;
		if(items[0] == "pageSize")
			setSelected("rblPageSize", items[1]);
		else if(items[0] == "ts")
			setSelected("rblTimeDuration", items[1]);
		else if(items[0] == "lang")
			setChecked("cbLanguage", items[1], 0);
		else if(items[0] == "group")
			setChecked("cbGroup", items[1], 0);
		else if(items[0] == "country")
			addCountry(items[1]);
		
	}
}
//Set selected item
function setSelected(id, val) {
	var selector = "#" + id + " > option";
	$(selector).each(function(){
		if($(this).val() == val)
			$(this).attr("selected", true);
		else $(this).removeAttr("selected");
	});
}

//设置列表选择项，被setParaStr函数调用
function setChecked(id, val, isRadioList){
	if(isRadioList)
		id = "input:radio[name='"+id+"']";
	else
		id = "input:checkbox[name='"+id+"']";
	$(id).each(function(){
		if($(this).val()==val)
			$(this).attr("checked",true);
	});
	
}
//从控件状态生成参数字符串
function getParaStr(opt){
	var paraStr = "";
	if(opt) {
		if(opt.pageSize)
			paraStr += "pagesize=" + opt.pageSize;
		if(opt.ts)
			paraStr += "&ts=" + opt.ts;
			
		if(opt.lang)
			for(i in opt.lang)
				paraStr += "&lang=" + opt.lang[i];
		
		if(opt.group) {
			if(Common.sta()) {
				for(i in opt.group)
					paraStr += "&group=" + opt.group[i];
			} else {
				paraStr += "&group=general";
			}
		}
		
		if(opt.countries)
			for(i in opt.countries)
				paraStr += "&country=" + opt.countries[i];
	} else {
		var pageSize = $("#rblPageSize > option:selected").val(); 
		var timeSpan = $("#rblTimeDuration > option:selected").val(); 
		
		paraStr = "pagesize="+pageSize;
		paraStr += "&ts="+timeSpan;
		
		//language
		$("input:checkbox[name='cbLanguage']:checked").each(function() {
			paraStr+= "&lang="+$(this).val();
		});
		
		//group
		if(Common.sta()) {
			$("input:checkbox[name='cbGroup']:checked").each(function() {
				paraStr+= "&group="+$(this).val();
			});
		} else {
			paraStr += "&group=general";
		}
		
		$("#countries").find("span").each(function(){
			paraStr+= "&country="+$(this).text();
		});
		 
	}
	return paraStr;
}

function getSearchOptions() {
	var opt = {};
	var pageSize = $("#rblPageSize > option:selected").val(); 
	var timeSpan = $("#rblTimeDuration > option:selected").val(); 
	
    opt.pageSize = pageSize;
    opt.ts = timeSpan;
    
	//language
	lang = [];
	$("input:checkbox[name='cbLanguage']:checked").each(function() {
		lang = lang.concat($(this).val());
    });
	opt.lang = lang;
    
	//group
	group = [];
	$("input:checkbox[name='cbGroup']:checked").each(function() {
		group = group.concat($(this).val());
    });
	opt.group = group;
    
	countries = [];
    $("#countries").find("span").each(function(){
		countries = countries.concat($(this).text());
	});
	opt.countries = countries;
	
	return opt;
}


//生成分页器
function renderPaging(url,curPage,totalPage){  
  	var pageBarNum = 5;  		  
	var pageStr = '';  
  	var gurl = function(num){  
  		return url.replace('-page-',num);  
	};  
	curPage = parseInt(curPage);  
	totalPage = parseInt(totalPage);  
	if(curPage > 1){  
		pageStr += '<span >&nbsp;<a  href="' + gurl(curPage-1) + '">pre</a>&nbsp;</span>';  
	}     
	var index = Math.floor(pageBarNum/2);  
	var start = (curPage-index)>0 ? (curPage-index) : 1;  
	var end = curPage + (pageBarNum-index);  
	end = end<pageBarNum ? pageBarNum : end;  
	if(start > 1){  
		pageStr += '<span >&nbsp;<a  href="' + gurl(1) + '">1</a>&nbsp;</span>';  
	}  
	if(start > 2){pageStr += '<span >&nbsp;...&nbsp;</span>';}  
	for(var i=start; i<end; i++){  
		if(i>totalPage) break;  
	  	if(i == curPage){  
	  		pageStr += '<span >&nbsp;' + i + '&nbsp;</span>';  
	  	}else{  
	  		pageStr += '<span >&nbsp;<a  href="' + gurl(i) + '">' + i + '</a>&nbsp;</span>';     
	  	}  
	}  
	if(end < totalPage){  
		pageStr += '<span >&nbsp;...&nbsp;</span>';  
		pageStr += '<span >&nbsp;<a  href="' + gurl(totalPage) + '">' + totalPage + '</a>&nbsp;</span>';  
	}  
	if(curPage < totalPage){  
		pageStr += '<span >&nbsp;<a  href="' + gurl(curPage+1) + '">next</a>&nbsp;</span>';  
	}  
	return pageStr;  
} 

function advanced() {
	if($("#settings").css("display") == "none") {
		//alert($("#search").offset().left);
		$("#settings").css("display", "block").css("left", $("#search").offset().left);
	} else $("#settings").css("display", "none");
}

function settingsOk() {
	//TODO: save settings
	var settings = getParaStr();
	//alert(settings);
	$.cookie('xlike_search_settings', settings, { expires: -1, path: '/' });
	settingsHide();
	//alert($.cookie('xlike_search_settings'));
}

function settingsCancel() {
	settingsHide();
}

function settingsHide() {
	$("#settings").css("display", "none");
}

function loadSettings() {
	var cookie = $.cookie("xlike_search_settings");
	//alert(cookie);
	if(cookie)
		setParaStr(cookie);
	if(!Common.sta()) {
		$("#staGroup").hide();
	}
}

//显示分页方法测试
//$("#pager").html(renderPaging("test?-page-",30,50));
//参数字符串方法测试
//setParaStr("pageSize=500&ts=4w&lang=ger&lang=spa&lang=slv&lang=cat&group=general&group=economy&group=politics&group=culture&country=Croatia&country=Slovenia&country=US");
loadSettings();