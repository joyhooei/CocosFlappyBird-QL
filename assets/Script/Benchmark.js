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
			var contentWrap = document.querySelector('.ContentWrap');
			
			var buttonContainer = document.getElementById('buttonContainer');
			if (!buttonContainer) {
				buttonContainer = document.createElement('DIV');
				buttonContainer.id = 'buttonContainer';
				document.getElementById('content').appendChild(buttonContainer);
			}
			var clearButton = document.createElement('BUTTON');
			clearButton.innerHTML = 'Clear Data';
			clearButton.style = 'flex-shrink: 0; margin: 10px';
			
			clearButton.onclick = () => {
				this.chart.data.datasets = [];
				this.chart.update();					
			};
			buttonContainer.appendChild(clearButton);
			
			contentWrap.parentNode.appendChild(buttonContainer);
			
			contentWrap.style.display = 'block';
			contentWrap.style.width = 'auto';
			contentWrap.style.overflow = 'visible';
			
			container.style.display = 'flex';
			container.style.width = '640px';
			container.style.height = '640px';		
			container.appendChild(canvas);
			contentWrap.parentNode.appendChild(container);
						
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
	}
});