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
		birdNode: {
			default: null,
			type: cc.Node
		},
		readyNode: {
			default: null,
			type: cc.Node
		},
		tutorialNode: {
			default: null,
			type: cc.Node
		},
		landNode: {
			default: null,
			type: cc.Node
		},
		skyNode: {
			default: null,
			type: cc.Node
		},
		gameOverNode: {
			default: null,
			type: cc.Node
		},
		scorePanelNode: {
			default: null,
			type: cc.Node
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
		this.birdScript = this.birdNode.getComponent('Bird');
		var box = this.landNode.getBoundingBox();
		Game.landTop = box.y + box.height;
		Game.skyBottom = this.skyNode.y;
		for (var i=0; i<Game.pipePairPoolSize-1; i++) {
			var pipePairNode = cc.instantiate(this.templatePipePairNode);
			pipePairNode.parent = this.templatePipePairNode.parent;
			this._pipePairNodeList.push(pipePairNode);
		}
		this._pipePairNodeList.push(this.templatePipePairNode);

		this.currentScoreLabel.string = this._currentScore;
		this.bestScoreLabel.string = this._bestScore;
		this.finalScoreLabel.string = this._currentScore;
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
		var birdBox = this.birdNode.getBoundingBox();
		if (birdBox.y <= Game.landTop) {
			this.changeState(Game.STATE_OVER);
		}
		if (this._pipePairNodeList.find(function(pipePairNode) {
			return pipePairNode.getComponent('PipePair').checkCollision(me.birdNode.getBoundingBox());
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
		var firstPipePairScript = this._pipePairNodeList[0].getComponent('PipePair');;
		
		if (!firstPipePairScript.passed && 
			firstPipePairScript.getBoundingRight() < this.birdNode.getBoundingBox().x) {
			firstPipePairScript.passed = true;
			this.setCurrentScore(this._currentScore + 1);
			this._pipePairNodeList.push(this._pipePairNodeList.shift());
		}
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
		if (newState !== this._state) {
			this.onExitState(this._state);
			this._state = newState;
			this.onEnterState(this._state);
		}
	},
		
	onEnterState: function(state) {
		switch (this._state) {
			case Game.STATE_TITLE:
				this.readyNode.active = true;
				this.tutorialNode.active = true;
				this.gameOverNode.active = false;
				this.scorePanelNode.active = false;
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
				this.readyNode.active = false;
				this.tutorialNode.active = false;
				this.gameOverNode.active = false;
				this.scorePanelNode.active = false;
				this.currentScoreLabel.node.active = true;	
				this.setCurrentScore(0);
				break;
			case Game.STATE_OVER:
				this.gameOverNode.active = true;
				this.scorePanelNode.active = true;
				this.gameOverNode.active = true;
				this.scorePanelNode.active = true;
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
	},
	
	getFirstComingPipePairNode: function() {
		return this._pipePairNodeList[0];
	},
	
	getBestScore: function() {
		return this._bestScore;
	},
	
	getFinalScore: function() {
		return this._currentScore;
	}
});


