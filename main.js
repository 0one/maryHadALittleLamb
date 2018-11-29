define(function (require, exports, module) {
	var utils = require('utils');

	let canvas = document.getElementById("yard");
	let ctx = canvas.getContext("2d");

	let game = function() {
		this.init = (w, h, grade) => {
			this.grade = grade;
			this.yard = new this.Yard(w, h);
			this.yard.generate();
			this.sheep = new this.SheepCreate();
			this.sheep.addPressEvents();
			this.fresh();
		}
	}
	game.prototype.Yard = function(w, h) {
		this.w = w;
		this.h = h;
		this.cell = 50;
		this.grasses = [];
	}
	game.prototype.SheepCreate = function() {
		//箭头函数就会报错
		this.x = 0;
		this.y = 0;
		this.life = 1;
		this.step = 1;
		this.appearance = '#fff';
		this.indentify = function () {
			return this.life
		};
	}

	let sheepProto = game.prototype.SheepCreate.prototype;

	sheepProto.draw = function(){
		ctx.fillStyle = this.appearance;
		ctx.fillRect(this.x, this.y, g.yard.cell, g.yard.cell);
	}

	sheepProto.move = function(direction) {
		let width = g.yard.w;
		let height = g.yard.h;
		let sheep = g.sheep;
		switch (direction) {
			case 'right' :
				sheep.x < width - g.yard.cell ? sheep.x = sheep.x + sheep.step * g.yard.cell : sheep.x = width - g.yard.cell;
				break;
			case 'left' :
				sheep.x > 0 ? sheep.x = sheep.x - sheep.step * g.yard.cell : sheep.x = 0;
				break;
			case 'up' :
				sheep.y > 0 ? sheep.y = sheep.y - sheep.step * g.yard.cell : sheep.y = 0;
				break;
			case 'down' :
				sheep.y < height - g.yard.cell ? sheep.y = sheep.y + sheep.step * g.yard.cell : sheep.y = height - g.yard.cell;
				break;
		}
	}

	sheepProto.addPressEvents = function () {
		window.addEventListener( "keydown", e => {
			switch (e.keyCode) {
				case 39 : 
					g.sheep.move('right');
					break;
				case 37 : 
					g.sheep.move('left');
					break;
				case 40 : 
					g.sheep.move('down');
					break;
				case 38 : 
					g.sheep.move('up');
					break;
			}
			g.fresh();
		})
	}

	game.prototype.fresh = function() {
		ctx.clearRect(0,0,500,500);
		g.yard.draw();
		g.sheep.draw();
	}


	game.prototype.plant = function(x, y, type) {
		this.x = x;
		this.y = y;
		this.life = 1;
		this.type = type || 'grass'; //or good mushroom , bad mushroom  
	}

	let plantProto = game.prototype.plant.prototype;

	plantProto.color = function(){ 
		this.grassColor = '#014200'; // type
		this.goodMushroomColor = '#f00';
		this.badMushroomColor = '#00f';

		if (this.type == 1) {
			ctx.fillStyle = this.grassColor;
		} else if (this.type == 2) {
			ctx.fillStyle = this.goodMushroomColor;
		} else if (this.type == 3) {
			ctx.fillStyle = this.badMushroomColor;
		}
		return ctx.fillStyle;
	}

	let yardProto = game.prototype.Yard.prototype;

	yardProto.generate = function() {
		let num = g.yard.w / g.yard.cell;
		for (let i = 0; i <= num - 1; i++) {
			for (let j = 0; j < num; j++) {
				g.yard.grasses.push(new g.plant(i * g.yard.cell, j * g.yard.cell, 1))
			}
		}
		let mushrooms = [];
		let arr = [];
		for (var i = 0; i < g.grade; i++) {
			let genFn = function(num, arr) {
				let x = utils.getRandomIntInclusive(1, g.yard.grasses.length - 1);
				if (!arr.includes(x)) {
					arr.push(x);	
				} else {
					genFn(num, arr);
				}
			}
			genFn(num, arr);
		}
		for (var i = 0; i < arr.length; i++) {
			let plant = g.yard.grasses[arr[i]];
			let type = 2;//随机设置植物type, 并保证至少有一个1,在2个以上的情况下，至少有一个2
			if (i == 0 ) {
				type = 2;
			} else if (i == 1) {
				type = 3;
			} else {
				type = utils.getRandomIntInclusive(2,3);
			}
			g.yard.grasses[arr[i]] = new g.plant(plant.x, plant.y, type)
		}
	}
	yardProto.draw = function() {
		for (var i = 0; i < g.yard.grasses.length; i++) {
			let plant = g.yard.grasses[i];
			plant.draw();
		}
	}

	plantProto.draw = function() {
		ctx.fillStyle = this.color();
		ctx.fillRect(this.x, this.y, g.yard.cell, g.yard.cell);
	}

	game.prototype.status = {

	}

	let g = new game();


	g.init(500, 500,10);

})