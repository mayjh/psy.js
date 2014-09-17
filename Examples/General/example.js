function read_text(file_name) {

    var result = "";
    $.ajax({
        url: 'read_text.php',
        type: 'POST',
        data: { file_name: file_name },
        dataType: 'text',
        async: false,
        success: function (data) {
            result = data;
        }
    });
    return result;

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

    //read in the bird image list
    var bird_list_file_name = 'Lists/bird_list.txt';
    var bird_list = read_text(bird_list_file_name);

    //read in the word list
    var word_list_file_name = 'Lists/word_list.txt';
    var word_list = read_text(word_list_file_name);

    //convert the character string to a 
    //character array
    bird_list = bird_list.split('\n');
    word_list = word_list.split('\n');

    instructions = new Message();
    instructions.text = "Press 1 or 0 to proceed through stimuli.";
    instructions.header = 'Welcome!';
    instructions.button = true;
    instructions.css_id.message_container = 'instruction_container';
    instructions.css_id.message_header = 'instruction_header';

    var message = new Message();
    message.css_id.message = 'message';
    message.css_id.message_container = 'message_container';
    message.text = "Get Ready For the Experiment!";
    message.time = 1000;

    var message_end = new Message();
    message_end.css_id.message = 'message';
    message_end.css_id.message_container = 'message_container';
    message_end.text = "You Have Finished The Experiment!";
    message_end.time = 1000;

    var img1 = new Img();
    img1.time = 'inf';
    img1.list = bird_list;
    img1.height = 300;
    img1.width = 300;
    img1.allowed_responses = [1, 0];
    img1.preload();

    var txt = new Text();
    txt.list = word_list;
    txt.allowed_responses = [1, 0];

    var isi = new Blank_Screen();
    isi.time = 1500;

    var feedback = new Feedback();
    feedback.correct_answers = [1, 0];

    var block1 = new Block();
    block1.structure = [img1, feedback, txt, isi];
    block1.list_length = 3;

    upload = new Uploader();
    upload.data.filelocation = 'Results/';
    upload.script = 'save_results.php';
    

    var exp = new Experiment();
    exp.structure = [instructions, message, block1, upload, message_end];
    exp.run();
    




}