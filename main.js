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
	game.prototype.tips = function(cont){
		
		let sheepLifeTip = document.querySelector('#sheepLife');
		let gradeTip = document.querySelector('#grade');
		sheepLifeTip.innerText = g.sheep.life;
		gradeTip.innerText = g.grade + ' level';
		if (cont) {
			alert(cont)
		}

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
		let getPlantIndex = function(){
			return	sheep.x / g.yard.cell * g.yard.w / g.yard.cell + sheep.y / g.yard.cell
		}
		g.yard.grasses[getPlantIndex()].eat();
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
	sheepProto.checkGrade = function() {
		if (this.life <= 0) {
			g.grade = 1;
			g.nextLevel();
			return 'game over';
		} else if (g.yard.leftHealthyPlants <= 0) {
			++ g.grade;
			g.nextLevel();
			return 'level:' + g.grade;
		} else {
			return false;
		}
	}
	game.prototype.nextLevel = function() {
		g.sheep = new g.SheepCreate();
		g.yard.generate();
	}

	game.prototype.fresh = function() {
		ctx.clearRect(0,0,500,500);
		g.yard.draw();
		g.sheep.draw();
		this.tips(g.sheep.checkGrade());
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
		g.yard.grasses = [];
		for (let i = 0; i <= num - 1; i++) {
			for (let j = 0; j < num; j++) {
				g.yard.grasses.push(new g.plant(i * g.yard.cell, j * g.yard.cell, 1))
			}
		}
		let mushrooms = [];
		let arr = [];
		g.yard.leftHealthyPlants = 0;
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
			if (type == 2) {
				g.yard.leftHealthyPlants ++;
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
	plantProto.eat = function() {
		if (this.type == 2) {
			this.life --;
			g.sheep.life ++;
			g.yard.leftHealthyPlants --;
		} else if (this.type == 3) {
			this.life --;
			g.sheep.life --;
		}
		if (this.life <= 0) {
			this.type = 1;
			this.life = 0;
		}
	}

	plantProto.draw = function() {
		ctx.fillStyle = this.color();
		ctx.fillRect(this.x, this.y, g.yard.cell, g.yard.cell);
	}

	let g = new game();
	g.init(500, 500, 2)
	

})