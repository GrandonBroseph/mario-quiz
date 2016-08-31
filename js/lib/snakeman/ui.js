define(["./geometry", "./video", "./input"], function(geometry, video, ui) {

	var config;
	var children = [];
	var animations = [];

	function init(data) {
		config = data;
		var s = video.tilesets.box;
		Box.prototype.cache = {
			UL: s[0][0],
			U:  s[0][1],
			UR: s[0][2],
			L:  s[1][0],
			C:  s[1][1],
			R:  s[1][2],
			DL: s[2][0],
			D:  s[2][1],
			DR: s[2][2]
		};
	}

	function box(text) {
		box = new Box().attach().text(text).disappear().appear(true);
		input.mouse.mark(box.rect, function(){
			box.disappear(true);
			input.mouse.unmark(box.rect);
		});
	}

	function update() {
		animations.some(function(animation){
			if (animation.running) {
				animation.update();
			}
		});
	}

	function Animation(start, finish, callback){
		callback = callback || function(){};
		this.item = null;
		this.start = start;
		this.finish = finish;
		this.callback = callback;
		this.running = false;
		this.complete = false;
		animations.push(this);
	}

	Animation.prototype = {
		duration: 15,
		init: function(item){
			this.running = true;
			this.item = item;
			this.item.rect.set(this.start);
			return this;
		},
		update: function(){
			var c = video.display.rect.center,  // Center of screen
			    d = this.duration,              // Duration of animation (frames, i.e. 60ths of a second)
			    s = this.start.size,            // Initial animation size
			    f = this.finish.size,           // Final animation size
			    r = this.item.rect,             // Rectangle alias
			    t = config.tileSize,            // Tile size alias
			    v = geometry.Vector,            // Vector alias
			    x, y;                           // i.e. Iterator, index, etc.

			// Check if animation has completed (rectangle has achieved desired size)
			if (Math.round(r.width) == f.x && Math.round(r.height) == f.y) {
				r.size.set(f);
				this.running = false;
				this.complete = true;
				this.callback.call(this.item);
			} else {
				// Animation (increase rectangle size)
				r.size.add((f.x-s.x)/d, (f.y-s.y)/d);
			}

			// Center rectangle based on position
			r.pos.set(c.x - r.width / 2, c.y - r.height / 2);

			this.item.surface.size = r.size;

			this.item.surface.clear();

			var xf  = this.item.surface.size.x / t,
			    yf  = this.item.surface.size.y / t,
			    xfr = Math.round(xf);
			    yfr = Math.round(yf);

			for (y = 0; y < yfr; y ++) {
				for (x = 0; x < xfr; x ++) {
					if (x > 0 && x < xfr-1) {
						if (y > 0 && y < yfr-1) {
							this.item.surface.blit(this.item.cache.C, new v(x*t, y*t));
						}
						this.item.surface.blit(this.item.cache.U, new v(x*t, 0));
						this.item.surface.blit(this.item.cache.D, new v(x*t, (yfr-1)*t));
					}
				}
				if (y > 0 && y < yfr-1) {
					this.item.surface.blit(this.item.cache.L, new v(0, y*t));
					this.item.surface.blit(this.item.cache.R, new v((xfr-1)*t, y*t));
				}
			}
			this.item.surface.blit(this.item.cache.UL);
			this.item.surface.blit(this.item.cache.UR, new v((xfr-1)*t, 0));
			this.item.surface.blit(this.item.cache.DL, new v(0, (yfr-1)*t));
			this.item.surface.blit(this.item.cache.DR, new v((xfr-1)*t, (yfr-1)*t));
		}
	};

	function Text(pos, content, shadow) {
		var rect, s = this.glyphSize;

		if (pos instanceof geometry.Rect) {
			rect = pos;
		} else {
			rect = new geometry.Rect(pos.x, pos.y, content.length * s, s);
		}
		var mw = rect.width / s;
		this.rect = rect;
		this.surface = new video.Surface(this.rect.size);
		this.sprite = new video.Sprite(this.rect, this.surface);
		this.sprite.depth = 5;
		this.shadow = shadow;

		var tx = 0, ty = 0, wx;

		this.content = content;

		var t = this.content, word, letters = [];
		for (var i = 0; i < t.length; i ++) {
			while (tx == 0 && t[i] === " ") i ++;
			var c = t[i];
			if (!word || c === " ") {
				word = "";
				var j = i;
				while (j < t.length) {
					if (t[j] !== " ")
						word += t[j];
					else
						break;
					j ++;
				}
				wx = tx;
			}
	
			if (wx + word.length > mw) {
				tx = wx = 0;
				ty ++;
			}

			index = this.sequence.indexOf(c.toUpperCase());
			if (index != -1) {
				x = index % 10;
				y = (index - x) / 10 + (this.shadow ? 5 : 0);
				if (!letters[ty]) letters[ty] = [];
				letters[ty].push({
					char: c,
					surface: video.tilesets.text[y][x],
					pos: tx
				});
			}		
			if (++ tx >= mw) {
				tx = wx = 0;
				ty ++;
			}	
		}

		this.surface.canvas.height = this.surface.size.y = (ty + 1) * (s + 4);

		var prev, surf, x, alignment = "center";
		letters.some(function(line, index){
			surf = new video.Surface(new geometry.Vector(line.length * s, s));
			line.some(function(letter){
				surf.blit(letter.surface, new geometry.Vector(letter.pos * s, 0));
			});
			if (alignment === "left") // Simple enough
				x = 0;
			else if (alignment === "center") // Works like a charm!
				x = this.surface.size.x / 2 - surf.size.x / 2;
			else if (alignment === "right") // PROBLEM: Needs to remove extra right-side spaces?
				x = this.surface.size.x - surf.size.x;
			this.surface.blit(surf, new geometry.Vector(x, index * (s + 4)));
		}, this);

		children.push(this);
	}

	Text.prototype = {
		glyphSize: 8,
		sequence:  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.,!?-'\"<>() ",
		attach:    function(parent) {
			if (parent instanceof Box) {
				parent = parent.sprite;
			}
			this.sprite.attach(parent);
			return this;
		},
		detach:    function(parent) {
			if (parent instanceof Box) {
				parent = parent.sprite;
			}
			this.sprite.detach(parent);
			return this;
		}
	};

	function Box(rect){
		var x, y, w, h, t, s, c, sprite;

		t = config.tileSize;

		rect = new geometry.Rect(40, 32, 432, 192);

		this.size = new geometry.Vector(rect.width / t, rect.height / t);
		this.rect = rect;
		this.surface = new video.Surface(this.rect.size.clone());
		this.sprite = new video.Sprite(this.rect, this.surface);
		this.sprite.depth = 4;
		this.animation = null;
		this.textboxes = [];
		children.push(this);

		data.shadowed = true;

		c = video.display.rect.center;
		s = new geometry.Vector(config.tileSize, config.tileSize);

		this.min = {
			size: s,
			rect: new geometry.Rect(c.x - s.x / 2, c.y - s.y / 2, s.x, s.y),
			surface: new video.Surface(s)
		};
		this.max = {
			size: this.rect.size,
			rect: this.rect.clone(),
			surface: this.surface.clone()
		};
	}

	Box.prototype = {
		cache: {},
		childState: function(state) {
			this.sprite.children.some(function(child){ child.visible = state; });
		},
		draw: function(){
			var x, y, c, s;
			for (y = 0; y < rows; y ++) {
				for (x = 0; x < cols; x ++) {
					c = false;
					s = this.cache.C;
					if (!x && !y) {
						s = this.cache.UL;
						c = true;
					} else if (x == cols-1 && !y) {
						s = this.cache.UR;
						c = true;
					} else if (!x && y == rows-1) {
						s = this.cache.DL;
						c = true;
					} else if (x == cols-1 && y == rows-1) {
						s = this.cache.DR;
						c = true;
					} else if (!x) {
						s = this.cache.L;
					} else if (!y) {
						s = this.cache.U;
					} else if (x == cols-1) {
						s = this.cache.R;
					} else if (y == rows-1) {
						s = this.cache.D;
					}
					this.surface.blit(s, x * t, y * t);
				}
			}
		},
		text: function(content) {
			if (Object.prototype.toString.call(content) === "[object Array]") {
				content.some(function(entry){
					this.text(entry);
				}, this);
			} else {
				var x, y, rect;
				x = config.tileSize;
				y = config.tileSize;
				this.textboxes.some(function(text){ y += text.rect.height; y += 8; });

				rect = new geometry.Rect(x, y, this.rect.width - config.tileSize * 2, 0);
				this.textboxes.push(new Text(rect, content, true).attach(this));
			}
			return this;
		},
		attach: function(parent) {
			this.sprite.attach(parent);
			return this;
		},
		disappear: function(animated) {
			this.childState(false);
			if (!animated) {
				this.sprite.visible = false;
				data.shadowed = false;
			} else {
				this.sprite.children.some(function(child){ child.detach(this.sprite); });
				this.animation = new Animation(this.max.rect, this.min.rect, function(){
					data.shadowed = false;
					this.sprite.detach();
				}).init(this);
			}
			return this;
		},
		appear: function(animated) {
			data.shadowed = true;
			this.sprite.visible = true;
			if (!animated) {
				this.childState(true);
			} else {
				this.childState(false);
				this.animation = new Animation(this.min.rect, this.max.rect, function(){
					this.childState(true);
				}).init(this);
			}
			return this;
		}
	};

	var data = {
		init: init,
		update: update,

		shadowed: false,
		box: box,

		Text: Text,
		Box: Box
	};

	return data;
})