/* Refrance site - https://stackoverflow.com/questions/31626852/how-to-add-konami-code-in-a-website-based-on-html */

$(document).keydown(function(event){
    KonamiCode(event.keyCode) 
});

var position = 0;
var wrongPosition = 0;

function KonamiCode(keyCode){
    var kCode = [38,38,40,40,37,39,37,39,66,65];
    var wrongKCode = [38,38,40,40,37,39,37,39,65,66];
    if(keyCode==kCode[position]){
        position++
        if(position==10){
            //Enter code that triggers after konami code here.
            $('#title').html('<h1>Rest in peace Saul Rennie</h1>');
				window.open('https://www.youtube.com/watch?v=1SiylvmFI_8/', '_blank');
				//Changes main title text to display a RIP message for Saul Rennie. He is not dead he just dropped out after first year. Forever in our hearts. Youtube video will be taken out on final relase.
        }
    }
    else{
        position=0;
    }
    if(keyCode==wrongKCode[wrongPosition]){
        wrongPosition++
        if(wrongPosition==10){
            window.open('http://wildfireone.com/', '_blank');
			//This is Johns version of the Konami code. As shown during the lecture he prefers to use ↑↑↓↓←→←→AB instead of the correct version... 
        }
    }
    else{
        wrongPosition=0;
    }
}