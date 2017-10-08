var Game;

var Bird = cc.Class({
    extends: cc.Component,

	ctor: function() {
		this.jumpFrame = -1;
		this.birdHeight = 0;
		this.birdWidth = 0;
		this.birdInitY = 0;
		this.distance = 0;
	},
	
	statics: {
		jumpVelocity: 14,
		maxFallVelocity: -7.5,
		birdCollisionBoxFactor: 0.8,
		speed: 3
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
		this.birdHeight = box.height * Bird.birdCollisionBoxFactor;
		this.birdWidth = box.width * Bird.birdCollisionBoxFactor;
		this.birdInitY = this.node.y;
		this.anim = this.getComponent(cc.Animation);
		this.anim.playAdditive('BirdSwing');
	},
	
	reborn: function() {
		this.node.y = this.birdInitY;
		this.anim.play('BirdFly');
		this.anim.resume('BirdSwing');
		this.distance = 0;
	},
			
	free: function() {
		this.anim.play('BirdSwing');
	},
	
	jump: function() {
		this.jumpFrame = this.game.getCurrentFrame();
	},
	
	die: function() {
		this.anim.pause('BirdSwing');
		this.jumpFrame = -1;
	},
	
	update: function(dt) {
		if (this.game.getState() === Game.STATE_PLAY) {
			this.distance += Bird.speed;
			if (0 <= this.jumpFrame) {
				var currentFrame = this.game.getCurrentFrame();
				var currentVelocity = Math.max(Bird.jumpVelocity + Game.gravity * (currentFrame - this.jumpFrame), Bird.maxFallVelocity);
				var newY = Math.max(this.node.y + currentVelocity, Game.landTop + this.birdHeight / 2);
				newY = Math.min(newY, Game.skyBottom - this.birdHeight / 2);
				this.node.y = newY;
			}			
		}
	},
	
	getDistance: function() {
		return this.distance;
	},
	
	getBoundingLeft: function() {
		return this.node.x - this.birdWidth / 2;
	},
	
	getCollisionBox: function() {
		return {
			x: this.node.x - this.birdWidth / 2,
			y: this.node.y - this.birdHeight / 2,
			width: this.birdWidth,
			height: this.birdHeight
		}
	}
});


