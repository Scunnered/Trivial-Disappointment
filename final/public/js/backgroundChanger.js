//The category results from question mapped to the file name of the background image that corresponds to it
var categories = new Map([
    ['General Knowledge', 'General Knowledge.jpg'], 
    ['Entertainment: Books', 'Books.jpg'],
    ['Entertainment: Film', 'Film.jpg'],
    ['Entertainment: Music', 'Music.jpg'], 
    ['Entertainment: Musicals & Theatres', 'Musicals and Theatre.jpg'], 
    ['Entertainment: Television', 'Television.jpg'], 
    ['Entertainment: Video Games', 'Video Games.jpg'],
    ['Entertainment: Board Games', 'Board Games.jpg'],
    ['Science & Nature', 'Science and Nature.jpg'],
    ['Science: Computers', 'Science Computers.jpg'], 
    ['Science: Mathematics', 'Mathematics.jpg'], 
    ['Mythology', 'Mythology.jpg'],
    ['Sports', 'Sports.jpg'],
    ['Geography', 'Geography.jpg'],
    ['History', 'History.jpg'],
    ['Politics', 'Politics.jpg'],
    ['Art', 'Art.jpg'],
    ['Celebrities', 'Celebrities.jpg'],
    ['Animals', 'Animals.jpg'],
    ['Vehicles', 'Vehicles.jpg'],
    ['Entertainment: Comics', 'Entertainment Comics.jpg'],
    ['Science: Gadgets', 'Science Gadgets.jpg'],
    ['Entertainment: Japanese Anime & Manga', 'Anime and Manga.jpg'], 
    ['Entertainment: Cartoon & Animations', 'Cartoons and Animations.jpg']
])

//Changes the background of the game based on the category that the question belongs to
function changeBackground(category) {
    $("#backgroundImg").attr("src", "images/backgrounds/"+categories.get(category))
}
//Changes the background of the game based on the final result of the game per user
function changeBackgroundResult(win) {
    if (win) {
        $("#backgroundImg").attr("src", "images/Winner.jpg")
    }
    else {
        $("#backgroundImg").attr("src", "images/Loser.jpg")
    }
}
