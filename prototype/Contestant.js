class Contestant {
  constructor(name = "Name", colour = 'black') {
//Created this for testing. Here players will be able to add custom names in lieu of assigned ones which is the plan.
      this._name = name;
      this._colour = colour;
      this._ready = false;
//Players will say when they are ready to join in a host game. Once all connected users press ready the host can begin the game.
}
  
  get name() {return this._name; }
  get colour
