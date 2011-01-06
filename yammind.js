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

function pegImageToColor(imgPath) {
	for (var i = 0; i < pegImages.length; i++) {
		if (imgPath == pegImages[i])
			return i;
	}
	return -1; // indicates hole
}

function colorToPegImage(color) {
	if (color >= 0 && color < pegImages.length)
		return pegImages[color];
	else
		return 'img/peg-hole.png';
}

var numColors = pegImages.length;
var codeLength = 4;
var activePegIndex = -1;

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
		html += '<td class="peg"><img src="img/peg-hidden.png"/></td>';
	}
	html += '<td></td>';
	html += '</tr>';
	return html;
}

var cellHtml = '<td class="peg"><img src="img/peg-hole.png"/></td>';

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
			rowHtml += '<td><img src="img/feedback-hole.png"/></td>';
		}
		rowHtml += '</tr>';
	}
	rowHtml += '</table></td></tr>';
	return rowHtml;
}

function countActivePegs() {
	var count = 0;
	for (var i = 0; i < codeLength; i++) {
		if (activeGuess[i] >= 0)
			count++;
	}
	return count;
}

function setActiveGuess(pegIndex, color) {
	activeGuess[pegIndex] = color;
	var img = $('.guess:last .peg:eq(' + pegIndex + ') img');
	img.attr('src', colorToPegImage(color));
	img.attr('alt', color.toString());
	$('#doGuess').attr('disabled', countActivePegs() == 0);
}

function pegClick(event) {
	var cell = event.target.parentNode;
	var index = cell.cellIndex;
	if (activePegIndex == index && $('#selector').is(':visible')) {
		// hide selector
		$('#selector').slideUp('fast', function() {
			activePegIndex = -1;
		});
		return;
	}

	var cellPos = $(cell).offset();
	var cellWidth = $(cell).width();
	var cellHeight = $(cell).height();
	var selectorWidth = $('#selector').width();
	var newLeft = (cellPos.left + cellWidth/2) - (selectorWidth/2);
	newLeft = Math.max(0, newLeft);
	var newTop = cellPos.top + cellHeight;
	if (activePegIndex != index) {
		// animate out selector, then in in new pos
		$('#selector').slideUp(50, function() {
			$('#selector').css({'left': newLeft, 'top': newTop}).slideDown('fast');
			activePegIndex = index;
		});
	}
	else {
		// just animate in in correct pos
		$('#selector').css({'left': newLeft, 'top': newTop}).slideDown('fast');
		activePegIndex = index;
	}
}

function hideAndUnbindSelector() {
	$('#selector').hide();
	$('.guess:last .peg img').unbind();
}

function addRow() {
	// unbind any old guess events
	hideAndUnbindSelector();
	
	// add new active row
	$('.board').append(generateRowHtml(numColors, codeLength));
	
	// bind new click event
	$('.guess:last .peg img').click(pegClick);
	
	// reset active guess
	activeGuess = new Array();
	for (var i = 0; i < codeLength; i++)
		activeGuess[i] = -1;
	// reset misc
	activePegIndex = -1;
	$('#selector').hide();
	$('#doGuess').attr('disabled', true);
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
	hideAndUnbindSelector();
	$('#doGuess').attr('disabled', true);
	$('#doReset').attr('disabled', false);
	for (var index = 0; index < secretCode.length; index++) {
		var img = $('#solution td:eq(' + index + ') img');
		img.attr('src', pegImages[secretCode[index]]);
		img.attr('alt', secretCode[index].toString());
	}
};

function prepareSelector() {
	var selector = $('#selector');
	selector.hide();
	selector.empty();
	tmphtml = '';
	for (var col = 0; col < numColors; col++) {
		tmphtml += '<img src="' + pegImages[col] + '"/>';
	}
	tmphtml += '<img src="img/peg-hole.png"/>';
	//alert("Appending: " + tmphtml);
	selector.append(tmphtml);
	$('#selector img').click(function(event) {
		var img = event.target;
		var color = pegImageToColor($(img).attr('src'));
		if (activePegIndex >= 0) {
			setActiveGuess(activePegIndex, color);
			$('#selector').slideUp('fast');
		}
	});
}

function resetGame() {
	codeLength = parseInt($('#codeLength').val());
	numColors = parseInt($('#numColors').val());
	
	secretCode = generateSecretCode(codeLength);
	$('.board').empty();
	$('.board').append(generateSolutionRowHtml(codeLength));
	prepareSelector();
	addRow();
	
	// cannot give up until after the first guess 
	$('#doGiveUp').attr('disabled', true);
}

$('#doGuess').click(function() {
	var solved = showFeedback();
	if (solved) {
		revealAnswer();
	}
	else {
		addRow();
		// after first guess, disallow reset until won or given up 
		$('#doReset').attr('disabled', true);
		$('#doGiveUp').attr('disabled', false);
	}
});

$('#doReset').click(function() {
	resetGame();
});

$('#doGiveUp').click(function() {
	revealAnswer();
	$('#doGiveUp').attr('disabled', true);
});

$('#toggleHelp').click(function() {
	$('.help').slideToggle();
});

$('#toggleOptions').click(function() {
	$('.options').slideToggle();
});

// initialize
resetGame();

});
