//use of ! is equal part for excitement and bookmarking

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

PhaserGame = {
  ////////////////////PRELOAD////////////////////////
  preload: function() {
    this.load.image('background', 'assets/props/bgnight.png');
    this.load.spritesheet('player', 'assets/cat/nyancat.png', 61, 28);
    this.load.image('beam', 'assets/props/beam.png');
    this.load.image('bullet', 'assets/props/bullet.png');
    this.load.spritesheet('nyantail', 'assets/cat/tail.png', 38, 28);
    this.load.spritesheet('magusEnemy', 'assets/bogeys/mages.png', 19, 18);
    this.load.spritesheet('bombEnemy', 'assets/bogeys/bombs.png', 18, 18);
    this.load.spritesheet('explosion', 'assets/props/explosion.png', 94, 94)
  },

  ////////////////////CREATE////////////////////////
  create: function()  {
    //create the background
    this.background = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
    this.background.autoScroll(-80, 0);

    //create nyan-cat
    this.player = this.add.sprite(64, 220, 'player');
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.anchor.setTo(0.5, 0.5);
    this.player.animations.add('wiggle', [0, 1, 2, 3, 4], 10, true);
    this.player.animations.play('wiggle')
    this.player.speed = 300; //player initial speed
    this.player.body.collideWorldBounds = true; //make it so player cant go outside edge** for now..

//grouping is necessary to adhere to memory leaks and reuse sprites, for time & memory, as well as giving it all properties

    this.tailPool = this.add.group();
    this.tailPool.enableBody = true;
    this.tailPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.tailPool.createMultiple(50, 'nyantail');
    this.tailPool.setAll('anchor.x', 0.5);
    this.tailPool.setAll('anchor.y', 0.5);
    this.tailPool.setAll('outOfBoundsKill', true);
    this.tailPool.setAll('checkWorldBounds', true);

    //nyan-cat pew pew
    this.beamPool = this.add.group();
    this.beamPool.enableBody = true;
    this.beamPool.physicsBodyType = Phaser.Physics.ARCADE;
    //limit to only 100 beams on screen at once
    this.beamPool.createMultiple(100, 'beam');
    this.beamPool.setAll('anchor.x', 0.5);
    this.beamPool.setAll('anchor.y',0.5);
    // Automatically kill the bullet sprites when they go out of bounds
    this.beamPool.setAll('outOfBoundsKill', true);
    this.beamPool.setAll('checkWorldBounds', true);
    this.nextFire = 0;
    this.shotDelay = 200; //SHOOTINGRATE! use this for powerup etc

    this.cursors = this.input.keyboard.createCursorKeys(); //this is a-conveniene function built-in with phaser <3

    //create enemies
    // this.enemy = this.add.sprite(500,220, 'magusEnemy');
    // this.enemy.anchor.setTo(0.5,   0.5);
    // this.physics.enable(this.enemy, Phaser.Physics.ARCADE);
    // this.enemy.animations.add('mageMovement', [0, 1, 9], 5, true);
    // this.enemy.animations.play('mageMovement')

    this.enemyPool = this.add.group();
    this.enemyPool.enableBody = true;
    this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyPool.createMultiple(50, 'magusEnemy');
    this.enemyPool.setAll('anchor.x', 0.5)
    this.enemyPool.setAll('anchor.y', 0.5)
    this.enemyPool.setAll('outOfBoundsKill', true);
    this.enemyPool.setAll('checkWorldBounds', true);

    this.enemyPool.forEach(function (enemy){
      enemy.animations.add('mageMovement', [0, 1, 9], 5, true);
    });

    this.nextEnemyAt = 0;
    this.enemyDelay = 1000;

    //enemy bullet
    this.bullet = this.add.sprite(470, 180,'bullet')
    this.bullet.anchor.setTo(0.5,0.5)
    this.physics.enable(this.bullet, Phaser.Physics.ARCADE);
    this.bullet.body.velocity.x = -500;






    //instructions message
    this.instructions = this.add.text(400,550,
    'Use the arrow keys to move nyan-cat\n'+
    'and Space to pew-pew',
    {font: '20px monospace', fill: '#fff', align: 'center'});
    this.instructions.anchor.setTo(0.5, 0.5);
    this.instExpire = this.time.now + 6000;
  },



  ////////////////////UPDATE////////////////////////
  update: function() {

    if (this.nextEnemyAt < this.time.now && this.enemyPool.countDead() > 0) {
      this.nextEnemyAt = this.time.now + this.enemyDelay;
      var enemy = this.enemyPool.getFirstExists(false);
      // spawn at a random location, right of the screen
      enemy.reset(700,this.rnd.integerInRange (0, 600));
      // also randomize the speed
      enemy.body.velocity.x = -this.rnd.integerInRange(30, 80);
      enemy.play('mageMovement');
    }
    //U.PHYSICS!
    this.physics.arcade.overlap(
      this.bullet, this.player, this.playerHit, null, this
    );

    this.physics.arcade.overlap(
      this.beamPool, this.enemyPool, this.enemyHit, null, this
    )

    //nyan-cat pew-pew
    if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
      this.fire();
    }
    //nyan tail
      this.maketail();

    //player movement!
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;

    if (this.cursors.left.isDown) {
      this.player.body.velocity.x = -this.player.speed;
    } else if (this.cursors.right.isDown) {
      this.player.body.velocity.x = this.player.speed;
    }

    if (this.cursors.up.isDown) {
      this.player.body.velocity.y = -this.player.speed;
    } else if (this.cursors.down.isDown) {
      this.player.body.velocity.y = this.player.speed;
    }

    if (this.instructions.exists && this.time.now > this.instExpire) {
    this.instructions.destroy();
    }
},



  //check hitbox!
  render: function() {
    // this.game.debug.body(this.bullet);
    // this.game.debug.body(this.enemy);
    // this.game.debug.body(this.player);
  },
  //collisions!
  playerHit: function (bullet, player) {
    bullet.kill();
    player.kill();
    var explosion = this.add.sprite(player.x, player.y, 'explosion');
    explosion.anchor.setTo(0.5, 0.5);
    explosion.animations.add('boom', [0,1,2,3,4,5,6,7,8,9,10,11]);
    explosion.play('boom', 15, false, true);
  },
  enemyHit: function (beam, enemy) {
    beam.kill();
    enemy.kill();
    var explosion = this.add.sprite(enemy.x, enemy.y, 'explosion');
    explosion.anchor.setTo(0.5, 0.5);
    explosion.animations.add('boom', [0,1,2,3,4,5,6,7,8,9,10,11]);
    explosion.play('boom', 15, false, true);
  },
  fire: function()  {
    if (this.time.now < this.nextFire) { //similar to set timeout, if this time now is less than the cooldown (function below), FIRE!
      return;
    }
    if (this.beamPool.countDead() === 0)  {
      return;
    }
    this.nextFire = this.time.now + this.shotDelay;

    var beam = this.beamPool.getFirstExists(false);

    beam.reset(this.player.x+70, this.player.y);
    beam.body.velocity.x = 500;
  },
  maketail: function() {
    if (this.tailPool.countDead() === 0) {
      return;
    }
    var tail = this.tailPool.getFirstExists(false);
    tail.reset(this.player.x-35, this.player.y);
    tail.body.velocity.x = -700;

    //MEANINGLESS ANIMATION
    // tail.animations.add('makerainbowwiggle', [0,1], 30, true);

   },

};
//end
game.state.add('Game', PhaserGame, true);
