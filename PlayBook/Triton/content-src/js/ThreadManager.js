window.Triton.ThreadManager = (function(storage){
    var obj = {};
    var index;
    var encoder;

    // Accessors
    obj.getIndex = function(){ return index; }
    obj.getEncoder = function(){ return encoder; }

    obj.init = function(){

        // Create the Thread Index
        index = window.Triton.ThreadIndex(storage, "thread_index");
        index.init();

        // Create the Encoder
        encoder = window.Triton.Encoder(storage);

    }

    obj.createThread = function(){

        // Create the Post
        var thread = encoder.create();

        // Add it to the index
        index.addIndex(thread);
        
        return thread;

    }

    obj.removeThread = function(id){

        // Check if the thread was passed instead
        if(typeof id.returnData == "function"){
            id = id.getID();
        }

        // Delete the thread from the index
        index.deleteIndex(id);

        // Delete the thread from localStorage
        encoder.remove(id);

        return true;
    }

    obj.getThread = function(id){

        return encoder.load(id);
        
    }

    obj.getAll = function(){

        var indexData = index.getIndex();
        var threads = [];

        var len = indexData.length;
        for(var i = 0; i < len; i++){
            threads.push(obj.getThread(indexData[i].id).returnData());
        }

        return threads;
    }

    return obj;
});