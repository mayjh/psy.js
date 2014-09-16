

//helper functions 
function get_$_GET() {
    //Because AJAX fetches data via a separate HTTP request it won't include 
    //any information from the HTTP request that fetched the HTML document.
    //Thus $_GET will be empty in the PHP script. 
    //This gets the url parameters and sends them to the PHP script. 
    var parts = window.location.search.substr(1).split("&");
    var $_GET = {};
    for (var i = 0; i < parts.length; i++) {
        var temp = parts[i].split("=");
        $_GET[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
    }
    return ($_GET)
}

$(document).ready(on_doc_load());

function on_doc_load() {


    //prevent user from hitting the backspace key
    //and exiting the program
    $(document).on("keydown", function (e) {
        if ((e.which === 8 || e.keyCode == 8) && !$(e.target).is("input, textarea")) {
            e.preventDefault();
        }
    });


	//make instructions
    instructions = new Message();
    instructions.text = "Press 1 or 0 to proceed through stimuli.";
    instructions.header = 'Welcome!';
    instructions.button = true;
    instructions.css_id.message_container = 'instruction_container';
    instructions.css_id.message_header = 'instruction_header';

	//make a get ready message
    var message = new Message();
    message.css_id.message = 'message';
    message.css_id.message_container = 'message_container';
    message.text = "Get Ready For the Experiment!";
    message.time = 1000;

	//make a finished message
    var message_end = new Message();
    message_end.css_id.message = 'message';
    message_end.css_id.message_container = 'message_container';
    message_end.text = "You Have Finished The Experiment!";
    message_end.time = 1000;

	//make a list of images
    var img1 = new Img();
    img1.time = 'inf';
    img1.list = ['Content/bird0.jpg', 'Content/bird1.jpg'];
    img1.height = 300;
    img1.width = 300;
    img1.allowed_responses = [1, 0];

	//make a list of text items
    var txt = new Text();
    txt.list = ['Boat','Train','Car']
    txt.allowed_responses = [1, 0];

	//make an isi of 1500ms
    var isi = new Blank_Screen();
    isi.time = 1500;

	//make feedback
    var feedback = new Feedback();
    feedback.correct_answers = [1, 0];

	//presentation order: img1, feedback, txt, isi
    var block1 = new Block();
    block1.structure = [img1, feedback, txt, isi];
    block1.list_length = 2;

	//make an upload object
    upload = new Uploader();
    $_GET = get_$_GET();//get subject parameters
    upload.data.partial = 'false';
    upload.data.exppart_id = $_GET['exppart_id'];
    upload.data.partsession_id = $_GET['partsession_id'];
    upload.data.cur_sess = $_GET['cur_sess'];
    upload.data.filelocation = 'Results/';
    upload.script = 'save_results.php';
    
	//run the experiment
    var exp = new Experiment();
    exp.structure = [instructions, message, block1, upload, message_end];
    exp.run();
    




}