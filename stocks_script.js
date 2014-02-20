

/////////////  Utility Object ///////////////////////
var utility = {
	toMoney: function(moneyValue) { // adds dollar sign, commas, and two decimal places.
		var money = parseFloat(moneyValue);
		money = money.toFixed(2); // rounds to two decimals and makes sure it's float.
		var length = money.length;
		var place = money.indexOf('.');
		if(place > 3){
			var partA = money.slice(-6);
			var partB = money.slice(-9,-6);
			var partC = money.slice(-12,-9);
		}
		if(place > 6) {
			return "$" + partC + "," + partB+ "," + partA;
		}
		if(place > 3) {
			return "$" + partB + "," + partA;
		} 
		return "$" + money;
	},

	round: function(num) { //Rounds numbers to two decimal places.
	var temp = parseFloat(num) * 100;
	var temp2 = Math.round(temp);
	var temp3 = temp2 / 100;
	return temp3;
	},

	resetTotal: function() {
	if (!localStorage.$cash) {localStorage.$cash = 10000};
	},

	startOver: function() { // Resets local storage.
		var r=confirm("Do you really want to clear all data?");
		if (r===true) {
			localStorage.clear(); //Clears local storage.
			this.resetTotal(); //Resets running $cash total.
			portfolio.displayTable();
		}
	}

} // utility object end bracket

///////////////  Global Objects //////////////

var portfolio = { //Main Portfolio Object

	checkStatus : function() { // Checks whether request is Buy or Sell and processes it to local storage.
		var stock = document.getElementById("stock") //Sets the 'stock' property on 'portfolio' object.
		var quantity = document.getElementById("quantity"); // " for 'quantity'
		var price = document.getElementById("price"); // " for 'price'
		var total = document.getElementById("total"); // " for 'total'
		var stockStorage = []; // Array to store data into, which will be stringified and put into local storage.
			stockStorage[0] = stock.value;
			stockStorage[1] = quantity.value;
			stockStorage[2] = price.value;
			stockStorage[3] = total.value;
			this.stockStorage = stockStorage; //Sets 'stockStorage' as a property of 'portfolio' object.
		
		if (document.getElementById('sell').checked) { //Determines buy or sell order and routes accordingly.
			this.sellStock(); //Routes to 'sell' code.
		} else { 
			this.buyStock(); // Routes to 'buy' code.
		}
	},

	buyStock: function() { //buy stock code
			localStorage.$cash = localStorage.$cash - parseFloat(this.stockStorage[3]); //Subtracts purchase from $cash (total $cash)
			localStorage.$cash = utility.round(localStorage.$cash);// Rounds $cash to two decimal places.
			//Get data into local storage.
			var key = this.stockStorage[0];
			if (localStorage.getItem(key)) { // Tests to see if the stock already exists. If so adds it to the existing total.
				var temp = JSON.parse(localStorage.getItem(key));
				temp[1] = parseFloat(temp[1]) + parseFloat(this.stockStorage[1]); // Adds quanitiy value
				temp[3] = parseFloat(temp[3]) + parseFloat(this.stockStorage[3]); // Adds total value
				temp[2] = temp[3] / temp[1]; // calculate average price from total divided by quantity.
				localStorage.setItem(temp[0], JSON.stringify(temp));
			} else {		
			localStorage.setItem(key, JSON.stringify(this.stockStorage)); // put into local storage.
			};
			this.reset();
			this.displayTable();
	},

	sellStock: function() {
		
		var key = this.stockStorage[0]; //Get data into storage.
			if (localStorage.getItem(key)) {
				var temp = JSON.parse( localStorage.getItem(key));
				localStorage.$cash = parseFloat(localStorage.$cash) + parseFloat(this.stockStorage[3]); // Adds sale to $cash (total $cash)
				temp[1] = parseFloat(temp[1]) - parseFloat(this.stockStorage[1]); // Subtracts quanitiy value
					if(temp[1] < 0) { // stops from selling unowned stock.
						alert("You don't own that much.");
						return;
					}
				temp[2] = parseFloat(this.stockStorage[2]);
				temp[3] = parseFloat(temp[1]) * parseFloat(this.stockStorage[2]); // Finds new total value
				localStorage.setItem(temp[0], JSON.stringify(temp));		
			} else {alert("You don't own that stock")}
			if(temp[1] ===0) {localStorage.removeItem(key);}
			this.reset();
			this.displayTable();
	},

	reset: function() { //Reset input form for next input.
		document.getElementById("form2").reset(); // Reset the form for the next input.
		total.value = '';
		total.innerHTML = ''; //Clears total for next input.
		stock.focus(); // focuses the curser on the stock name input to be ready to add another listing.
		this.total();
	},

	displayTable: function() { //NEEDS BUILT Each time data is updated, this method grabs the data from localStorage and makes a table.
		
		var node = document.getElementById('list'); //Gets table body from main page.
		$('.listing').remove();
		$('BR').remove();
		var p = localStorage;
		for (var key in p) {
			if (p.hasOwnProperty(key)) {
				var row = document.createElement('TR');
				var fromStorage = JSON.parse(localStorage.getItem(key)); // Gets listing from localStorage.
				fromStorage[3] = utility.toMoney(fromStorage[3]); // converts to money format
				for (var i=0; i < fromStorage.length; i++) { //Reading each piece of data from the array.
				 	var td = document.createElement('TD'); //Creates table data element to append text to.
				 	var text = document.createTextNode(fromStorage[i]);
				 	td.appendChild(text); //inserts text.
				 	row.appendChild(td); //Appends td to table row.
				 	row.className = 'listing'; //allows deletion on next rendering.
				 	node.appendChild(row); //Appends row to table.
				 	}
				}; 
			};
		// List cash in the table.
			var br = document.createElement('BR');
			node.appendChild(br);
			var cash = JSON.parse(localStorage.getItem('$cash'));
			cash = utility.toMoney(cash); // converts to money format 
			var row = document.createElement('TR');
			var td = document.createElement('TD');
			var text = document.createTextNode('Cash');
			td.appendChild(text);
			row.appendChild(td);
			var td = document.createElement('TD');
			var text = document.createTextNode(cash);
			td.appendChild(text);
			row.appendChild(td);
			row.className = 'listing';
			node.appendChild(row);

		//List total value
			var row = document.createElement('TR');
			var td = document.createElement('TD');
			var text = document.createTextNode('Total Value');
			td.appendChild(text);
			row.appendChild(td);
			var td = document.createElement('TD');
			var text = document.createTextNode(utility.toMoney(this.totalValue())); //Calls totalValue method for total.
			td.appendChild(text);
			row.appendChild(td);
			row.className = 'listing';
			node.appendChild(row);

	},

/////////// Calculates total of stock price and quantity and displays on page. //////////
	total: function() { 
		var quantity = this.sellAll(); //Makes 'sell all' button work.

		var stock = document.getElementById("stock");
		stock.value = stock.value.toUpperCase();
		stock.innerHTML = stock.value;
		var quantity = document.getElementById("quantity");
		var price = document.getElementById("price");
		var total = document.getElementById("total");
			var x = price.value * quantity.value;
			x = x.toFixed(2);
			total.innerHTML = x;
			total.value = x;
		return;
	},
	sellAll: function() {
		var sellAll = document.getElementById('sellAll') // Selects sell radio button when 'Sell all' is checked.
		if (sellAll.checked) {
			document.getElementById('sell').checked = true;
			document.getElementById('buy').disabled = true;
			document.getElementById("quantity").disabled = true;
			
			
		} else {
			document.getElementById('buy').disabled = false;
			document.getElementById("quantity").disabled = false;
			var quantity = document.getElementById("quantity")
			return quantity;
		};
	},

/////// Contains all the startup code. /////////
	setup: function() {
		this.displayTable();
		utility.resetTotal(); // Total $amount. Starts with $10,000.
		this.total(); // Gives a total of $0.00 for placeholding.
	},

//////  Finds total value of portfolio. Adds cash on hand to stock value. ////////
	totalValue: function() {
		var totalV = 0;
		totalV += parseFloat(localStorage.$cash);
		

		var p = localStorage;
		for (var key in p) {
			if (p.hasOwnProperty(key)) {
				var temp =JSON.parse(localStorage.getItem(key));
				var adder = parseFloat(temp[3]);

					if(adder) { //eliminates undefined from $cash, etc.
						totalV += adder;
					};
				}
			}

		return totalV;
	}	
} // Object closing bracket - portfolio

/////////////////// Code run at startup ////////////////////
portfolio.setup(); // initial setup. Allows minimum DOM access.
var tester = function() {
	var tryer = parseFloat('test');
	alert(tryer);
	}
