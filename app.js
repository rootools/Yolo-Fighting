var gamepad = new Gamepad();
gamepad.init();

enchant();
var game = new Game(1136, 640);

game.preload(['ground2.png', 'titlebg1.png', 'press_start.png','bg.jpg', 'pl4.png', 'ryu.png', 'rick.png', 'troll.jpg', 'andrew.png', 'const.png', 'bar.png', 'python.png', 'ruby.png', 'vislov.png', 'github.png', 'eyes.png', 'noses.png', 'chins.png']);
game.preload(['s/kick2.mp3', 's/slap1.mp3', 's/jump1.mp3', 's/intro.mp3', 's/mk.mp3', 's/block.mp3', 's/death.mp3', 's/toasty.mp3', 's/nyan.mp3']);


var Character = {

  init: function(params) {

    return {
      pad: params.gamepad.gamepads[params.pad],
      gamepad: params.gamepad,
      scene: params.scene,
      sprite: null,
      block: false,
      jump: false,
      attack: false,
      attacked: false,
      isAttacked: false,
      isDead: false,
      specialUnit: null,

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
        this.action = 'run';
        this.HP = 100;
        this.hpLabel = new Label(this.HP);
        this.hpLabel.x = params.hpLabelX;
        this.hpLabel.y = params.hpLabelY;
        this.hpLabel.font = '30px bold';
        this.avatar = new Sprite(150, 150);
        this.avatar.image = params.avatar;
        this.avatar.x = params.avatarX;
        this.HPbar = new Sprite(340, 50);
        this.HPbar.image = game.assets['bar.png'];
        this.HPbar.x = params.HPbarX;
        this.HPbar.max = 312;
        this.HPbarInner = new Sprite(312, 24);
        this.HPbarInner.image = new Surface(312, 24);
        this.HPbarInner.image.context.fillStyle = '#FF0000';
        this.HPbarInner.image.context.fillRect(0, 0, 312, 24);
        this.HPbar.startX = params.HPbarInnerX;
        this.HPbarInner.x = params.HPbarInnerX;
        this.HPbarInner.y = 13;
        this.HPbarInvert = params.HPbarInvert;
        this.specialUnit = new Sprite(params.specialW, params.specialH);
        this.specialUnit.y = params.specialY;
        this.specialUnit.image = params.specialImg;
        this.specialUnit.scale(2, 2);
        this.specialUnit.specialLock = false;
        this.specialUnit.specialLockTime = 0;
        this.specialUnit.specialLockBaseTime = 5000;

        this.scene.addChild(this.HPbar);
        this.scene.addChild(this.HPbarInner);
        this.scene.addChild(this.sprite);
        this.scene.addChild(this.hpLabel);
        this.scene.addChild(this.avatar);

        var player = this;
        this.sprite.addEventListener('enterframe', function(e) {

          if (player.isDead) {
            return false;
          }

          if (player.heDead) {
            player.action = 'complete';
          }

          if (player.specialUnit.specialLock) {
            player.specialUnit.specialLockTime += e.elapsed;
            if (player.specialUnit.specialLockTime > player.specialUnit.specialLockBaseTime) {
              player.specialUnit.specialLock = false;
              player.specialUnit.specialLockTime = 0;
            }
          }

          switch (player.action) {
            case 'jump':
              player.actionMove();
              player.actionJump();
            break;

            case 'attackHand':
              player.actionAttackHand();
            break;

            case 'attackMegaHand':
              player.actionAttackMegaHand();
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

            case 'complete':
              player.animationDance();
              gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
                if(e.control === 'BACK') {
                  game.popScene();
                  gamepad.unbind(Gamepad.Event.BUTTON_DOWN);
                  creditsScene();
                }
              });
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

        for (k in players) {
          if (players[k].pad.id !== this.pad.id) {
            this.heDead = players[k].isDead;
          }
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
            this.way = (this.sprite.x > players[k].sprite.x) ? 1 : 0;
            this.deltaWay = Math.abs(this.sprite.x - players[k].sprite.x) - this.sprite.width/2 - players[k].sprite.width/2;
          }
        }

        switch (this.moveState) {
          case 'right':
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
            player.animationJumpDown();
            player.action = player.moveState ? 'run' : 'stop';
          }, 400);
        
          this.animationJumpUp();
        }
      },
      
      actionAttackHand: function() {
        if (!this.attack && !this.attacked) {
          this.attack = true;

          var player = this;
          setTimeout(function(){
            player.animationUnAttack();
            setTimeout(function(){
              player.attack = false;
              player.action = player.moveState ? 'run' : 'stop';
            }, 50);
          }, 300);

          for (k in players) {
            if (players[k].pad.id !== this.pad.id) {
              this.deltaX = Math.abs(this.sprite.x - players[k].sprite.x) - this.sprite.width/2 - players[k].sprite.width/2;
              this.deltaY = Math.abs(this.sprite.y - players[k].sprite.y);
              this.heBlock = players[k].block;
              this.heAttack = players[k].attack;
              this.heJump = players[k].jump;
              this.heDead = players[k].isDead;

              if (this.deltaX < 20 && this.deltaY < 20 && (!this.heBlock || this.heJump) && !this.heDead) {
                players[k].actionAttacked(4);
                this.isAttacked = true;
              } else {
                this.isAttacked = false;
              }
            }
          }

          this.animationAttackHand();
        }
      },

      actionAttackMegaHand: function() {
        if (!this.attack && !this.attacked) {
          this.attack = true;
          this.specialUnit.specialLock = true;

          var _this = this;
          setTimeout(function(){
            _this.animationUnAttack();
            setTimeout(function(){
              _this.attack = false;
              _this.action = _this.moveState ? 'run' : 'stop';
            }, 50);
          }, 800);

          for (k in players) {
            if (players[k].pad.id !== this.pad.id) {
              this.deltaX = Math.abs(this.sprite.x - players[k].sprite.x) - this.sprite.width/2 - players[k].sprite.width/2;
              this.deltaY = Math.abs(this.sprite.y - players[k].sprite.y);
              this.heBlock = players[k].block;
              this.heAttack = players[k].attack;
              this.heJump = players[k].jump;
              this.heDead = players[k].isDead;

              var player = players[k];
              var specFrame1 = Math.abs(this.way*3);
              var specFrame2 = Math.abs(this.way*3 - 1);

              this.animationSpecialAttack(player);

              this.specialUnit.actSpecialAttackListener = function(e) {
                actSpecialAttack(this, player, specFrame1, specFrame2, e);
              };

              this.specialUnit.addEventListener('enterframe', this.specialUnit.actSpecialAttackListener);
            }
          }

        }
      },

      actionAttackFoot: function() {
        if (!this.attack) {
          this.attack = true;

          var player = this;
          setTimeout(function(){
            player.animationUnAttack();
            setTimeout(function(){
              player.attack = false;
              player.action = player.moveState ? 'run' : 'stop';
            }, 50);
          }, 450);

          for (k in players) {
            if (players[k].pad.id !== this.pad.id) {
              this.deltaWay = Math.abs(this.sprite.x - players[k].sprite.x) - this.sprite.width/2 - players[k].sprite.width/2;
              this.deltaY = Math.abs(this.sprite.y - players[k].sprite.y);
              this.heBlock = players[k].block;
              this.heAttack = players[k].attack;
              this.heJump = players[k].jump;
              this.heDead = players[k].isDead;

              if (this.deltaWay < 20 && this.deltaY < 40 && (!this.heBlock || this.heJump) && !this.heDead) {
                players[k].actionAttacked(8);
                this.isAttacked = true;
              } else {
                this.isAttacked = false;
              }
            }
          }

          this.animationAttackFoot();
        }
      },

      actionAttacked: function(deltaHP) {
        if (!this.attacked) {
          this.attacked = true;
          this.HP -= deltaHP;

          if (this.HP <= 0) {
            this.HP = 0;
            this.isDead = true;
          }

          this.hpLabel.text = this.HP;

          if (!this.isDead) {
            var player = this;
            setTimeout(function(){
              player.avatar.frame = 0;
              player.attacked = false;
              player.action = player.moveState ? 'run' : 'stop';
            }, 200);

            this.animationAttacked();
          } else {
            this.animationDead();
          }
        }
      },

      animationSpecialAttack: function(player) {
        if (this.isAttacked) {
          this.avatar.frame = 1;
          game.assets['s/slap1.mp3'].play();
        }
        this.sprite.frame = Math.abs(this.way*this.maxFrames - 6);

        this.specialUnit.removeEventListener('enterframe', this.specialUnit.actSpecialAttackListener);
        this.scene.removeChild(this.specialUnit);

        this.specialUnit.x = this.sprite.x + (-this.way) * this.sprite.width + this.sprite.width/2 + (-this.way) * this.specialUnit.width + this.specialUnit.width/2;
        this.specialUnit.frame = Math.abs(this.way*3);
        this.scene.addChild(this.specialUnit);

        this.specialUnit.tl.clear();
        if (this.way) {
          this.specialUnit.tl.moveX(0, 75);
        } else {
          this.specialUnit.tl.moveX(1136, 75);
        }
      },

      animationStand: function(e) {
        this.animationDuration += e ? e.elapsed : 50;
        var runFrame = this.moveState ? 8 : 0;
        if ((!this.moveState && this.animationDuration >= 250) || (this.moveState && this.animationDuration >= 100)) {
          this.sprite.frameParity = (this.sprite.frameParity + 1) % 2 + runFrame;
          this.sprite.frame = Math.abs(this.way*this.maxFrames - this.sprite.frameParity);
          this.animationDuration = 0;
        }
      },
      animationJumpUp: function() {
        game.assets['s/jump1.mp3'].play();
        this.sprite.tl.moveY(175, 15);
        this.sprite.frame = Math.abs(this.way*this.maxFrames - 2);
      },
      animationJumpDown: function() {
        this.sprite.tl.moveY(415, 15);
      },
      animationAttackHand: function() {
        if (this.isAttacked) {
          this.avatar.frame = 1;
          game.assets['s/slap1.mp3'].play();
        } else if (this.heBlock) {
          game.assets['s/block.mp3'].play();
        }
        this.sprite.frame = Math.abs(this.way*this.maxFrames - 4);
      },
      animationAttackFoot: function() {
        if (this.isAttacked) {
          this.avatar.frame = 1;
          game.assets['s/kick2.mp3'].play();
        } else if (this.heBlock) {
          game.assets['s/block.mp3'].play();
        }
        this.sprite.frame = Math.abs(this.way*this.maxFrames - 3);
      },
      animationUnAttack: function() {
        this.avatar.frame = 0;
        if (this.isDead) {
          this.animationDead();
        } else if (this.jump) {
          this.sprite.frame = Math.abs(this.way*this.maxFrames - 2);
        } else if (this.block) {
          this.animationBlock();
        } else if (this.attacked) {
          this.animationAttacked();
        } else if (this.moveState) {
          this.animationStand();
        } else {
          this.animationStand();
        }
        
      },
      animationBlock: function() {
        this.sprite.frame = Math.abs(this.way*this.maxFrames - 5);
      },
      animationAttacked: function() {
        game.assets['s/slap1.mp3'].play();
        this.avatar.frame = 2;
        this.sprite.frame = Math.abs(this.way*this.maxFrames - 7);

        this.HPbarInner.image.context.clearRect(0, 0, this.HPbar.max, 24);
        this.HPbarInner.image.context.fillRect(0, 0, (this.HPbar.max * this.HP / 100), 24);
        if (this.HPbarInvert) {
          this.HPbarInner.x = this.HPbar.startX + this.HPbar.max - (this.HPbar.max * this.HP / 100);
        }
      },

      animationDead: function() {
        game.assets['s/death.mp3'].play();
        this.avatar.frame = 3;
        this.sprite.frame = Math.abs(this.way*this.maxFrames - 10);

        this.HPbarInner.image.context.clearRect(0, 0, this.HPbar.max, 24);
        this.HPbarInner.image.context.fillRect(0, 0, (this.HPbar.max * this.HP / 100), 24);
        if (this.HPbarInvert) {
          this.HPbarInner.x = this.HPbar.startX + this.HPbar.max - (this.HPbar.max * this.HP / 100);
        }
      },
      animationDance: function() {
        if (!this.sprite.danced) {
          this.sprite.danced = true;

          this.sprite.frameSetDance = [
            0, 1, 5, 21, 20, 16, 0, 1, 5, 21, 20, 16, 0, 1, 5, 21, 20, 16,
  //          6, 6, 7, 15, 15, 14,
          ];

          window.time = 0;
          this.sprite.addEventListener('enterframe', frameDancing);
        }
      },
    }
  }
};

window.frameDancing = function (e) {
  time += e.elapsed;
  var delay = 150;
  var t = time - (time % delay);
  this.frame = this.frameSetDance[t/delay];
  if (this.frameSetDance.length-1 <= t/delay) {
    this.danced = false;
    this.removeEventListener('enterframe',frameDancing);
  }
}

window.actSpecialAttack = function (specialUnit, player, specFrame1, specFrame2, e) {
  if (!specialUnit.elapsed) {
    specialUnit.elapsed = 0;
  }
  specialUnit.elapsed += e.elapsed;
  if (specialUnit.elapsed > 140) {
    specialUnit.parity = specialUnit.parity ? 0 : 1;
    specialUnit.frame = specialUnit.parity ? specFrame1 : specFrame2;
    specialUnit.elapsed = 0;
  }
  var specialEnd = false;
  if (specialUnit.x < player.sprite.x) {
    var playerX = player.sprite.x;
    var specialUnitX = specialUnit.x + specialUnit.width;
    var playerY = player.sprite.y + player.sprite.height;
    var specialUnitY = specialUnit.y;
    if (playerX - specialUnitX < 1 && playerX - specialUnitX > -specialUnit.width && specialUnitY - playerY < 1 && specialUnitY - playerY > -player.sprite.height) {
      player.actionAttacked(24);
      specialEnd = true;
    }
  } else {
    var playerX = player.sprite.x + player.sprite.width;
    var specialUnitX = specialUnit.x;
    var playerY = player.sprite.y + player.sprite.height;
    var specialUnitY = specialUnit.y;

    if (specialUnitX - playerX < 1 && specialUnitX - playerX > -specialUnit.width && specialUnitY - playerY < 1 && specialUnitY - playerY > -player.sprite.height) {
      player.actionAttacked(24);
      specialEnd = true;
    }
  }

  if (specialUnit.x <= 0 || specialUnit.x >= 1136) {
    specialEnd = true;
  }

  if (specialEnd) {
    specialUnit.removeEventListener('enterframe', specialUnit.actSpecialAttackListener);

    player.scene.removeChild(specialUnit);
  }
}

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

function creditsScene() {
  game.assets['s/mk.mp3'].stop();
  var scene = new Scene();
  game.assets['s/nyan.mp3'].play();

  var gh = new Sprite(1000, 50);
  gh.image = game.assets['github.png'];
  gh.x = 1200;
  gh.y = 550;
  
  var i1 = new Sprite(433, 350);
  var i2 = new Sprite(433, 98);
  var i3 = new Sprite(433, 215);

  i1.image = game.assets['eyes.png'];
  i2.image = game.assets['noses.png'];
  i3.image = game.assets['chins.png'];
  i2.y = 350;
  i3.y = 448;
  i1.x = 350;
  i2.x = 350;
  i3.x = 350;


  i1.frame = 0;
  i2.frame = 1;
  i3.frame = 2;

  scene.backgroundColor = '000';
  scene.addChild(i1);
  scene.addChild(i2);
  scene.addChild(i3);
  scene.addChild(gh);
  game.pushScene(scene);

  var aD = 0;
  var bD = 0;
  gh.addEventListener('enterframe', function(e) {
    aD += e.elapsed;
      if (aD >= 100) {
        
        gh.x -= 10;
        aD = 0;
        if(gh.x <= -1010 ) {
          gh.x = 1200;
        }
      }
  });

  i1.addEventListener('enterframe', function(e) {
    
    bD += e.elapsed;
      if (bD >= 390) {
        i1.frame += 1;
        i2.frame += 1;
        i3.frame += 1;
        bD = 0;
      }
  });

}

game.onload = function () {

  var fightStart = function() {

    game.assets['s/mk.mp3'].play();

    var scene = new Scene();

    var bg = new Sprite(1136, 640);
    bg.image = game.assets['bg.jpg'];

    playersParams = [
      {
        scH: 83,
        scW: 67,
        scImg: game.assets['ryu.png'],
        scX: 300,
        way: 0,
        frames: 22,
        hpLabelX: 30,
        hpLabelY: 30,
        avatar: game.assets['andrew.png'],
        avatarX: 0,
        HPbarX: 150,
        HPbarInnerX: 164,
        HPbarInvert: false,
        specialImg: game.assets['ruby.png'],
        specialY: 450,
        specialW: 34,
        specialH: 24,
      },
      {
        scH: 91,
        scW: 66,
        scImg: game.assets['rick.png'],
        scX: 800,
        way: 1,
        frames: 22,
        hpLabelX: 1030,
        hpLabelY: 30,
        avatar: game.assets['const.png'],
        avatarX: 985,
        HPbarX: 645,
        HPbarInnerX: 659,
        HPbarInvert: true,
        specialImg: game.assets['python.png'],
        specialY: 490,
        specialW: 28,
        specialH: 24,
      }
    ];

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

      if (player === null || players[player].attacked || players[player].isDead) {
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

        case 'RB':
          if (!players[player].attack && !players[player].jump && !players[player].specialUnit.specialLock) {
            players[player].action = 'attackMegaHand';
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

    setTimeout(function() {
      gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
        
        if(e.control === 'START') {
          game.popScene();
          gamepad.unbind(Gamepad.Event.BUTTON_DOWN);
          fightStart();
        }
      });
    }, 500);
  
    var vislov = new Sprite(350, 350);
    vislov.image = game.assets['vislov.png'];
    vislov.x = 800;
    vislov.y = 750;
      
    scene.addChild(vislov);

    setTimeout(function(){
      
      vislov.tl.rotateBy(-30, 1);;
      game.assets['s/toasty.mp3'].play();
      vislov.tl.moveY(360, 5);
      setTimeout(function(){
        vislov.tl.moveY(750, 3);
      }, 2000);
    }, 25000);

  };
  
  titleScene(fightStart);

};

game.start();