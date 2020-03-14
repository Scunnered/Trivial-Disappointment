
$(document).ready(function() {
    console.log("welcome")
    $(".hostSelects").hide();
    $("#hostGameShow").click(function(){
        $(".clientSelects").hide();
        $("#hostGameShow").hide();
        $(".hostSelects").show();
    })
    $("#joinGame").click(function(){
        $(".hostSelects").hide();
        $("#hostGame").hide();
        $("#hostGameShow").hide();
    })
})