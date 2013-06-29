var gamepad = new Gamepad();
gamepad.init();

enchant();
var game = new Game(1136, 640);
game.preload(['ground2.png', 'titlebg1.png', 'press_start.png','bg.jpg', 'pl4.png', 'ryu.png', 'rick.png', 'troll.jpg', 's/kick2.mp3', 's/slap1.mp3', 's/jump1.mp3', 's/intro.mp3', 's/mk.mp3']);

var Character = {

  init: function(params) {

    return {
      pad: params.gamepad.gamepads[params.pad],
      gamepad: params.gamepad,
      scene: params.scene,
      sprite: null,

      create: function() {
        this.sprite = new Sprite(params.scW, params.scH);
        this.sprite.image = params.scImg;
        this.sprite.scale(2, 2);
        this.sprite.y = 415;
        this.sprite.x = params.scX;
        this.sprite.frameParity = 0;
        this.animationDuration = 0;
        this.speed = 10;
        this.maxFrames = params.frames - 1;
        this.way = params.way;
        this.jump = false;
        this.attack = false;
        this.action = 'run';
        this.HP = 100;

        this.scene.addChild(this.sprite);

        var player = this;
        this.sprite.addEventListener('enterframe', function(e) {

          switch (player.action) {
            case 'jump':
              player.actionMove();
              player.actionJump();
            break;

            case 'attackHand':
              player.actionAttackHand();
            break;

            case 'attackFoot':
              player.actionAttackFoot();
            break;

            case 'block':
              player.actionBlock();
            break;

            case 'unblock':
              player.actionUnBlock();
            break;

            default:
              player.actionMove();
              player.actionDefault(e);
          }

        });

        return this;
      },
      
      actionDefault: function(e) {
        if (this.block) {
          this.animationBlock();
        } else {
          this.animationStand(e);
        }
      },

      actionBlock: function() {
          this.block = true;
          this.animationBlock();
          this.action = this.moveState ? 'run' : 'stop';
      },

      actionUnBlock: function() {
          this.block = false;
          this.action = this.moveState ? 'run' : 'stop';
      },

      actionMove: function() {
        for (k in players) {
          if (players[k].pad.id !== this.pad.id) {
            this.way = (this.sprite.x > players[k].sprite.x);
            this.deltaWay = Math.abs(this.sprite.x - players[k].sprite.x) - this.sprite.width/2 - players[k].sprite.width/2;
          }
        }

        switch (this.moveState) {
          case 'right':
          console.log(this.deltaWay);
            if (this.sprite.x < 1072 && (!(!this.way && this.deltaWay < 2) || this.jump)) {
              this.sprite.x += 10;
            }
          break;

          case 'left':
            if (this.sprite.x > 0 && (!(this.way && this.deltaWay < 2) || this.jump)) {
              this.sprite.x -= 10;
            }
          break;
        }

        return true;
      },

      actionJump: function() {
        if (!this.jump) {
          this.jump = true;

          var player = this;
          setTimeout(function(){
            player.jump = false;
            player.action = player.moveState ? 'run' : 'stop';
          }, 200);
        
          this.animationJump();
        }
      },
      
      actionAttackHand: function() {
        if (!this.attack) {
          this.attack = true;

          var player = this;
          setTimeout(function(){
            player.attack = false;
            player.action = player.moveState ? 'run' : 'stop';
          }, 200);

          this.animationAttackHand();
        }
      },

      actionAttackFoot: function() {
        if (!this.attack) {
          this.attack = true;

          var player = this;
          setTimeout(function(){
            player.attack = false;
            player.action = player.moveState ? 'run' : 'stop';
          }, 200);

          this.animationAttackFoot();
        }
      },



      animationStand: function(e) {
        this.animationDuration += e.elapsed;
        if (this.animationDuration >= 250) {
          this.sprite.frameParity = (this.sprite.frameParity + 1) % 2;
          this.sprite.frame = Math.abs(this.way*this.maxFrames - this.sprite.frameParity);
          this.animationDuration = 0;
        }
      },
      animationJump: function() {
        game.assets['s/jump1.mp3'].play();
        this.sprite.tl.moveY(275, 7);
        this.sprite.frame = Math.abs(this.way*this.maxFrames - 2);
        this.sprite.tl.moveY(415, 7);
      },
      animationAttackHand: function() {
        game.assets['s/slap1.mp3'].play();
        this.sprite.frame = Math.abs(this.way*this.maxFrames - 4);
      },
      animationAttackFoot: function() {
        game.assets['s/kick2.mp3'].play();
        this.sprite.frame = Math.abs(this.way*this.maxFrames - 3);
      },
      animationBlock: function() {
        this.sprite.frame = Math.abs(this.way*this.maxFrames - 5);
      }
    }
  }
};

function titleScene(cb) {
  var scene = new Scene();
  
  scene.backgroundColor = '000';

  var bg = new Sprite(1136, 640);
  bg.image = game.assets['titlebg1.png'];
  
  bg.opacity = 0;
  
  var aD = 0
  bg.addEventListener('enterframe', function(e) {
      aD += e.elapsed;
      if (aD >= 500) {
        bg.opacity += 0.2;
        aD = 0;
      }
    });

  scene.addChild(bg);
  game.pushScene(scene);
  game.assets['s/intro.mp3'].play();

  setTimeout(function(){
    var press = new Sprite(371, 30);
    press.image = game.assets['press_start.png'];
    press.x = 380;
    press.y = 480;
  
    var aD = 0
    press.addEventListener('enterframe', function(e) {
      aD += e.elapsed;
      if (aD >= 500) {
        if(press.opacity === 1) {
          press.opacity = 0;
        } else {
          press.opacity = 1;
        }
        aD = 0;
      }
    });

    scene.addChild(press);

    gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
      if(e.control === 'START') {
        game.popScene();
        gamepad.unbind(Gamepad.Event.BUTTON_DOWN);
        cb();
      }
    });
  }, 3000);
  
}

game.onload = function () {
  titleScene(function() {

    var bgm = game.assets['s/mk.mp3'].play();

    var scene = new Scene();

    console.log(scene);  
    var bg = new Sprite(1136, 640);
    bg.image = game.assets['bg.jpg'];
    
    playersParams = [
      {
        scH: 83,
        scW: 67,
        scImg: game.assets['ryu.png'],
        scX: 300,
        way: 0,
        frames: 12,
      },
      {
        scH: 91,
        scW: 66,
        scImg: game.assets['rick.png'],
        scX: 800,
        way: 1,
        frames: 12,
      }
    ]

    scene.addChild(bg);
    window.players = [];
    for (pad in gamepad.gamepads) {
      var params = playersParams[pad];
      params.pad = pad;
      params.gamepad = gamepad;
      params.scene = scene;

      var player = Character.init(params);
      players.push(player.create());
    }

    gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
      var player = null;

      for (k in players) {
        if (e.gamepad.id === players[k].pad.id) {
          player = k;
          break;
        }
      }

      if (player === null) {
        console.log(e);
        return false;
      }

      switch (e.control) {
        case 'DPAD_RIGHT':
          players[player].moveState = 'right';
        break;

        case 'DPAD_LEFT':
          players[player].moveState = 'left';
        break;

        case 'A':
          if (!players[player].attack && !players[player].jump) {
            players[player].action = 'jump';
          }
        break;

        case 'X':
          if (!players[player].attack) {
            players[player].action = 'attackHand';
          }
        break;

        case 'Y':
          if (!players[player].attack) {
            players[player].action = 'attackFoot';
          }
        break;

        case 'B':
          if (!players[player].attack && !players[player].jump) {
            players[player].action = 'block';
          }
        break;
      }

    });

    gamepad.bind(Gamepad.Event.BUTTON_UP, function(e) {
      var player = null;
      for (k in players) {
        if (e.gamepad.id === players[k].pad.id) {
          player = k;
          break;
        }
      }

      if (player === null) {
        console.log(e);
        return false;
      }

      switch (e.control) {
        case 'DPAD_RIGHT':
        case 'DPAD_LEFT':
          players[player].moveState = false;
        break;

        case 'B':
          if (!players[player].attack) {
            players[player].action = 'unblock';
          }
        break;
      }
    });

    game.pushScene(scene);
  });
  
};

game.start();