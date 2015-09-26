 $.fn.serializeObject = function()
{
   var o = {};
   var a = this.serializeArray();
   $.each(a, function() {
       if (o[this.name]) {
           if (!o[this.name].push) {
               o[this.name] = [o[this.name]];
           }
           o[this.name].push(this.value || '');
       } else {
           o[this.name] = this.value || '';
       }
   });
   return o;
};

var postNewThread = function(event){
		event.preventDefault();
		$(".newThread").css("display","none");
		var newBody = $("#newPostForm").serializeObject();
		console.log("We've found it then");
		console.log(newBody)
		$("#newPostForm")[0].reset();
		$.ajax({
			type:"POST",
			url:"/thread",
			contentType:"application/json",
			dataType:"json",
			data:JSON.stringify(newBody), 
			success:function(postedData){
				console.log("We've been done with posting the newthing");
				console.log(JSON.stringify(postedData));
				$(".newThread").html(applyTemplate("newpost", {}));
			}
		});        			
		
	};
var getTemplate = function(name, callback) {
   return $.get('/templates/'+name+'.hbrs').then(function(src) {
    console.log("We've found")
    console.log(src)
	callback(Handlebars.compile(src));
 });
}
var templateNames = ["post", "newpost"]
var templates = {}
var applyTemplate = function(templateName, data){
	return templates[templateName](data);
}
var cancelFunction = function(event){
	    event.preventDefault();
	    console.log("Clicking Cancel");
	    $(".newThread").html(applyTemplate("newpost", {}));
	    $(".newThread").css("display","none");
	    $("#btnPostIt").off("click");
	}
var postFunction = function(event){
		$(".newThread").css("display","block");
		$("#btnPostIt").one("click", postNewThread);
		$("#btnCancelPostIt").click(cancelFunction);//TODO is this adding many too many handlers?
	};
	
var replyCallback = function(event){
	console.log("Reply For " + findId(event));
	$("#replyField").attr("value", findId(event));
	postFunction(event);
};
var viewCallback = function(event){
	var target = $( event.target );
	$("#main").html("");
	var whichId = findId(event);
	console.log("View For " +  whichId);
	$.ajax({
		type:"GET",
		url:"/fullThread/"+whichId,
		dataType:"json",
		success:function(data){
			console.log("Successfully Loaded Thread");
			console.log(data)
			displayPosts(data, "post");
		}
	});       			
};  
        		
var findId = function(event){
   var target = $( event.target );
   var classes = target.attr("class").split(" ");
   for(var c in classes){
    var clazz = classes[c];
   	if(clazz.startsWith("id-")){
   		return parseInt(clazz.replace("id-",""));
   	}
   }	
   return undefined;
};

var loadPostFunction = function(event){
		event.preventDefault();	
		$("#main").html("");
		var whichId = $("#txtSearch").val();
		console.log("We'd like to load " + whichId);        			
		$.ajax({
			type:"GET",
			url:"/fullThread/"+whichId,
			dataType:"json",
			success:function(data){
				console.log("We've had some success in load post then");
				displayPosts(data, "post")
			}
		});        			
		
		
};
var displayPosts = function(data, template){
	var i =0;
	for(i=0; i<data.length;i++){
		$("#main").append(applyTemplate(template, data[i]));
		var lastChild = $('#post-'+data[i].id);
		lastChild.find(".button-view").click(viewCallback);
		lastChild.find(".button-reply").click(replyCallback);
	}
}
var searchFunction = function(event){
	    event.preventDefault();
		var whichTags = $("#txtSearch").val();
		$("#main").html("");
		$.ajax({
			type:"GET",
			url:"/tagged?tags="+whichTags,
			dataType:"json",
			success:function(data){
				console.log("We've had some success then");
				console.log(data)
				displayPosts(data, "post")
			}
		});
};

var loadTopStories = function(){
		$("#main").html("");
		$.ajax({
			type:"GET",
			url:"/entry",
			dataType:"json",
			success:function(data){
				console.log("We've had some success then loadTopStories");
				console.log(data)
				displayPosts(data, "post")
			}
		});
};

var completeInitialize = function(){
	console.log("We've loaded the stuff, time to get started");
	$(".newThread").html(applyTemplate("newpost", {}));		
	loadTopStories();					
}
var initialize = function(){
	console.log(document.cookie);
    var template = "No Load"
    var i;
    var pendingTemplates = templateNames.length;
    
    for(i=0; i<templateNames.length;i++){
    	(function(){
    		var name = templateNames[i];
			getTemplate(name, function(tmpl){
				templates[name] = tmpl;
				pendingTemplates--;
				//TODO import async or underscore and do this properly
				if(pendingTemplates==0){
					completeInitialize();
				}
			});
		}());    
    }
	
	
	$("#btnPost").click(postFunction);
	        		
	$("#btnLoad").click(loadPostFunction);      		
	
	$("#btnSearch").click(searchFunction);

}