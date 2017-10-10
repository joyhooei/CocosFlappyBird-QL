var Game = require('Game');

var QL = cc.Class({
	extends: cc.Component,
		
	properties: {
		game: {
			default: null,
			type: Game
		}
	},
	
	statics: {
		maxEpisode: -1,
		params: {
			alpha: 0.6,
			gamma: 1,
			epsilon: 0,
			rewardDead: -100,
			rewardAlive: 1,			
		},
		resolution: 15,		
		testSetup: function() {
			QL.maxEpisode = 100;
		}
	},
	
	ctor: function() {
		this.S = null;
		this.A = null;
		this.Q = [];
		this.active = false;
		this.stat = {
			episodes: 0,
			maxScore: 0,
			averageScore: 0,
			_accumalatedScore: 0,
			update: function(game) {
				this._accumalatedScore += game.getFinalScore();
				this.episodes ++;
				this.averageScore = this._accumalatedScore / this.episodes;
				this.maxScore = game.getBestScore()
			},
			toString: function() {
				var obj = {};
				for (var key in this) {
					if (0 > key.indexOf('_')) {
						obj[key] = this[key];
					}
				}
				return JSON.stringify(obj);
			}
		}
	},
	
	onLoad: function() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, function(event) {
			switch (event.keyCode) {
				case cc.KEY.space:
					this.setActive(!this.active);
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
			this.Q[preS][preA] = (1 - QL.params.alpha) * this.Q[preS][preA] + QL.params.alpha * (R + QL.params.gamma * Math.max(...this.Q[S]));			
		}
	},
	
	getState: function() {
		var ret = null;
		var pipePairNode = this.game.getFirstComingPipePairNode();	
		var birdBox = this.game.birdNode.getBoundingBox();
		
		if (pipePairNode) {
			var downPipeBox = pipePairNode.getComponent('PipePair').downNode.getBoundingBox();
			ret = [
				Math.floor((downPipeBox.x + 144) / QL.resolution),
				Math.floor((downPipeBox.y + downPipeBox.height + 90 - birdBox.y) / QL.resolution)
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
				this.reward(S, QL.params.rewardAlive);
				this.S = S;
				
				if (Math.random() < QL.params.epsilon) { // explore
					A = Math.floor(Math.random() * 2);
				}
				else { // exploit
					A = this.Q[S].indexOf(Math.max(...this.Q[S]));
				}
				if (A) {
					this.game.birdNode.getComponent('Bird').jump();					
				}
				this.A = A;					
			}
			else if (this.game.inState(Game.STATE_OVER)){
				this.stat.update(this.game);
				cc.log('current score: ' + this.game.getFinalScore());
				cc.log(this.stat.toString());
				this.reward(S, QL.params.rewardDead);
				this.S = null;
				this.A = null;
				this.game.changeState(Game.STATE_TITLE);
				if (0 < QL.maxEpisode && this.stat.episodes >= QL.maxEpisode) {
					this.setActive(false);
				}
			}			
		}
	},
	
	setActive: function(active) {
		this.active = active;
		cc.log('QL active: ' + this.active);
		if (this.active) {
			cc.log('QL params: ' + JSON.stringify(QL.params));
		}
	}
});

cc.QL = QL;