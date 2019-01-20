// import './styles/site.css'
// const SuitcaseImage = require('./assets/suitcase.png')
// const BorderImage = require('./assets/border.png')
// const ScannerImage = require('./assets/scanner.png')
// const AirportMapImage = require('./assets/airport-map.png')
// const BackgroundImage = require('./assets/checkin-background.png')

// var game = new Phaser.Game(896, 640, Phaser.AUTO, 'test', null, true, false);

// var BasicGame = function (game) { };

// BasicGame.Boot = function (game) { };

// var isoGroup, overlapGroup, player, suitcases;

// var tileMap = [
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
//     [0, 0, 1, 0, 0, 2, 0, 0, 0, 1, 0, 0, 1, 0],
//     [0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
//   ];

// function SuitcaseBehaviour(suitcaseSprite) {

//     const STATUS_NEW = 0;
//     const STATUS_ROUTING = 1;
//     const STATUS_ROUTED = 2;

//     this.status = STATUS_NEW;
//     this.processArea = 0;

//     this.update = function() {

//         if (this.status == STATUS_NEW) {

//             //suitcaseSprite.body.velocity.y = 100;

//             // if (suitcaseSprite.body.velocity.y == 0) {
//             //     console.log('stopped'); 
//             // }

// //            console.log(suitcaseSprite.body.y);

//             if (suitcaseSprite.body.hitTest(544, 290))
//             {
//                 this.status = STATUS_ROUTING;

//                 suitcaseSprite.body.velocity.y = 0;
//                 suitcaseSprite.body.immovable = true;

//                 setTimeout(() => {
//                     this.processArea = game.rnd.integerInRange(1, 2);
//                 }, 10);
//             }
//         }
//         else if (this.status == STATUS_ROUTING) {




//             if (this.processArea != 0) {
//                 this.status = STATUS_ROUTED;
//                 suitcaseSprite.body.immovable = false;
//                 suitcaseSprite.body.velocity.x = (this.processArea == 1 ? 100 : -100);
//                 //suitcaseSprite.body.velocity.y = 100;    
//             }
//         }
//             // else if (suitcase.body.velocity.x != 0 && suitcase.body.x > 200)
//             // {
//             //     suitcase.body.velocity.x = 0;
//             // }

//             // game.physics.isoArcade.overlap(suitcase, this.scanner, function(e){
//             // });

//             if (suitcaseSprite.body.hitTest(550, 150))
//             {
//                 suitcaseSprite.body.velocity.x = 0;
//                 suitcaseSprite.body.velocity.y = 100; 
//             }
//     }
// }


// BasicGame.Boot.prototype =
// {
//     preload: function () {

//         // Load assets.
//         game.load.image('border', BorderImage);
//         game.load.image('suitcase', SuitcaseImage);
//         game.load.image('scanner', ScannerImage);
//         game.load.image('background', BackgroundImage);

// //        game.debug.renderShadow = false;
// //        game.stage.disableVisibilityChange = true;
// //        game.time.advancedTiming = true;

//         // Add and enable the plug-in.
// //        game.plugins.add(new Phaser.Plugin.Isometric(game));

// //        game.world.setBounds(0, 0, 1024, 768);

//         // Start the IsoArcade physics system.
// //        game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);

//         // Center the world on the screen.
// //        game.iso.anchor.setTo(0.5, 0.2);

//         suitcases = [];                
//     },
//     create: function () {

//         game.physics.startSystem(Phaser.Physics.ARCADE);

//         game.world.setBounds(0, 0, 896, 640);

//         game.add.sprite(0, 0, 'background');



//         // Create a group for our tiles, so we can use Group.sort
//         isoGroup = game.add.group();
// //        overlapGroup = game.add.group();

//         var wall = game.add.sprite(312, 298, '', 0, isoGroup);
//         wall.width = 600; 
//         game.physics.arcade.enable(wall);
//         //wall.body.width = 600;
//         wall.body.immovable = true;
//         wall.collideWorldBounds = true;
//         //pausePlatform.allowGravity = false;


//         // isoGroup.enableBody = true;
//         // isoGroup.physicsBodyType = Phaser.Plugin.Isometric.ISOARCADE;

//         // Set the global gravity for IsoArcade.
// //        game.physics.isoArcade.gravity.setTo(0, 0, -500);

//         // for (var xx = 0; xx < 256; xx += 38) {
//         //     this.addSprite(xx, 0, 0, 'cube');
//         // }

//         // for (var yy = 0; yy < 360; yy += 35) {
//         //     this.addSprite(0, yy, 0, 'cube');
//         // }

//         // this.addSprite(124, 200, 0, 'border');
//         // this.addSprite(200, 200, 0, 'cube');
//         // this.addSprite(238, 200, 0, 'border');

//         // Let's make a load of cubes on a grid, but do it back-to-front so they get added out of order.
//         // var cube;
//         // for (var xx = 256; xx > 0; xx -= 74) {
//         //     for (var yy = 300; yy > 0; yy -= 40) {
//         //         // Create a cube using the new game.add.isoSprite factory method at the specified position.
//         //         // The last parameter is the group you want to add it to (just like game.add.sprite)
//         //         cube = game.add.isoSprite(xx, yy, 0, 'border', 0, isoGroup);
//         //         cube.anchor.set(0.5, 0);                

//         //         // Enable the physics body on this cube.
//         //         game.physics.isoArcade.enable(cube);

//         //         // Collide with the world bounds so it doesn't go falling forever or fly off the screen!
//         //         cube.body.collideWorldBounds = true;
//         //         cube.body.immovable = true;

//         //         // Add a full bounce on the x and y axes, and a bit on the z axis. 
//         //         cube.body.bounce.set(1, 1, 0.2);

//         //         // Add some X and Y drag to make cubes slow down after being pushed.
//         //         cube.body.drag.set(100, 100, 0);
//         //     }
//         // }

// //        this.spawnTiles();
//         this.addSuitcase();

//         // this.scanner = game.add.isoSprite(128, 256, 0, 'cube', 0, overlapGroup);
//         // this.scanner.tint = 0x222222;
//         // this.scanner.anchor.set(0.5);
//         // game.physics.isoArcade.enable(this.scanner);
//         // this.scanner.body.collideWorldBounds = true;
//         // this.scanner.alpha = 0.5;

//         // var block = game.add.isoSprite(128, 296, 0, 'border', 0, isoGroup);
//         // block.tint = 0xFF0000;
//         // block.anchor.set(0.5);
//         // game.physics.isoArcade.enable(block);
//         // block.body.collideWorldBounds = true;
//         // block.body.immovable = true;
//         // block.alpha = 0.5;

//         //  Create our Timer
// //        var timer = game.time.create(false);
// //        timer.loop(1500, () => {
//            //this.addSuitcase();
// //        }, this);
// //        timer.start();

//         // Set up our controls.
// //        this.cursors = game.input.keyboard.createCursorKeys();

// //        this.game.input.keyboard.addKeyCapture([
// //            Phaser.Keyboard.LEFT,
// //            Phaser.Keyboard.RIGHT,
// //            Phaser.Keyboard.UP,
// //            Phaser.Keyboard.DOWN,
// //            Phaser.Keyboard.SPACEBAR
// //        ]);

//         var space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

//         space.onDown.add(function () {
//              this.addSuitcase();
//         //     //player.body.velocity.z = 300;
//         }, this);
//     },
//     update: function () {
//         // Move the player at this speed.
//         var speed = 100;

//         // if (this.cursors.up.isDown) {
//         //     player.body.velocity.y = -speed;
//         // }
//         // else if (this.cursors.down.isDown) {
//         //     player.body.velocity.y = speed;
//         // }
//         // else {
//         //     player.body.velocity.y = 0;
//         // }

//         // if (this.cursors.left.isDown) {
//         //     player.body.velocity.x = -speed;
//         // }
//         // else if (this.cursors.right.isDown) {
//         //     player.body.velocity.x = speed;
//         // }
//         // else {
//         //     player.body.velocity.x = 0;
//         // }

//         // Our collision and sorting code again.
//         game.physics.arcade.collide(isoGroup);
//         //game.iso.topologicalSort(isoGroup);

//         suitcases.forEach(function (suitcase) {
//             suitcase.update();
//         });
//                 //isoGroup.forEach(function (tile) {
// //            game.debug.body(tile, 'rgba(189, 221, 235, 0.6)', false);
//         //});

//         for (var suitcase of suitcases)
//         {
//             suitcase.update();
//         }

//     },
//     render: function () {
//         //isoGroup.forEach(function (tile) {
// //            game.debug.body(tile, 'rgba(189, 221, 235, 0.6)', false);
//         //});
//         game.debug.text(game.time.fps || '--', 2, 14, "#a7aebe");
//     },
//     addSprite: function (x, y, z, name) {

//         var sprite = game.add.isoSprite(x, y, z, name, 0, isoGroup);
//         sprite.anchor.set(0.5, 0);
//         game.physics.isoArcade.enable(sprite);
//         sprite.body.collideWorldBounds = true;

//         return sprite;
//     },
//     addSuitcase: function() {
//         // 50, 200
//         var suitcase = game.add.sprite(544, 0, 'suitcase', 0, isoGroup);
//         suitcase.anchor.set(0.5, 0);
//         game.physics.arcade.enable(suitcase);
// //        suitcase.body.collideWorldBounds = true;
//         suitcase.body.velocity.y = 100; 
//         suitcase.body.bounce.set(0.2);

//         suitcases.push(new SuitcaseBehaviour(suitcase));
//     },
//     callService : async function() {
//         await new Promise(resolve => setTimeout(resolve, 2000));
//     },
//     spawnTiles: function (group) {
//         for (var y = 0; y < tileMap.length; y++) {
//             for (var x = 0; x < tileMap[y].length; x++) {
//                 if (tileMap[y][x] == 1) {
//                     var tile = this.addSprite(x * 38, y * 40, 0, 'cube');
//                     tile.anchor.set(0.5, 0);
// //                    tile.smoothed = false;
// //                    tile.body.immovable = false;
//                 }
//                 console.log(x + " - " + y);
//             }
//         }
//     }
// };

// game.state.add('Boot', BasicGame.Boot);
// game.state.start('Boot');