var badass = require("./../../index.js")
	,testableMethods = badass.testableMethods

describe("replaceBetween()", function() {
	var START = "{{START}}"
		,END = "{{END}}";

	it("should replace 'love' with 'money' and no longer contain delimeters", function() {
		
		var originalStr = "I need your "+START+"love"+END+"."
			,modifiedStr = testableMethods.replaceBetween( START, END, originalStr, 'money' );

		expect( modifiedStr ).toBe("I need your money.");
	});

	it("should replace 'time' with 'sugar' and still contain delimeters", function() {
		var originalStr = "I need your "+START+"time"+END+"."
			,modifiedStr = testableMethods.replaceBetween( START, END, originalStr, 'sugar', true );

		expect( modifiedStr ).toBe("I need your "+START+"sugar"+END+".");
	});

	it("should replace a string containing a line break with an empty string and no longer contain delimeters", function() {
		var originalStr = "I need "+START+"a break \n from "+END+"you."
			,modifiedStr = testableMethods.replaceBetween( START, END, originalStr );

		expect( modifiedStr ).toBe("I need you.");
	});

	it("should replace a string containing a '*' symbol in its delimeters", function() {
		var start = "{{START*}}"
			,end = "{{END*}}"
			,originalStr = "'asterisk' "+start+"not 'asteriks' "+end+"is a common mistake."
			,modifiedStr = testableMethods.replaceBetween( start, end, originalStr );

		expect( modifiedStr ).toBe("'asterisk' is a common mistake.");
	});

	it("should replace a string containing a '?' symbol in its delimeters", function() {
		var start = "{{START?}}"
			,end = "{{END?}}"
			,originalStr = "What's the "+start+"meaning of this "+end+"question?"
			,modifiedStr = testableMethods.replaceBetween( start, end, originalStr );

		expect( modifiedStr ).toBe("What's the question?");
	});
});