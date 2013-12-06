function ctrlchart(divId){
	var div = document.getElementById(divId);
	if(div.style.display != "block")
		div.style.display = "block";
	else 
		div.style.display = "none";
}

function ctrlcloud(divId){
	if(cloudflag == true){
		ctrlchart(divId);
	}
}

function hide(divId){
	var div = document.getElementById(divId);
	div.style.display = "none";
}

function hide(divId,articledivid){
	var div = document.getElementById(divId);
	div.style.display = "none";
	
	var articlediv = "#" + articledivid;
	$(articlediv).html("");
}


function hidemap(value,divstroy,divmap){
	if(value == "0"){
		document.getElementById(divstroy).style.display = "none";
		document.getElementById(divmap).style.display = "block";
	}else if(value == "1"){
		document.getElementById(divstroy).style.display = "block";
		document.getElementById(divmap).style.display = "none";
	}
}
