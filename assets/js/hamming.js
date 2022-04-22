(function() {
function recalculate() {
	var input = document.getElementById("hinput").value;
	
	if (input.length == 0 || !validCodeWord(input)) return "";
	var output = "";
	
	output += "Codeword   : " + input + "<br>";
	var n = input.length;
	output += "Length : " + n + " bits<br>";
	var r = Math.floor(Math.log(n)/Math.log(2))+1;
	output += "Parity bits: " + r + "<br>";
	var dataBits = n-r;
	output += "Data bits : " + dataBits + "<br>";
	
	//print a colored map of parity and data
	output += parityColorHtml(input);
	
	output += "<br>"
	
	xorBits = [];
	
	for (var parn=0;parn<r;parn++) {
		var binValue = Math.pow(2,parn);
		var index = binValue-1;
		output += "Parity bit at " + binValue + " = "
			+ input.charAt(index) + "<br>";
		//start at index, check each if composed of this num
		var xorme = false;
		for (var check=binValue;check<=n;check++) {
			if ((check & binValue) != 0) {
				var checkIndex = check-1;
				var val = input.charAt(checkIndex);
				var boolVal = val==0 ? false : true;
				xorme = boolVal != xorme;
				output += "...it checks bit at index "+check+" (="+val+")<br>";
			}
		}
		
		var xormeAsInteger = (xorme ? 1 : 0);
		output += "...all of these XOR'd together result in = "
			+xormeAsInteger+"<br>";
		xorBits.push(xormeAsInteger);
	}
	
	var stringBits = xorBitsToString(xorBits.reverse());
	var bitsAsInt = parseInt(stringBits, 2);
	output+="Putting the XOR'd bits together backwards, we get "
		+stringBits+"<br>";
	output+="which is "+bitsAsInt+" in base 10.<br>";
	
	if (bitsAsInt == 0) {
		output += "Because the comination is 0, the codeword is "
		+"<span class='imp'>CORRECT</span>.<br>";
	} else {
		var actualValue = correction(input, bitsAsInt-1);
		output += "Because the combination is "+bitsAsInt
		+", the "+bitsAsInt+"th bit is incorrect.<br>"
		+"The codeword is <span class='imp'>INCORRECT</span><br>"
		+"and that means the corrected codeword, instead of<br>"
		+input+"<br>"
		+"is actually<br>"
		+actualValue+"<br>";
	}
	
	return output;
}

function validCodeWord(code) {
	for (var i=0;i<code.length;i++) {
		var charHere = code.charAt(i);
		if (charHere!="1" && charHere!="0") {
			return false;
		}
	}
	return true;
}

function correction(code, flipIndex) {
	var charThere = code.charAt(flipIndex);
	var flipped = charThere == "1" ? "0" : "1";
	return setCharAt(code,flipIndex,flipped);
}

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}

function xorBitsToString(xb) {
	var output = "";
	for (var i=0;i<xb.length;i++) {
		output+= (xb[i] ? "1" : "0");
	}
	return output;
}

function parityColorHtml(input) {
	var output = "";
	for (var index=0; index<input.length; index++) {
		var bindex = index+1;
		var isBin = isInt(Math.log(bindex)/Math.log(2));
		if (isBin) {
			output += "<span class='par'>"
				+input.charAt(index)+"</span>"
		} else {
			output += "<span class='dat'>"
				+input.charAt(index)+"</span>"
		}
	}
	
	return output;
}

function isInt(n) {
	return n % 1 === 0;
}

function spit() {
	var output = recalculate();
	var element = document.getElementById("houtput");
	element.innerHTML = output; //.replace(/\s/g, "&nbsp;")
}

function reverse(s){
	return s.split("").reverse().join("");
}

//function onLoad() {
	document.getElementById("hinput").value = "011100101010";
	document.getElementById("hbutton").onclick = function() { spit(); };
//}
})();
