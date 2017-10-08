var Game;

var Bird = cc.Class({
    extends: cc.Component,

	ctor: function() {
		this.jumpFrame = -1;
		this.birdInitY = 0;
		this.distance = 0;
	},
	
	statics: {
		jumpVelocity: 14,
		maxFallVelocity: -15,
		speed: 4
	},
	
	properties: function() {
		Game = require('Game');
		return {
			game: {
				default: null,
				type: Game
			}
		}
	},

    // use this for initialization
    onLoad: function () {
		var box = this.node.getBoundingBox();
		this.birdInitY = this.node.y;
		this.anim = this.getComponent(cc.Animation);
	},

	start: function() {
		this.anim.playAdditive('BirdSwing');		
	},
	
	reborn: function() {
		this.node.y = this.birdInitY;
		this.anim.play('BirdFly');
		this.anim.playAdditive('BirdSwing');
		this.distance = 0;
	},
			
	free: function() {
		this.anim.play('BirdSwing');
	},
	
	jump: function() {
		this.jumpFrame = this.game.getCurrentFrame();
	},
	
	die: function() {
		this.anim.stop('BirdSwing');
		this.jumpFrame = -1;
	},
	
	update: function(dt) {
		if (this.game.getState() === Game.STATE_PLAY) {
			var birdBox = this.node.getBoundingBox();
			this.distance += Bird.speed;
			if (0 <= this.jumpFrame) {
				var currentFrame = this.game.getCurrentFrame();
				var currentVelocity = Math.max(Bird.jumpVelocity + Game.gravity * (currentFrame - this.jumpFrame), Bird.maxFallVelocity);
				var newY = Math.max(this.node.y + currentVelocity, Game.landTop + birdBox.height / 2);
				newY = Math.min(newY, Game.skyBottom - birdBox.height / 2);
				this.node.y = newY;
			}			
		}
	},
	
	getDistance: function() {
		return this.distance;
	}
});


