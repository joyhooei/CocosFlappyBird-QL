var PipePair = require('PipePair');

var Game = cc.Class({
    extends: cc.Component,
    ctor: function () {
		this._state = null;
		this._currentFrame = 0;
		this._pipePairNodeList = [];
		this._currentScore = 0;
		this._bestScore = 0;
	},
	
    properties: {
		birdSprite: {
			default: null,
			type: cc.Sprite
		},
		readySprite: {
			default: null,
			type: cc.Sprite
		},
		tutorialSprite: {
			default: null,
			type: cc.Sprite
		},
		landSprite: {
			default: null,
			type: cc.Sprite
		},
		skyNode: {
			default: null,
			type: cc.Node
		},
		gameOverSprite: {
			default: null,
			type: cc.Sprite
		},
		scorePanelSprite: {
			default: null,
			type: cc.Sprite
		},
		landRootNode: {
			default: null,
			type: cc.Node
		},
		currentScoreLabel: {
			default: null,
			type: cc.Label
		},
		templatePipePairNode: {
			default: null,
			type: cc.Node
		},
		finalScoreLabel: {
			default: null,
			type: cc.Label
		},
		bestScoreLabel: {
			default: null,
			type: cc.Label
		}
    },
	
	statics: {
		STATE_TITLE: 0,
		STATE_PLAY:  1,
		STATE_OVER:  2,
		gravity:     -1.5,
		landTop:     0, // To be set in 'onLoad'
		skyBottom:   0,  // To be set in 'onLoad',
		pipePairPoolSize: 3
	},

    // use this for initialization
    onLoad: function () {
		var me = this;
		this.anim = this.landRootNode.getComponent(cc.Animation);		
		//this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onPlayerAct, this);	
		this.node.on(cc.Node.EventType.TOUCH_START, this.onPlayerAct, this);
		this.birdScript = this.birdSprite.getComponent('Bird');
		var box = this.landSprite.node.getBoundingBox();
		Game.landTop = box.y + box.height;
		Game.skyBottom = this.skyNode.y;
		for (var i=0; i<Game.pipePairPoolSize-1; i++) {
			var pipePairNode = cc.instantiate(this.templatePipePairNode);
			pipePairNode.parent = this.templatePipePairNode.parent;
			this._pipePairNodeList.push(pipePairNode);
		}
		this._pipePairNodeList.push(this.templatePipePairNode);
		this.node.on('current-score-changed', function(event) {
			me.currentScoreLabel.string = event.detail;
			me.finalScoreLabel.string = event.detail;
		});
		this.node.on('best-score-changed', function(event) {
			me.bestScoreLabel.string = event.detail;
		});
		cc.view.enableAntiAlias(false);
	},
	
	start: function() {
		this.changeState(Game.STATE_TITLE);		
	},
	
	onPlayerAct: function(event) {
		switch (this._state) {
			case Game.STATE_TITLE:
				this.changeState(Game.STATE_PLAY);
				break;
			case Game.STATE_PLAY:
				this.birdScript.jump();
				break;
			case Game.STATE_OVER:
				this.changeState(Game.STATE_TITLE);
				break;
			default:
				break;
		}
	},
	
	checkCollision: function() {
		var me = this;
		if (this.birdScript.node.getBoundingBox().y <= Game.landTop) {
			this.changeState(Game.STATE_OVER);
		}
		if (this._pipePairNodeList.find(function(pipePairNode) {
			return pipePairNode.getComponent('PipePair').checkCollision(me.birdScript.getCollisionBox());
		})) {
			this.changeState(Game.STATE_OVER);
		}
	},
	
	setCurrentScore: function(score) {
		if (score != this._currentScore) {
			this._currentScore = score;
			this.node.emit('current-score-changed', this._currentScore);
			if (this._currentScore > this._bestScore) {
				this._bestScore = this._currentScore;
				this.node.emit('best-score-changed', this._bestScore);
			}
		}
	},
	
	updateScore: function() {
		var birdScript = this.birdScript;
		var game = this;
		this._pipePairNodeList.forEach(function(pipePairNode) {
			var pipePairScript = pipePairNode.getComponent('PipePair');
			if (!pipePairScript.passed && 
				pipePairScript.getBoundingRight() < birdScript.getBoundingLeft()) {
				pipePairScript.passed = true;
				game.setCurrentScore(game._currentScore + 1);
			}
		});		
	},
	
	generateNewPipePair: function() {
		var notMovingPipePairNode = this._pipePairNodeList.find(function(pipePairNode) {
			return !pipePairNode.getComponent('PipePair').inMoving();
		});
		if (notMovingPipePairNode) {
			notMovingPipePairNode.getComponent('PipePair').setup();
		}
	},
	
	update: function(dt) {
		this._currentFrame++;
		if (this._state === Game.STATE_PLAY) {
			this.checkCollision();
			this.updateScore();
			this.currentScoreLabel.string = this._currentScore;
			if (this.birdScript.getDistance() % PipePair.span === 0) {
				this.generateNewPipePair();
			} 
		}
	},

	getState: function() {
		return this._state;
	},
	
	inState: function(state) {
		return this._state === state;
	},
	
	changeState: function(newState) {
		//cc.log('state: ' + this._state + ' => ' + newState);
		if (newState !== this._state) {
			this.onExitState(this._state);
			this._state = newState;
			this.onEnterState(this._state);
		}
	},
		
	onEnterState: function(state) {
		switch (this._state) {
			case Game.STATE_TITLE:
				this.readySprite.node.active = true;
				this.tutorialSprite.node.active = true;
				this.gameOverSprite.node.active = false;
				this.scorePanelSprite.node.active = false;
				this.currentScoreLabel.node.active = false;
				this.anim.resume('LandMove');
				this.birdScript.reborn();
				this._pipePairNodeList.forEach(function(pipePairNode) {
					pipePairNode.getComponent('PipePair').reset();
				});
				break;
			case Game.STATE_PLAY:
				this.birdScript.free();
				this.birdScript.jump();
				this.readySprite.node.active = false;
				this.tutorialSprite.node.active = false;
				this.gameOverSprite.node.active = false;
				this.scorePanelSprite.node.active = false;
				this.currentScoreLabel.node.active = true;	
				this.setCurrentScore(0);
				break;
			case Game.STATE_OVER:
				this.gameOverSprite.node.active = true;
				this.scorePanelSprite.node.active = true;
				this.gameOverSprite.node.active = true;
				this.scorePanelSprite.node.active = true;
				this.currentScoreLabel.node.active = false;
				this.birdScript.die();
				this.anim.pause('LandMove');
				break;
			default:
				break;
		}		
	},
	
	onExitState: function(state) {
		
	},
	
	getCurrentFrame: function() {
		return this._currentFrame;
	}
});


