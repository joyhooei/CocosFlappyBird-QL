var WebUtil = require('WebUtil');

var Benchmark = cc.Class({
	extends: cc.Component,
		
	properties: {
	},
	
	statics: {
		datasetColors: [
			'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'grey'
		]
	},
	
	ctor: function() {
		this.enabled = true;
		this._index = 0;
	},
	
	updateData: function(params, stat, game){
		if (this.enabled) {
			var label = params.toString();
			var dataset = this.chart.data.datasets.find(function(dataset) {
				return dataset.label === label;
			});
			if (!dataset) {
				var color = Benchmark.datasetColors[this.chart.data.datasets.length % Benchmark.datasetColors.length];
				dataset = {
					label: label,
					backgroundColor: color,
					borderColor: color,
					data: [],
					fill: false,
					showLine: true					
				};
				this.chart.data.datasets.push(dataset);
			}
			dataset.data.push({
				x: stat.episodes,
				y: game.getFinalScore()
			});
			this.chart.update();
		}
	},
	
	onLoad: function() {
		if (cc.sys.isBrowser) {
			var container = document.createElement('DIV');
			var canvas = document.createElement('CANVAS');
			var contentWrap = document.querySelector('.contentWrap');
			if (!contentWrap) {
				contentWrap = document.getElementById('Cocos2dGameContainer');
			}
			
			var buttonContainer = WebUtil.getButtonContainer();
			var clearButton = document.createElement('BUTTON');
			clearButton.innerHTML = 'Clear Data';
			clearButton.style.margin = '10px';
			clearButton.style.flexShrink = '0';
			
			clearButton.onclick = () => {
				this.chart.data.datasets = [];
				this.chart.update();					
			};
			buttonContainer.appendChild(clearButton);
			
			contentWrap.parentNode.appendChild(buttonContainer);
			
			contentWrap.style.display = 'block';
			contentWrap.style.width = 'auto';
			contentWrap.style.overflow = 'unset';
			contentWrap.style.position = 'relative';
			
			container.style.display = 'flex';
			container.style.width = '100%';
			container.style.maxWidth = '640px';
			container.style.height = '480px';
			container.appendChild(canvas);
			contentWrap.parentNode.appendChild(container);
			
			var scrollButton = document.createElement('BUTTON');	
			scrollButton.style.width = '96px';
			scrollButton.style.height = '32px';
			scrollButton.style.position = 'absolute';
			scrollButton.style.margin = '0 -48px';
			scrollButton.style.left = '50%';
			scrollButton.style.top = '5px';
			scrollButton.onclick = function() {
				window.scrollTo(0, 78);
			}
			scrollButton.innerHTML = 'Scroll Down';
			document.getElementById('Cocos2dGameContainer').appendChild(scrollButton);
			
			document.body.style.height = 'fit-content';
						
			var ctx = canvas.getContext('2d');
			var options = {
                scales: {
                    xAxes: [{
						position: 'bottom',						
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Episode'
                        },
						ticks: {
							min: 0
						}						
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Score'
                        },
						ticks: {
							min: 0
						}						
                    }]
                }				
			};
			this.chart = new Chart(ctx, {
				type: 'scatter',
				data: {
					datasets: []
				},
				options: options
			});
		}
	},
	
	doNextCase: function() {
		var ret = true;
		this._index ++;
		switch (this._index) {
			case 1:
				cc.QL.params.alpha += 0.0001;
				break;
			default:
				ret = false;
				break;			
		}
		return ret;
	}
});