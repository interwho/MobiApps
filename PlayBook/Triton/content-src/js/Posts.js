window.Triton.Posts = (function(){

        var obj = {};
        var thread = false;
        obj.draw = function(editor){

            thread = editor.current();

            if(editor.current()){
                drawPosts();
            }else{
                drawWelcome();
            }
        }

        function drawPosts(){
            $("#welcome").hide();
            var posts = thread.posts.getAll();
            var l = posts.length;

            var div = $("<div />",{
                "id" : "posts"
            });

            // Add the title
            $("<h1 />", {
               "html": thread.title.get(),
               "id" : "title"
            }).appendTo(div);

            // Add each post
            for(var i=0; i<l; i++){
                var current = posts[i];
                var post = $("<section />", {
                    "html" : current.post_content.html,
                    "id" : current.post_id
                });

                var anchor = $('<a/>', {
                    "name": current.thread_id + '/' + current.post_id
		}).appendTo(div);
		
                $(post).appendTo(div);
            }

            $("<div />", {
                "class" : "bottomWash",
                "html" : "&nbsp;"
            }).appendTo(div);
            
            $("#posts").replaceWith(div);
        };

        function drawWelcome(){
            var div = $("<div />",{
                "id" : "posts",
            });
            $("#posts").replaceWith(div);
            $("#welcome").show();
        };

        return obj;
});
