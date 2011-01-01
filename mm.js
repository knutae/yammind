$(document).ready(function(){

var activeGuess = []; // initialized in addRow()
var pegImages = [
	'img/peg-red.png',
	'img/peg-green.png',
	'img/peg-blue.png',
	'img/peg-yellow.png',
	'img/peg-purple.png',
	'img/peg-cyan.png',
	'img/peg-white.png',
	'img/peg-black.png'
];

var numColors = pegImages.length;
var codeLength = 5;

function generateSecretCode(length) {
	var code = new Array();
	for (var i = 0; i < length; i++)
		code[i] = Math.floor((Math.random() * numColors));
	return code;
}

var secretCode = generateSecretCode(codeLength);

function generateSolutionRowHtml(numPegs) {
	var html = '<tr id="solution">';
	for (var i = 0; i < numPegs; i++) {
		html += '<td class="peg"><img src="img/peg-hidden.png" alt="?" /></td>';
	}
	html += '</tr>';
	return html;
}

var cellHtml = '<td class="peg"><img src="img/peg-red.png" alt="0" /></td>';

function generateRowHtml(numColors, numPegs) {
	var rowHtml = '<tr class="guess">';
	for (var i = 0; i < numPegs; i++) {
		rowHtml += cellHtml;
	}
	rowHtml += '<td><table class="feedback">';
	// two rows of feedback holes
	var rowLengths = [Math.ceil(numPegs / 2), Math.floor(numPegs / 2)]; 
	for (var row = 0; row < 2; row++) {
		rowHtml += '<tr>';
		for (var col = 0; col < rowLengths[row]; col++) {
			rowHtml += '<td><img src="img/feedback-hole.png" alt="o" /></td>';
		}
		rowHtml += '</tr>';
	}
	rowHtml += '</table></td></tr>';
	return rowHtml;
}

function addRow() {
	// unbind any old guess events
	$('.guess:last .peg img').unbind();
	
	// add new active row
	$('.board').append(generateRowHtml(numColors, codeLength));
	
	// bind new click event
	$('.guess:last .peg img').click(function(event) {
		var img = event.target;
		var index = img.parentNode.cellIndex;
		activeGuess[index] = (activeGuess[index] + 1) % 8;
		$(img).attr('src', pegImages[activeGuess[index]]);
		$(img).attr('alt', activeGuess[index].toString());
	});
	
	// reset active guess
	activeGuess = new Array();
	for (var i = 0; i < codeLength; i++)
		activeGuess[i] = 0;
};

function showFeedback() {
	// clone arrays
	var code = secretCode.slice(0);
	var guess = activeGuess.slice(0);
	
	// calculate number of blacks and whites to show
	var blacks = 0;
	for (var i = 0; i < code.length; i++) {
		if (code[i] == guess[i])
			blacks++;
	}
	var all = 0;
	for (var i = 0; i < code.length; i++) {
		for (var j = 0; j < code.length; j++) {
			if (code[i] == guess[j]) {
				// count matching color only once
				code[i] = -42;
				guess[j] = -43;
				all++; 
			}
		}
	}
	
	function feebackImg(index) {
		return $('.feedback:last td:eq(' + index + ') img');
	}
	
	for (var index = 0; index < blacks; index++) {
		var img = feebackImg(index);
		img.attr('src', 'img/feedback-black.png');
		img.attr('alt', 'B');
	}
	for (var index = blacks; index < all; index++) {
		var img = feebackImg(index);
		img.attr('src', 'img/feedback-white.png');
		img.attr('alt', 'W');
	}
	
	return (blacks == code.length);
};

function revealAnswer() {
	for (var index = 0; index < secretCode.length; index++) {
		var img = $('#solution td:eq(' + index + ') img');
		img.attr('src', pegImages[secretCode[index]]);
		img.attr('alt', secretCode[index].toString());
	}
};

function resetGame() {
	secretCode = generateSecretCode(codeLength);
	$('.board').empty();
	$('.board').append(generateSolutionRowHtml(codeLength));
	addRow();
}

$('#doGuess').click(function() {
	var solved = showFeedback();
	if (solved) {
		revealAnswer();
	}
	else {
		addRow();
	}
});

$('#doReset').click(function() {
	resetGame();
});

// initialize
resetGame();

});
