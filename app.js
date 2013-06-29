var gamepad = new Gamepad();
gamepad.init();

enchant();
var game = new Game(1136, 640);
game.preload(['ground2.png', 'titlebg.png','bg.jpg', 'pl4.png', 'ryu2.png', 'troll.jpg', 's/kick2.mp3', 's/slap1.mp3', 's/jump1.mp3', 's/intro.mp3', 's/mk.mp3']);

var Character = {

  init: function(pad, gamepad, scene) {

    return {
      pad: gamepad.gamepads[pad],
      gamepad: gamepad,
      scene: scene,

      create: function() {
        console.log(this);
        this.sprite = new Sprite(67, 83);
        this.sprite.image = game.assets['ryu2.png'];
        this.sprite.scale(2, 2);
        this.sprite.y = 415;
        this.sprite.x = 30;
        this.animationDuration = 0;
        this.speed = 10;
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

            default:
              player.actionMove();
              player.actionDefault(e);
          }

        });

        return this;
      },
      
      actionDefault: function(e) {
        this.animationStand(e);
      },

      actionMove: function() {
        switch (this.moveState) {
          case 'right':
            if (this.sprite.x < 1072) {
              this.sprite.x += 10;
            }
          break;

          case 'left':
            if (this.sprite.x > 0) {
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
            console.log(player);
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
          this.sprite.frame = (this.sprite.frame + 1) % 2;
          this.animationDuration = 0;
        }
      },
      animationJump: function() {
        game.assets['s/jump1.mp3'].play();
        this.sprite.tl.moveY(275, 7);
        this.sprite.frame = 2;
        this.sprite.tl.moveY(415, 7);
      },
      animationAttackHand: function() {
        game.assets['s/slap1.mp3'].play();
        this.action = 'attackHand';
        this.sprite.frame = 4;
      },
      animationAttackFoot: function() {
        game.assets['s/kick2.mp3'].play();
        this.action = 'attackFoot';
        this.sprite.frame = 3;
      }
    }
  }
};

function titleScene(cb) {
  var scene = new Scene();
  
  scene.backgroundColor = '000';

  var bg = new Sprite(1136, 640);
  bg.image = game.assets['titlebg.png'];
  
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
    var label2 = new Label('Press START Button');
    label2.width = '1136';
    label2.y = '48';
    label2.color = 'fff';
    label2.font = '40px monospace';
    label2.textAlign = 'center';
    var aD = 0;
    label2.addEventListener('enterframe', function(e) {
      aD += e.elapsed;
      if (aD >= 500) {
        if(label2.color === 'fff') {
          label2.color = '000';
        } else {
          label2.color = 'fff';
        }
        aD = 0;
      }
    });

    scene.addChild(label2);

    var label = new Label('Use gamepad for the best user experience!');
    label.width = '1136';
    label.y = '55';
    label.color = '#fff';
    label.font = '40px monospace';
    label.textAlign = 'center';
    scene.addChild(label);
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
    
    scene.addChild(bg);
    window.players = [];
    for (pad in gamepad.gamepads) {
      var player = Character.init(pad, gamepad, scene);
      players.push(player.create());
    }

    gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
      var player = null;
      for (k in players) {
        if (e.gamepad.id === players[k].pad.id) {
          player = players[k];
          break;
        }
      }

      if (player === null) {
        console.log(e);
        return false;
      }

      switch (e.control) {
        case 'DPAD_RIGHT':
          player.moveState = 'right';
        break;

        case 'DPAD_LEFT':
          player.moveState = 'left';
        break;

        case 'A':
          if (!player.attack && !player.jump) {
            player.action = 'jump';
          }
        break;

        case 'X':
          if (!player.attack) {
            player.action = 'attackHand';
          }
        break;

        case 'Y':
          if (!player.attack) {
            player.action = 'attackFoot';
          }
        break;
      }

    });

    gamepad.bind(Gamepad.Event.BUTTON_UP, function(e) {
      var player = null;
      for (k in players) {
        if (e.gamepad.id === players[k].pad.id) {
          player = players[k];
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
          player.moveState = false;
        break;
      }
    });

    game.pushScene(scene);
  });
  
};

game.start();