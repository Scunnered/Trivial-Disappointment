class UserGen {
    constructor() {
        this.animals = ["Alligator", "Ant", "Bear", "Butterfly", "Bat", "Bee", "Camel", "Coyote", "Crab", 
        "Deer", "Dog", "Eagle", "Elephant", "Emu", "Falcon", "Frog", "Gecko", "Giraffe", "Gorillas", "Hedgehog", 
        "Horse", "Ibis", "Jaguar", "Jellyfish", "Koala", "Kangaroo", "Lion", "Lizard", "Mouse", "Mule", "Octopus", 
        "Ostrich", "Penguin", "Pig", "Parrot", "Rabbit", "Rat", "Rhino", "Seal", "Snake", "Spider", "Swan", "Squid", 
        "Squirrel", "Tiger", "Turtle", "Wasp", "Wolf", "Zebra"];
        this.colours = ["Red", "Orange", "Yellow","Green", "Cyan","Blue","Purple","Pink", "Gray"];
    }

    getRandomAnimal() {
        var animal = this.animals[Math.floor(Math.random() * this.animals.length)]
        return animal;
    }

    getRandomColour() {
        var colour = this.colours[Math.floor(Math.random() * this.colours.length)]
        return colour;
    }

    returnUsername() {
        var output = this.getRandomColour() + this.getRandomAnimal()
        return output;
    }
}

module.exports = UserGen     
