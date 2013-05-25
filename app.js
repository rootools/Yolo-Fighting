var gamepad = new Gamepad();
gamepad.init();

enchant();
var game = new Game(1136, 640);
game.preload(['ground2.png', 'bg.jpg', 'pl4.png', 'ryu2.png']);

var Character = {
	create: function() {
		var char = new Sprite(67, 83);
  	char.image = game.assets['ryu2.png'];
  	char.scale(2, 2);
  	char.y = 415;
  	char.x = 30;
  	char.speed = 10;
  	char.jump = false;
  	char.action = 'run';
    char.HP = 100;
  	char.animationDuration = 0;
  	
		return char;
	},
	
	jump: function(char) {
		char.action = 'jump';
		char.jump = true;
		char.tl.moveY(275, 7);
    char.tl.moveY(415, 7);
    setTimeout(function(){
      char.jump = false;
      char.action = 'run';
    }, 200);
	},
	
	attackHand: function(char) {
		char.action = 'attackHand';
	},
  attackFoot: function(char) {
    char.action = 'attackFoot';
  },
	moveRight: function(char) {
		char.action = 'run';
		char.moveRight = 1;
    char.animationOffset = 0;
	},
	moveLeft: function(char) {
		char.action = 'run';
		char.moveLeft = 1;
    char.animationOffset = 5;
	},
	moveStop: function(char) {
		char.action = 'run';
		char.moveRight = 0;
		char.moveLeft = 0;
	},
	animationStand: function(char, e) {
    char.animationDuration += e.elapsed;
  		if (char.animationDuration >= 250) {
        char.frame =(char.frame + 1) % 2;
        //console.log(typeof(char.frame));
        //console.log(char.frame);
        char.animationDuration -= 250;
  		}
	},
  animationJump: function(char, e) {
    char.action = 'jump';
    char.frame = char.animationOffset + 2;
  },
  animationAttackHand: function(char) {
    char.action = 'attackHand';
    char.frame = char.animationOffset + 4;
    setTimeout(function(){
      char.action = 'run';
    },200);
  },
  animationAttackFoot: function(char) {
    char.action = 'attackFoot';
    char.frame = char.animationOffset + 3;
    setTimeout(function(){
      char.action = 'run';
    }, 200);
  }
};

game.onload = function () {
  var scene = new Scene();
  
  var bg = new Sprite(1136, 640);
  bg.image = game.assets['bg.jpg'];
	
  scene.addChild(bg);
  
  var player1 = Character.create();
  scene.addChild(player1);

  /*var player1_HP = new Label(player1.HP);
  player1_HP.font = "30px cursive";
  scene.addChild(player1_HP);*/

  player1.addEventListener('enterframe', function(e) {
  	if(player1.moveRight === 1 && player1.x < 1072) {
  		player1.x += 10;
  	}
  	if(player1.moveLeft === 1 && player1.x > 0) {
  		player1.x -= 10;
  	}
  	if(player1.action === 'run') {
  		Character.animationStand(player1, e);
  	}
  	if(player1.action === 'stop') {
  		Character.animationStand(player1, e);
  	}
    if(player1.action === 'jump') {
      Character.animationJump(player1, e);
    }
    if(player1.action === 'attackHand') {
      Character.animationAttackHand(player1);
    }
    if(player1.action === 'attackFoot') {
      Character.animationAttackFoot(player1);
    }
  });

  gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
  	if(e.control === 'DPAD_RIGHT') {
  		Character.moveRight(player1);
  	}
  	if(e.control === 'DPAD_LEFT') {
  		Character.moveLeft(player1);
  	}
  	if(e.control === 'X') {
			Character.attackHand(player1);
		}
		if(e.control === 'A') {
    	if(player1.jump === false) {
    		Character.jump(player1);
    	}
		}
		if(e.control === 'Y') {
			Character.attackFoot(player1);	
		}

	});

	gamepad.bind(Gamepad.Event.BUTTON_UP, function(e) {
  	if(e.control === 'DPAD_RIGHT') {
  		Character.moveStop(player1);	
  	}
  	if(e.control === 'DPAD_LEFT') {
  		Character.moveStop(player1);	
  	}
	})

	game.pushScene(scene);
};

game.start();

/*  	if(e.axis === 'LEFT_STICK_X' || e.axis === 'LEFT_STICK_Y') {
  		if(e.value > 0 && e.axis === 'LEFT_STICK_X') {
  			ava.x += 5;
  		} else if(e.value < 0 && e.axis === 'LEFT_STICK_X') {
  			ava.x -= 5;
  		} else if(e.value > 0 && e.axis === 'LEFT_STICK_Y') {
  			ava.y += 5;
  		} else if(e.value < 0 && e.axis === 'LEFT_STICK_Y') {
  			ava.y -= 5;
  		}
  	}
		console.log(e);*/