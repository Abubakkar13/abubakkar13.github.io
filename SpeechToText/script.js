//vax x = document.getElementById("myAudio");
//x.muted=true;

var SpeechRecognition = window.webkitSpeechRecognition;

var recognition = new SpeechRecognition();


var Textbox = $('#textbox');
var instructions = $('instructions');


var Content = '';


recognition.continuous = false;
recognition.interminous = false;

recognition.onresult = function(event) {
  var current = event.resultIndex;
  var transcript = event.results[current][0].transcript;
    Content += transcript+' ';
    Textbox.val(Content);  
};


recognition.onstart = function() {
  instructions.text('Voice recognition is ON.');
}

recognition.onspeechend = function() {
  instructions.text('No activity.');
}


recognition.onerror = function(event) {
  if(event.error == 'no-speech') {
    instructions.text('Try again.');
  }
}


$('#start-btn').on('click', function(e) {
    setInterval(function(){
    recognition.start();}, 30000);
});




Textbox.on('input', function() {
  Content = $(this).val();
})


function copyToClipboard(element)
{
var $temp = $("<input>");
$("body").append($temp);
$temp.val($(element).text()).select(); document.execCommand("copy");
$temp.remove();
}


$('#textbox').on('click', function(e) {
    
var copyText = document.getElementById("textbox");
navigator.clipboard.writeText(copyText.value);

});



$('#clear').on('click', function(e) {

Content = '';  
document.getElementById('textbox').value = '';

});




