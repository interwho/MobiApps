window.Triton.Editor = (function(window){
    var obj = {};
    var $t = window.Triton;
    $t.editor = obj;
    var index,
        manager,
        notifier,
        posts,
        ui,
        thread,
        sidebar,
        settings,
        storage;

    // Loads the base objects
    obj.load = function(){

        // Construct base objects
        assert(typeof Notifier != "undefined", "Editor.js->Editor(); Notifier not found.")
        notifier = Notifier();

        try{
            assert(typeof $t.Storage != "undefined", "Editor.js->Editor(); Storage class not found.")
            storage = $t.Storage(window);

            assert(typeof $t.Encoder != "undefined", "Editor.js->Editor(); Encoder class not found.");
            assert(typeof $t.ThreadIndex != "undefined", "Editor.js->Editor(); ThreadIndex class not found.");
            assert(typeof $t.ThreadManager != "undefined", "Editor.js->Editor(); ThreadManager class not found.")
            manager = $t.ThreadManager(storage);
            manager.init();

            index = manager.getIndex();

            assert(typeof $t.Posts != "undefined", "Editor.js->Editor(); Posts class not found.");
            posts = $t.Posts();

            assert(typeof $t.Settings != "undefined", "Editor.js->Editor(); Settings class not found.");
            settings = $t.Settings(window);
            settings.init();
            window.Triton.userSettings = settings;

        }catch(e){
            obj.createAlert("Error: " + e.getMessage(), "high", false)
            return false;
        }

        // Check for other depedant objects
        // (These objects are initialized later due to dependencies)
        var requiredObjs = [
            "Thread",
            "Encoder",
            "ThreadIndex",
            "ThreadManager",
            "KUI",
            "Sidebar"
        ];
        var len = requiredObjs.length;
        for(var i = 0; i < len; i++){
            assert(typeof $t[requiredObjs[i]] != "undefined", "Editor.js->Editor();6 "+ requiredObjs[i] +" not found.");
        }

        return true;

    }
    
    // Initializes the Editor
    obj.init = function(){

        // Get the current thread
        thread = loadCurrentThread();

        // Create UI Object
        ui = $t.KUI(obj);

        // Create Sidebar Object
        sidebar = $t.Sidebar(obj);
        $t.TritonNav(sidebar).init();
        sidebar.init();

        // Register objects to be notified upon changes
        notifier.register(sidebar);
        notifier.register(posts);
        
        // Draw the Window
        obj.draw();

        // Display Version Information
        var version = $t.version;
        if($t.debug == true){
            version += " Dev";
        }

        // Check if we've updated
        if(window.localStorage.getItem("updated") == "yes"){
            
            if($t.debug == true){
                obj.createAlert("You've updated to Triton " + version + ". Built " + $t.updated + " " + $t.updated_time + ". Enjoy.", "low", 10000);
            }else{
                obj.createAlert("You've updated to Triton " + version + ". Enjoy.", "low", 10000);
            }

            window.localStorage.removeItem("updated");

        }else{

            if($t.debug == true){
                obj.createAlert("Running Triton " + version + ". Built " + $t.updated + " " + $t.updated_time + ". Enjoy.", "low");
            }else{
                obj.createAlert("Running Triton " + version + ". Enjoy.", "low");
            }
            
        }

        $("<div>", {
            "class" : "meta",
            "html" : "v" + version + " - " + "Build " + $t.updated
        }).appendTo("nav > header");

        
        if($t.compact == true){
            $("body").addClass("compact");
        }
        
    }

    // Draws the HTML
    obj.draw = function(bindEvents, callback){

        if(typeof bindEvents == "undefined"){
            bindEvents = true;
        }

        // Notify the other modules that something has changed
        notifier.notify("draw", obj);

        // Allows for disabling the default UI
        // TODO: This should really be triggered by the posts module
        if(bindEvents == true){
            ui.init();
        }

        if(typeof callback == "function"){
            callback();
        }

        return true;
    }
    obj.redraw = function(){obj.draw();}

    // Loads the current thread from memory based on the URL fragment
    function loadCurrentThread(){

        // Get the current post ID
        var hash = window.location.hash.substr(1);
		var components = hash.split('/');

        try{
            // Check if a thread with this ID exists
            if(typeof window.localStorage.getItem(components[0]) == "string"){
                return manager.getThread(components[0]);
            }else{
                return false;
            }
            
        }catch(e){
            obj.alert("Could not auto-load thread.", "high");
        }
    }

    // Returns the current thread object
    obj.getThread = function(){
        if(typeof thread == "undefined"){
            return false;
        }else{
            return thread;
        }
        
    }
    obj.current = function(){return obj.getThread();}

    obj.loadThread = function(id){
        thread = manager.getThread(id);
    }
    obj.setThread = function(newThread){
        thread = newThread;
    }
    obj.clearThread = function(){
        thread = false;
    }

    // Thread System Accessors
    obj.getManager = function(){return manager;}
    obj.getEncoder = function(){return manager.getEncoder();}
    obj.getIndex = function(){return manager.getIndex();}

    // Reloads the page
    obj.reload = function(){
        location.reload(true);
    }

    // Creates a new post on the current thread
    obj.createPost = function(){
        $('textarea').blur();
        var id = obj.current().createPost("");

        // Display the box and focus it
        obj.draw();
        $("#" + id).click();
    }

    obj.openDoc = {

        // Creates a new document and opens it
        "create" : function(){
            var thread = manager.createThread("Test");
            thread.createPost("test");
            location.hash = thread.getID();
            obj.openDoc.open(thread.getID());
        },

        "open" : function(id){
            obj.loadThread(id);
            obj.draw();
        },

        // Deletes the current thread
        "destroy" : function(){

            var status = confirm("Do you really want to delete this thread?");
            if(status == false){
                return false;
            }

            // Delete the Post
            manager.removeThread(obj.current().getID());

            // Move back a post
            index.refresh();
            var threads = index.getIndex();

            if(threads.length > 0){
                var last = threads[0].id;
                location.hash = last;
                obj.loadThread(last);
                obj.draw();
            }else{
                location.hash = "";
                obj.clearThread();
                obj.draw();
            }
        }
    }

    // Aliases
    obj.createDocument = obj.openDoc.create;
    obj.deleteDocument = obj.openDoc.destroy;

    obj.nav = (function(){

            var openNav = function(){
                $("nav").animate({"right": "0px"});
                $("#wash").show()
                $("#logo").unbind("click");
                $("#logo").click(closeNav);
                $("#wash").click(closeNav);
                window.Triton.menuOpen = true;
            }

            var closeNav = function(){
                $("nav").animate({"right": "-320px"});
                $("#wash").hide()
                $("#logo").unbind("click");
                $("#logo").click(openNav);
                window.Triton.menuOpen = false;
            }
            
            $("#logo").click(openNav);
            $t.menuOpen = false;

            return {
                "open" : openNav,
                "close" : closeNav
            };
            
    })();

    function _showDialog(div) {
        $('.page_dialog').hide('slow', function() {
            $('.page_dialog').remove();
        });
        $(div).addClass('page_dialog').appendTo(document.body).show('slow');
    }

	// Export functionality. Allows document to be exported into many
	// different formats.

	obj.exporters = {
		json: function(threads) {
				  return JSON.stringify(threads);
              },
        html: function(threads) {
                  var all_html = '';

                  for (var i = 0; i < threads.length; i++) {
                      var thread = threads[i];
                      var posts = thread.thread_posts;

                      all_html += '<h1 id="' + thread.thread_id + '">' + thread.thread_title + '</h1>';
    
                      for (var j = 0; j < posts.length; j++) {
                          all_html += posts[j].post_content.html;
                      }
                  
                  }

                  return all_html;
              }
	};
    obj.exporters.json.displayName = 'JSON';
    obj.exporters.html.displayName = 'HTML';


	obj.exportCurrent = function(format) {
		return obj.exporters[format || 'json'](manager.getAll());
	};

	obj.dumpDocument = function(format) {
		// Find all documents
		var exported = obj.exportCurrent(format || 'json');
		var layer;

        // If we have, in fact, already shown the dialog, just re-export!
		if ($('#export').length)
			return $('#export_contents').val(exported);

        // First, generate the format selection box
        var formatSelection = $('<select/>').attr('id', 'export_format');
        for (var exporter in obj.exporters) {
            if (obj.exporters.hasOwnProperty(exporter)) {
                var caption = obj.exporters[exporter].displayName;
                var element = $('<option/>').attr('value', exporter).text(caption);
                formatSelection.append(element);
            }
        }
        // It has to re-export the document every time it changes
        formatSelection.bind('change', function (ev) {
            obj.dumpDocument($(this).val());
        });


        // Now, generate the main DIV containing the exported text
		layer = $('<div/>')
			.attr('id', 'export')
			.append($('<div/>').text('Export').addClass('dialog_title'))
			.append($('<br/>'))
			.append($('<div/>').text('Copy the following text:'))
			.append($('<textarea/>')
						.attr('id', 'export_contents')
                        .addClass('dump_area')
						.val(exported))
            .append($('<div/>')
                        .css('float', 'left')
                        .append(formatSelection))
			.append($('<div/>')
						.css('float', 'right')
						.append($('<button/>')
									.text('Close')
									.click(function() {
                                        layer.hide('slow', function() {
                                            layer.remove();
                                        });
									})));

        _showDialog(layer);
	};

    // Import. It's kinda the opposite of export.
    obj.importers = {
        json: function(input) {
                  var threads = $.parseJSON(input);
                  var newThreadId;
                  
                  for (var i = 0; i < threads.length; i++) {
                      var original = threads[i];
                      var thread = manager.createThread();
                      thread.title.set(original.thread_title);
                      newThreadId = thread.getID();

                      var posts = original.thread_posts;
                      for (var j = 0; j < posts.length; j++) {
                          var post = thread.posts.create('');
                          thread.posts.modify(post, posts[j].post_content.plain);
                      }
                  }

                  // Load last thread imported
                  location.hash = newThreadId;
                  obj.loadThread(newThreadId);
                  obj.draw();
              }
    };
    obj.importers.json.displayName = 'JSON';

    obj.importToDocument = function(input, format) {
        obj.importers[format || 'json'](input);
    };

    obj.importDisplay = function(input, format) {
        // First: generate the dialog

        // Generate the format selection box
        var formatSelection = $('<select/>').attr('id', 'import_format');
        for (var importer in obj.importers) {
            if (obj.importers.hasOwnProperty(importer)) {
                var caption = obj.importers[importer].displayName;
                var element = $('<option/>').attr('value', importer).text(caption);
                formatSelection.append(element);
            }
        }

        // Crash 'n' burn
        var hideDestroyImport = function() {
            $('#import').hide('slow', function() {
                $('#import').remove();
            });
        };
        
        // Now the DIV
        var layer = $('<div/>')
            .attr('id', 'import')
            .append($('<div/>').addClass('dialog_title').text('Import'))
            .append($('<div/>').text('Select the appropriate format, paste in your document, and click OK to import.'))
            .append($('<br/>'))
            .append($('<table/>')
                        .css('width', '100%')
                        .append($('<tr/>').append($('<td>Format: </td>'))
                            .append($('<td/>').append(formatSelection)))
                        .append($('<tr/>').append($('<td>Contents: </td>'))
                            .append($('<td/>')
                                .append($('<textarea/>').attr('id', 'import_contents').addClass('dump_area'))))
                        .append($('<tr/>').append($('<td/>'))
                            .append($('<td/>')
                                .append($('<button>Import</button>').click(function(ev) {
                                        obj.importToDocument($('#import_contents').val(), $('#import_format').val());
                                        hideDestroyImport();
                                    }))
                                .append($('<button>Close</button>').click(function(ev) {
                                        hideDestroyImport();
                                })))));

        _showDialog(layer);
    }

    obj.alerts = {

        "create" : function(message, priority, timeout){

            if(priority != "high" && priority != "medium" && priority != "low"){
                priority = "medium";
            }

            if(typeof timeout != "number" && timeout !== false){
                timeout = 5000;
            }

            var box = $("<div>", {
                "id": 'alert-' + window.generateUUID(),
                "class" : "alert " + priority,
                "html" : message,
                "style" : "display: none"
            });

            $("body").append(box);
            var offset = ($('.alert').length - 1) * (box.height() * 1.75);
            var newBottom = parseInt(box.css('bottom'), 10) + offset;
            box.css('bottom', newBottom + 'px');

            $(box).fadeIn('slow');

            if(timeout != false){
                setTimeout(obj.alerts.clear(box.attr('id')), timeout);
            }

        },


        "createDev" : function(message, priority, timeout){
            if($t.debug == true){
                obj.alerts.create(message, priority, timeout);
            }
        },

        "clear" : function(id){
            return (function() {
                $('#' + id).addClass('fading_out');
                $("#" + id).fadeOut('slow', function(){
                    $(this).remove();
                    $('.alert:not(.fading_out)').each(function (i, x) {
                        x = $(x);
                        var newBottom = parseInt(x.css('bottom'), 10) - x.height();
                        x.css('bottom', newBottom + 'px');
                    });
                });
          });
        }

    };

    // Aliases
    obj.createAlert = obj.alerts.create;
    obj.createDevAlert = obj.alerts.createDev;
    obj.clearAlert = obj.alerts.clear;

    var status = obj.load();
    if(status == false){
        return false;
    }
    else{
        return obj;
    }
});
