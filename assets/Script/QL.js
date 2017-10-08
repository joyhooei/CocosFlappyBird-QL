var Game = require('Game');

var QL = cc.Class({
	extends: cc.Component,
		
	properties: {
		game: {
			default: null,
			type: Game
		}
	},
	
	ctor: function() {
		this.S = null;
		this.A = null;
		this.Q = [];
		this.alpha = 0.6;
		this.gamma = 0.8;
		this.epsilon = 0;
		this.rewardDead = -100;
		this.rewardAlive = 1;	
		this.resolution = 15;
		this.active = false;
	},
	
	onLoad: function() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, function(event) {
			switch (event.keyCode) {
				case cc.KEY.space:
				this.active = !this.active;				
					break;
				default:
					break;
			}
		}, this);
	},
	
	reward: function(S, R) {
		var preS = this.S;
		var preA = this.A;		
		if (preS && preA in [0, 1]) {
			this.Q[preS][preA] = (1 - this.alpha) * this.Q[preS][preA] + this.alpha * (R + this.gamma * Math.max(...this.Q[S]));			
		}
	},
	
	getState: function() {
		var ret = null;
		var pipePairNode = this.game.getFirstComingPipePairNode();	
		var birdBox = this.game.birdSprite.node.getBoundingBox();
		
		if (pipePairNode) {
			var downPipeBox = pipePairNode.getComponent('PipePair').downNode.getBoundingBox();
			ret = [
				Math.floor((downPipeBox.x + 144) / this.resolution),
				Math.floor((downPipeBox.y + downPipeBox.height + 90 - birdBox.y) / this.resolution)
			].join(',');
		}
		return ret;
	},
	
	update: function(dt) {
		if (!this.active) {
			return;
		}
		if (this.game.inState(Game.STATE_TITLE)) {
			this.game.changeState(Game.STATE_PLAY);
		}
		else {
			var S = this.getState();				
			if (S && !(S in this.Q)) {
				this.Q[S] = [0, 0];						
			}
			if (this.game.inState(Game.STATE_PLAY)) {
				var A = 0;				
				this.reward(S, this.rewardAlive);
				this.S = S;
				
				if (Math.random() < this.epsilon) { // explore
					A = Math.floor(Math.random() * 2);
				}
				else { // exploit
					A = this.Q[S].indexOf(Math.max(...this.Q[S]));
				}
				if (A) {
					this.game.birdSprite.getComponent('Bird').jump();					
				}
				this.A = A;					
			}
			else if (this.game.inState(Game.STATE_OVER)){
				this.reward(S, this.rewardDead);
				this.S = null;
				this.A = null;
				this.game.changeState(Game.STATE_TITLE);
			}			
		}
	}
})