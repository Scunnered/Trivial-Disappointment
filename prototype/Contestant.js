class Contestant {
  constructor(name = "Name", colour = 'black') {
//Created this for testing. Here players will be able to add custom names in lieu of assigned ones which is the plan.
      this._name = name;
      this._colour = colour;
      this._ready = false;
//Players will say when they are ready to join in a host game. Once all connected users press ready the host can begin the game.
}
  
  get name() { return this._name; }
  set name(newName) { this._name = newName; }
  // Gets name inputted by player
  
  get colour() { return this._colour; }
  set colour(new colour) { this._colour = newColour; }
  // For player colour (We might use a colour API for this or pull it in from a DB on Mongo)
