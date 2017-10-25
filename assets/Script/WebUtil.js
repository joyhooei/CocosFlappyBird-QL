var WebUtil = {
	getButtonContainer: function() {
		var buttonContainer = null;
		if (cc.sys.isBrowser) {
			buttonContainer = document.getElementById('buttonContainer');
			if (!buttonContainer) {
				buttonContainer = document.createElement('DIV');
				buttonContainer.id = 'buttonContainer';
				document.getElementById('Cocos2dGameContainer').appendChild(buttonContainer);
			}			
		}
		return buttonContainer;
	},
	createButton: function(text, callback) {
		var button = document.createElement('BUTTON');
		button.innerHTML = text;
		button.style = 'flex-shrink: 0; margin: 10px';
		button.onclick = callback;
		
		return button;
	}
};

module.exports = WebUtil;