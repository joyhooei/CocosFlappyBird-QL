var Bird = require('Bird');
var Game;

var PipePair = cc.Class({
	extends: cc.Component,
	
	ctor: function() {
		this.moving = false;
		this.passed = false;
	},
	
	properties: function() {
		Game = require('Game');
		return {
			upNode: {
				default: null,
				type: cc.Node
			},
			downNode: {
				default: null,
				type: cc.Node
			},
			game: {
				default: null,
				type: Game
			}
		}
	},
	
	statics: {
		upInitialPosition: null,
		downInitialPosition: null,		
		maxDeltaY: 200,
		span: Bird.speed * 60
	},
	
	onLoad: function() {
		PipePair.upInitialPosition = this.upNode.position;
		PipePair.downInitialPosition = this.downNode.position;
	},
	
	reset: function() {
		this.upNode.position = PipePair.upInitialPosition;
		this.downNode.position = PipePair.downInitialPosition;
		this.moving = false;
		this.passed = false;
	},

	setup: function() {
		var deltaY = Math.floor(Math.random() * PipePair.maxDeltaY);
		this.reset();
		this.upNode.y += deltaY;
		this.downNode.y += deltaY;	
		this.moving = true;
	},
	
	update: function(dt) {
		if (this.moving && this.game.inState(Game.STATE_PLAY)) {
			this.upNode.x -= Bird.speed;
			this.downNode.x -= Bird.speed;
			var box = this.upNode.getBoundingBox();
			if (box.x + box.width <= -this.upNode.parent.width / 2) {
				this.reset();
			}			
		}
	},
	
	inMoving: function() {
		return this.moving;
	},
	
	getBoundingRight: function() {
		var box = this.upNode.getBoundingBox();
		return box.x + box.width;
	},
	
	checkCollision: function(birdBox) {
		return cc.Intersection.rectRect(this.upNode.getBoundingBox(), birdBox) ||
			cc.Intersection.rectRect(this.downNode.getBoundingBox(), birdBox);
	}
})