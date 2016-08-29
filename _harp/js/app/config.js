// Contents are placed in a .js file as opposed to a .json to avoid plugin usage.
// Might fix this if I change my mind.

define(function(){
	var topic = "history"
	return {
		init:       function(geometry, audio, video, game, ui){ // Custom function to call after project init
			new ui.Text(new geometry.Vector(24, 16), "topic").attach();
			new ui.Text(new geometry.Vector(24, 24), topic).attach();
		},
		resolution: {           // Project screen resolution; note that the properties and [x] and [y], not [width] and [height]
			x: 512,             // - width
			y: 256              // - height
		},
		tileSize:   16,         // Tile size; keep at 16 for most retro NES/GameBoy/SNES games
		path:       "./js/app/", // Path to [app], which contains project-specific files such as sprites and music.
		stage:      "smb",      // The stage skin to use; select from folders in [stage] inside [app]
		char:       "mario"     // The character skin to use; select from folders in [char] inside [app]
	}
});