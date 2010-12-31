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
var codeLength = 4;

function generateSecretCode(length) {
	var code = new Array();
	for (var i = 0; i < length; i++)
		code[i] = Math.floor((Math.random() * numColors));
	return code;
}

//var secretCode = [4, 4, 5, 1];
var secretCode = generateSecretCode(codeLength);

var newRowHtml = '\
<tr class="guess"> \
	<td class="peg"><img src="img/peg-red.png" alt="0" /></td> \
	<td class="peg"><img src="img/peg-red.png" alt="0" /></td> \
	<td class="peg"><img src="img/peg-red.png" alt="0" /></td> \
	<td class="peg"><img src="img/peg-red.png" alt="0" /></td> \
	<td> \
		<table class="feedback"> \
			<tr> \
				<td><img src="img/feedback-hole.png" alt="o" /></td> \
				<td><img src="img/feedback-hole.png" alt="o" /></td> \
			</tr> \
			<tr> \
				<td><img src="img/feedback-hole.png" alt="o" /></td> \
				<td><img src="img/feedback-hole.png" alt="o" /></td> \
			</tr> \
		</table> \
	</td> \
</tr>';

function addRow() {
	// unbind any old guess events
	$('.guess:last .peg img').unbind();
	
	// add new active row
	$('.board').append(newRowHtml);
	
	// bind new click event
	$('.guess:last .peg img').click(function(event) {
		var img = event.target;
		var index = img.parentNode.cellIndex;
		activeGuess[index] = (activeGuess[index] + 1) % 8;
		$(img).attr('src', pegImages[activeGuess[index]]);
		$(img).attr('alt', activeGuess[index].toString());
	});
	
	// reset active guess
	activeGuess = [0, 0, 0, 0];
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

// add first row
addRow();

$('#doGuess').click(function() {
	var solved = showFeedback();
	if (solved) {
		//alert("solved!")
		revealAnswer();
	}
	else {
		addRow();
	}
});

});
