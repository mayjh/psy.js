
Data_Handler = (function () {
	
    var data = { response: [], rt: [], properties: {} };
    var trial_num = 0;

	
    function get_response(allowed_responses){
        
        return new Promise(function (resolve_fn, reject_fn) {
           
            var start = (new Date).getTime(); //start the timer
            
            $(document).keydown(function (event) {
                
                var response = event.keyCode || event.which; //get the response		
                response = String.fromCharCode(response); //convert to character
                var rt = (new Date).getTime() - start; //get the reaction time                
                
                if(response in allowed_responses){
                    $(document).off('keydown');//turn off the keydown event listener
                    data['rt'].push(rt);//record rt
                    data['response'].push(response);//record response
                    resolve_fn();
                }
            });
        });
    }


    
	

    return {
        data: data,
        trial_num:trial_num,
        get_response: get_response
    };


})();

function Uploader() {

    this.css_id = { upload_container: 'upload_container' }
    this.message = 'Please wait while your responses are uploaded...';
    this.script = '';
    this.data = {};
}

Uploader.prototype = {



    spinner: function () {

        var opts = {
            lines: 13, // The number of lines to draw
            length: 20, // The length of each line
            width: 10, // The line thickness
            radius: 30, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#000', // #rgb or #rrggbb or array of colors
            speed: 1, // Rounds per second
            trail: 60, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '50%', // Top position relative to parent
            left: '50%' // Left position relative to parent
        };

        var spinner = new Spinner(opts);
        return spinner;
    },

    please_wait: function () {

        //"Upload Message"
        var upload_container = document.createElement('div');
        upload_container.id = this.css_id.upload_container;
        $('#exp_container').append(upload_container);
        $(upload_container).append('<p>'+this.message+'</p>')

    },

    run: function () {
        
        this.please_wait();
        
        //get the data and convert to a JSON string
        this.data.exp_data = JSON.stringify(Data_Handler.data);;
        
        _this = this;

        return new Promise(function (resolve_fn, reject_fn) {

            //start spinner
            var spinner = Uploader.prototype.spinner();
            spinner.spin(document.getElementById(_this.css_id.upload_container));
            
            //upload data 
            $.ajax({
                type: "POST",
                data: _this.data,
                url: _this.script,
                success: function () { //run this on success
                    setTimeout(function () {
                        spinner.stop();
                        Uploader.prototype.erase(_this.css_id.upload_container);
                        return resolve_fn();
                    }, 1000);//wait at least 1s before moving on
                }
            });
        });
    },

    erase: function (element) {
       var parent_node = document.getElementById(element).parentNode;
       parent_node.removeChild(document.getElementById(element));
    },



};

function Img() {

    this.css_id = {
        image_container:'image_container',
        image:'img',
        image_message_container: "image_message_container",
    };
    this.list = null;
    this.height = null;
    this.width = null;
    this.allowed_responses = null;
    this.time = null;

}

Img.prototype = {
    erase: function (element) {
        //get the feedback container
        var parent_node = document.getElementById(element).parentNode;

        //remove the feedback container
        parent_node.removeChild(document.getElementById(element));
    },

    preloader: function (src) {
        var img = new Image();
        img.src = src;
        return img;
    },


    show_image: function () {
        
        //plop the container back on the document
        var image_container = document.createElement("div");
        image_container.id = this.css_id.image_container;
        
        //add the container to the document
        $('#exp_container').append(image_container);
        var stimulus = new Image(); //need to implement a preloader
        stimulus.src = this.list[Data_Handler.trial_num];
        stimulus.width = this.width;
        stimulus.height = this.height;
        stimulus.id = this.css_id.image;

        //add the image to the container
        image_container.appendChild(stimulus);

    },

    timed_image: function () {
        var _this = this;
        return new Promise(function (resolve_fn, reject_fn) {
            _this.show_image();
            setTimeout(function () {
                Img.prototype.erase(_this.css_id.image_container);
                Img.prototype.erase(_this.css_id.image_message_container);
                resolve_fn();
            }, _this.time);
        });
    },

  
   run:  function() {

       var _this = this;

       return new Promise(function (resolve_fn, reject_fn) {
         
           if (_this.time !== null && _this.time !== 'inf') {//timed stimulus
       
                _this.timed_image()
                .then(resolve_fn);        
                setTimeout(resolve_fn, _this.time);           

            } else {

               //show the image
               _this.show_image();       
               
               Data_Handler.get_response(_this.allowed_responses)
                .then(function () {

                //erase image
                Img.prototype.erase(_this.css_id.image_container);             
                resolve_fn();

                });
            }
        });
    }


};

function Message(){
   
    this.css_id = {
        button:'button',
        button_container:'button_container',
        message_container: 'message_container',
        message_header: 'message_header',
        message: 'message',
        };
    this.button_text = 'Continue';
    this.text = '';
    this.time = null;
    this.button = null;
    this.header = '';
    this.keypress = '';
    this.get_id = function () { return this.id };
}

Message.prototype = {


    click_promise: function( element_id ){
        return new Promise(function(resolve_fn, reject_fn){
            $('#' + element_id).click(resolve_fn);
        });
    },

    erase: function (element) {
        //get the feedback container
       var  parent_node = document.getElementById(element).parentNode;

        //remove the feedback container
        parent_node.removeChild(document.getElementById(element));
    },


    show_message: function(){

        //import functions and data
        //Promise cannot see outside of show_message
        var _this = this;

        return new Promise(function (resolve_fn, reject_fn) {
         
            _this.make_message();
			
            if( _this.button == true ){
				
                _this.click_promise(_this.css_id.button)
				.then(function(){
				    Message.prototype.erase(_this.css_id.message_container);
				    resolve_fn();
				});
			
            }else if (typeof _this.button !== null){
		
                //In order to check if the spacebar has been pressed
                //it is necessary to get the key code for the spacebar. 
                //The keycode for the spacebar is 32.
                if (_this.keypress == 'spacebar' | _this.keypress == 'space') {
                    _this.keypress = 32;
                }
                //check if the keypress is allowed and 
                //execute the desired function
                action_enabled = 1;
                $(document).keydown(function(event){
                    if(action_enabled){
                        if(event.keyCode == _this.keypress || event.which == _this.keypress){
                            Message.prototype.erase(_this.css_id.message_container);
                            action_enabled = 0;
                            resolve_fn();
                            return false; //prevents scrolling behavior
                        }
                    }
                });
            }
        });
    },

    make_message: function(){
        
        //create an message container 
        var message_container = document.createElement("div");
        message_container.id = this.css_id.message_container;
		
        //add the container to the document
        $("#exp_container").append(message_container);
		
        //create a header tag
        var message_h = document.createElement("H1");
        message_h.id = this.css_id.message_header;
        var header = document.createTextNode(this.header);
        message_h.appendChild(header);
		
        //add the header to the instruction container
        message_container.appendChild(message_h);
		
        //create a paragraph tag and message
        var message_para = document.createElement("p");
        message_para.id = this.css_id.message;
        var message = document.createTextNode(this.text);
        message_para.appendChild(message);
		
        //add message to the container
        message_container.appendChild(message);	

        if (this.button == true) {
            //create a button container
            var button_container = document.createElement("div");
            button_container.id = this.css_id.button_container;
			
            //add the container to the document
            $('#exp_container').append(button_container);
			
            //create button element
            var button = document.createElement("BUTTON");
            button.id = this.css_id.button;
			
            //create text on button
            var button_text_node = document.createTextNode(this.button_text);
			
            //append text to button
            button.appendChild(button_text_node);
			
            //append button to button container
            button_container.appendChild(button);
			
            //append button container to instruction container
            message_container.appendChild(button_container);
        }
    },
	

    timed_message: function(){
        var _this = this;
        return new Promise(function (resolve_fn, reject_fn) {
            var message_container = document.createElement('div');
            message_container.id = _this.css_id.message_container;
            $('#exp_container').append(message_container);
            var message = $('<p>', { id: 'message' });
            $(message).text(_this.text);
            $(message_container).append(message);
            setTimeout(function () { Message.prototype.erase(_this.css_id.message_container); resolve_fn(); }, _this.time);
        });

    },

    run: function () {
        if (this.time !== null) { //timed message
            return this.timed_message();
        } else if (this.button !== null) { //message with a button
            return this.show_message();
        }
    }
}


function Feedback() {
    
    this.css_id = {feedback:'feedback',feedback_container:'feedback_container'};
    this.correct = 'Correct!';
    this.incorrect = 'Incorrect!';
    this.incorrect_color = 'red';
    this.correct_color = 'green';
    this.correct_answers = [];
    this.time = 1000;
    this.too_slow = null;

}

Feedback.prototype = {

    run: function () {
        var _this = this;
        return new Promise(function (resolve_fn, reject_fn) {
            var response = Data_Handler.data.response[Data_Handler.trial_num];
            var feedback_container = $("<div>", { id: _this.css_id.feedback_container });
            $("#exp_container").append(feedback_container);

            if (response == _this.correct_answers[Data_Handler.trial_num]) {
                //correct response
                //display "Correct!" 	
                var feedback = $("<p>", { id: _this.css_id.feedback }).text(_this.correct);
                $("#" + _this.css_id.feedback_container).append(feedback);
                $("#" + _this.css_id.feedback).css("color", _this.correct_color);
                //after time ms fullfill the promise
                setTimeout(function () {
                    Feedback.prototype.erase(_this.css_id.feedback_container)
                    resolve_fn();
                }, _this.time);
            } else {
                //incorrect response
                //display "Incorrect" 
                var feedback = $("<p>", { id: _this.css_id.feedback }).text(_this.incorrect);
                $("#" + _this.css_id.feedback_container).append(feedback);
                $("#" + _this.css_id.feedback).css("color", _this.incorrect_color);
                //after 500 ms fullfill the promise
                setTimeout(function () {
                    Feedback.prototype.erase(_this.css_id.feedback_container)
                    resolve_fn();
                }, _this.time);
            }

        });
    },

    erase: function (element) {
        //get the feedback container
        var parent_node = document.getElementById(element).parentNode;

        //remove the feedback container
        parent_node.removeChild(document.getElementById(element));
    }

}


function Text(){
	
    this.css_id = {text_container:'text_container',text:'text'};
    this.list = [];
    this.allowed_responses = null;
    this.time = null;

}

Text.prototype = {

    erase: function (element) {
        var parent_node = document.getElementById(element).parentNode;
        parent_node.removeChild(document.getElementById(element));
    },

    show_text: function () {

        var text_container = $('<p>', { id: this.css_id.text_container });
        $("#exp_container").append(text_container);
        var text_list_element = this.list[Data_Handler.trial_num];
        var text = $("<p>", { id: _this.css_id.text }).text(text_list_element);
        $('#' + this.css_id.text_container).append(text);      
  
    },

    run : function(){
        _this = this;
        if (_this.time !== null) {
            _this.show_text();
            return new Promise(function (resolve_fn, reject_fn) {
                setTimeout(function () {
                    Text.prototype.erase(_this.css_id.text_container);
                    resolve_fn();
                }, _this.time);
            });
        } else {
            _this.show_text();
            return new Promise(function (resolve_fn, reject_fn) {
                Data_Handler.get_response(_this.allowed_responses)
                .then(function () {
                    Text.prototype.erase(_this.css_id.text_container);
                    resolve_fn();
                });
            });
        }
    }

};


function Blank_Screen() {
    this.time = null;
    this.allowed_responses = null;
    this.css_id = {blank_screen_container:'blank_screen_container'}
}

Blank_Screen.prototype = {
    
    erase: function (element) {
        var parent_node = document.getElementById(element).parentNode;
        parent_node.removeChild(document.getElementById(element));
    },

    run : function(){
        _this = this;
        if (_this.time !== null) {
            blank_screen_container = document.createElement('div');
            blank_screen_container.id = 'blank_screen_container';
            document.getElementById('exp_container').appendChild(blank_screen_container);
            return new Promise(function (resolve_fn, reject_fn) {
                setTimeout(function () {
                    Blank_Screen.prototype.erase(_this.css_id.blank_screen_container);
                    resolve_fn();
                }, _this.time);
            });
        } else {
            return new Promise(function (resolve_fn, reject_fn) {
                Data_Handler.get_response(_this.allowed_responses)
                .then(resolve_fn);
            });
        }
    }
};



function Experiment() {
    //the structure of the experiment
    structure = [];

}

Experiment.prototype = {
    //function to loop through the objects 
    //in the experiment structure
   

    run: function () {

        //make the experiment container
        var exp_container = document.createElement('div');
        exp_container.id = 'exp_container';
        document.body.appendChild(exp_container);

        var _this = this;
        var idx = 0;
        return new Promise(function (resolve_fn, reject_fn) {
            var iterator = function (idx) {
                if (idx >= _this.structure.length) {
                    idx = 0;
                    resolve_fn();
                } else if (idx < _this.structure.length) {
                    element = _this.structure[idx];
                    element.run()
                    .then(function () {
                    iterator(++idx);
                    });
                }
            };
            iterator(0);
        });
    }

};

function Block() {
    //container for the experiment objects
    this.structure = [];
    this.list_length = 0;

}

Block.prototype = {

    run: function () {
        return this.block_rotator();
    },
    
    //cycle through each element in block
    block_rotator: function () {
        var this_block = this;
        
        var idx = 0;
        return new Promise(function (resolve_fn, reject_fn) {

            Data_Handler.trial_num = 0;

            var iterator = function (idx) {

                //if we have reached the end of the block
                //reset the index to 0
                //increment the trial number
                if (idx >= this_block.structure.length) {
                    idx = 0;
                    Data_Handler.trial_num++;
                }
               
                //if we haven not reached the end of the list
                //run the object
                if (Data_Handler.trial_num < this_block.list_length) {
                    element = this_block.structure[idx];
                    element.run()
					.then(function () {
					    iterator(++idx);
					});
                }else{
                    resolve_fn();
                }
            };
            iterator(0);
        });
    }
};


