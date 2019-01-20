import './styles/site.css'
const BorderImage = require('./assets/border.png')
const ScannerImage = require('./assets/scanner.png')
const ScannerImageMetadata = require('./assets/scanner.json')
const ScannerPushImage = require('./assets/scanner-push.png')
const LuggageImage = require('./assets/luggage.png')
const LuggageImageMetadata = require('./assets/luggage.json')
const TravellerImage = require('./assets/traveller.png')
const TravellerImageMetadata = require('./assets/traveller.json')
const ExplosionImage = require('./assets/explosion.png')
const ExplosionImageMetadata = require('./assets/explosion.json')
const CheckInBackgroundImage = require('./assets/checkin-background.png')
const SortBackgroundImage = require('./assets/sort-background.png')
const ScanBackgroundImage = require('./assets/scan-background.png')
const ScannerBeamImage = require('./assets/scanner-beam.png')
const ScannerBeamImageMetadata = require('./assets/scanner-beam.json')

var game = new Phaser.Game(896, 640, Phaser.AUTO, 'test', null, true, false);

var cursors;

var walkingSpeed = 200;
var luggageSpeed = 200;

var BasicGame = function (game) { };

BasicGame.Boot = function (game) { };

var luggageBehaviour, travellerBehaviour;
var luggageGroup, travellerGroup;
var scanners = [];

function LuggageBehaviour() {
    this.update = function(luggage, gameContext) {
        if (!luggage.behaviour) {
            luggage.behaviour = {
                "state": "unsorted"
            };
        }

        if (luggage.behaviour.state == "checkedIn") {
            if (luggage.body.y <= 208) {
                luggage.body.velocity.y = 0;
                luggage.behaviour.state = "unsorted";
            } else {
                luggage.body.velocity.y = -luggageSpeed;
            }
        }        

        if (luggage.behaviour.state == "unsorted") {
            if (luggage.body.x >= 1221) {
                luggage.behaviour.state = "readyForSorting";
            } else {
                luggage.body.velocity.x = luggageSpeed;
            }
        }

        if (luggage.behaviour.state == "readyForSorting") {
            luggage.body.velocity.x = 0;
            luggage.behaviour.state = "sorting";

            // Simulate callback
            setTimeout(() => {
                var result = game.rnd.integerInRange(1, 2);
                if (result == 1) {
                    luggage.body.velocity.x = luggageSpeed;
                    luggage.behaviour.belt = 0;
                } else {
                    luggage.body.velocity.y = luggageSpeed;
                    luggage.behaviour.belt = 1;
                }
                luggage.behaviour.state = "sorted";
            }, 1);

            return;
        }

        if (luggage.behaviour.state == "sorted") {
            if (luggage.body.velocity.y > 0
                && luggage.body.y >= 388) {
                luggage.body.velocity.x = luggageSpeed;
                luggage.body.velocity.y = 0;
            }

            if ((luggage.body.x > 2120 && luggage.body.y < 350)
                || (luggage.body.x > 1928 && luggage.body.y > 350)) {
                luggage.behaviour.state = "readyForScanning";
            }
        }

        if (luggage.behaviour.state == "readyForScanning") {
            luggage.body.velocity.x = 0;
            luggage.behaviour.state = "scanning";

            // Simulate callback
            setTimeout(() => {
                var scanner = scanners[luggage.behaviour.belt];

                var result = game.rnd.integerInRange(1, 2);
                var setLedToOk = (result == 2);

                if (result == 1) {
                    luggage.body.velocity.x = luggageSpeed;
                    luggage.behaviour.state = "approved";
                    scanner.setLedColor(setLedToOk);
                } else {

                    var force = 1;

                    var scanner = scanners[luggage.behaviour.belt];
                    scanner.setLedColor(setLedToOk);
                    scanner.divertLuggage(1000 - (force * 250));

                    luggage.body.velocity.y = -force * luggageSpeed;

                    if (force < 3) {
                        var fadeTween = game.add.tween(luggage).to( { alpha: 0 }, 500 - (force * 200), Phaser.Easing.Linear.None, true);
                        fadeTween.onComplete.add(() => {
                            luggage.destroy();
                        });
                    }

                    luggage.behaviour.state = "diverted";
                }
            }, 100);
        }

        if (luggage.behaviour.state == "diverted") {
            if (luggage.body.y < 80) {
                luggage.behaviour.state = "hitWall";
            }
        }

        if (luggage.behaviour.state == "hitWall") {
            if (!luggage.behaviour.explosionAnimation) {
                luggage.body.velocity.y = 0;
                luggage.behaviour.explosionAnimation = luggage.animations.play('explode');
            } else {
                if (!luggage.behaviour.explosionAnimation.isPlaying) {
                    luggage.destroy();
                }
            }
        }
    }
}

function TravellerBehaviour() {
    this.update = function(traveller, gameContext) {
        
        if (traveller.behaviour.state == "nextInLine") {
            if (traveller.body.y <= 360) {
                traveller.behaviour.state = "checkingIn";
            } else {
                traveller.body.velocity.y = -walkingSpeed;
            }
        }

        if (traveller.behaviour.state == "checkingIn") {

            traveller.animations.stop();
            traveller.frame = 1;
            traveller.body.velocity.y = 0;
            traveller.behaviour.state = "waitingForBackendSystem";

            var luggage = gameContext.addLuggage(traveller.behaviour.lane,
                traveller.body.x - 10, traveller.body.y, { "state": "checkingIn" });
            traveller.behaviour.luggage = luggage;

            // Simulate callback
            setTimeout(() => {
                //var result = game.rnd.integerInRange(1, 2);
                // if (result == 1) {
                //     traveller.body.velocity.x = luggageSpeed;
                // } else {
                //     traveller.body.velocity.y = luggageSpeed;
                // }
                traveller.behaviour.state = "checkedIn";
            }, 1500);
        }

        if (traveller.behaviour.state == "checkedIn") {

            traveller.behaviour.state = "walkingToGate";

            traveller.animations.play('walkLeft');
            traveller.body.velocity.x = -walkingSpeed;

            traveller.behaviour.luggage.behaviour.state = "checkedIn";
            traveller.behaviour.luggage = null;

            gameContext.addTraveller(traveller.behaviour.lane);
        }

        if (traveller.behaviour.state == "walkingToGate") {

            if (traveller.body.x < -32) {
                traveller.destroy();
            }
        }
    }
}

function Scanner(scannerSprite, diverterSprite) {

    this.divertLuggage = function(force) {

        if (this.divertLuggageTween == null) {
            this.divertLuggageTween = game.add.tween(diverterSprite);
            this.divertLuggageTween.from({ y: scannerSprite.y - 32 }, force, Phaser.Easing.Linear.In, false);
            this.divertLuggageTween.onComplete.add(() => {
                this.divertLuggageTween = null;
            });
            this.divertLuggageTween.start();
        }
    }

    this.setLedColor = function(ok) {
        scannerSprite.frame = ok ? 1 : 2;
    }
}

BasicGame.Boot.prototype =
{
    divertLuggageTween: null,

    preload: function () {

        // ? Particle storm
        game.forceSingleUpdate = true;

        // Load assets.
        game.load.image('border', BorderImage);
        game.load.image('scanner', ScannerImage);
        game.load.image('scanner-push', ScannerPushImage);
        game.load.image('check-in-background', CheckInBackgroundImage);
        game.load.image('sort-background', SortBackgroundImage);
        game.load.image('scan-background', ScanBackgroundImage);
        game.load.atlas("luggage", LuggageImage, null, LuggageImageMetadata);
        game.load.atlas('scanner', ScannerImage, null, ScannerImageMetadata);
        game.load.atlas('scanner-beam', ScannerBeamImage, null, ScannerBeamImageMetadata);
        game.load.atlas("traveller", TravellerImage, null, TravellerImageMetadata);
        game.load.atlas("explosion", ExplosionImage, null, ExplosionImageMetadata);

        game.time.advancedTiming = true;
    },
    create: function () {

        luggageBehaviour = new LuggageBehaviour();
        travellerBehaviour = new TravellerBehaviour();

        cursors = game.input.keyboard.createCursorKeys();

        game.physics.startSystem(Phaser.Physics.ARCADE);

        game.world.setBounds(0, 0, 2688, 640);

        game.add.sprite(0, 0, 'check-in-background');
        game.add.sprite(896, 0, 'sort-background');
        game.add.sprite(1792, 0, 'scan-background');


        luggageGroup = game.add.group();
        travellerGroup = game.add.group();

        this.luggageDiverter = game.add.sprite(2122, 256, 'scanner-push');

        scanners.push(this.addScanner(2112, 256));
        scanners.push(this.addScanner(1920, 448));

        // Add a scanning effect to the scanners.
        var scannerBeam = game.add.sprite(2112, 192, 'scanner-beam');
        scannerBeam.animations.add('scan', Phaser.Animation.generateFrameNames(
            './scanner-beam-', 1, 3), 6, true);
        scannerBeam.animations.play('scan');

        //  Create our Timer
        var timer = game.time.create(false);
        timer.loop(500, () => {
           //this.addSuitcase();
        }, this);
        timer.start();

        var self = this;
        this.addTraveller(1);
        setTimeout(() => this.addTraveller(2), 500);
        setTimeout(() => this.addTraveller(0), 1000);

        var downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);

        game.camera.x = 1680;

        downKey.onDown.add(() => {
            this.addExtraLuggage(game.camera.x, 215, true).body.velocity.x = luggageSpeed; });

        upKey.onUp.add(() => {
            this.addExtraLuggage(game.camera.x, 215, false).body.velocity.x = luggageSpeed; });
    },
    update: function () {

        if (cursors.left.isDown)
        {
            game.camera.x -= 16;
        }
        else if (cursors.right.isDown)
        {
            game.camera.x += 16;
        }

        var gameContext = this;

        travellerGroup.forEach(function (traveller) {
            travellerBehaviour.update(traveller, gameContext);
        });

        luggageGroup.forEach(function (luggage) {
            luggageBehaviour.update(luggage, gameContext);
        });
    },
    render: function () {
//        game.debug.text(game.time.fps || '--', 2, 14, "#a7aebe");
//        game.debug.cameraInfo(game.camera, 32, 32);
    },
    addScanner: function(x, y) {

        var diverterSprite = game.add.sprite(x + 10, y, 'scanner-push');
        var scannerSprite = game.add.sprite(x, y, 'scanner');

        // Add a scanning effect to the scanners.
        var scannerBeam = game.add.sprite(x, y - 64, 'scanner-beam');
        scannerBeam.animations.add('scan', Phaser.Animation.generateFrameNames(
            './scanner-beam-', 1, 3), 6, true);
        scannerBeam.animations.play('scan');

        return new Scanner(scannerSprite, diverterSprite);

    },
    addTraveller: function(lane) {

        var traveller = travellerGroup.create(128 + (lane * 256), 640, 'traveller');
        traveller.anchor.set(0.5, 0.5);
        game.physics.arcade.enable(traveller);
        traveller.body.immovable = true;

        traveller.animations.add('walkUp', Phaser.Animation.generateFrameNames(
            './traveller-behind-', 1, 3), 8, true);
        traveller.animations.add('walkLeft', Phaser.Animation.generateFrameNames(
            './traveller-left-', 1, 3), 8, true);

        traveller.animations.play('walkUp');
    
        traveller.behaviour = {
            "state": "nextInLine",
            "lane": lane
        };

        return traveller;
    },
    addLuggage: function(lane, x, y, behaviour) {

        var luggage = luggageGroup.create(x ? x : 0, y ? y : 216, 'luggage');
        luggage.anchor.set(0.5, 0.5);
        luggage.frame = lane ? lane : 0;
        game.physics.arcade.enable(luggage);

        luggage.animations.add('explode', Phaser.Animation.generateFrameNames(
            './explosion-', 1, 5), 12, false);

        luggage.behaviour = behaviour;

        return luggage;
    },
    addExtraLuggage: function(x, y, suspicious) {

        var behaviour;
        if (game.camera.x >= 1221) {
            behaviour = { "state": "sorted", "belt": 0 };
        } else {
            behaviour = { "state": "unsorted" };
        }

        if (suspicious) {
            behaviour.suspicious = true;
        }

        var luggage = this.addLuggage(0, x, y, behaviour);
        luggage.frame = 3;

        if (suspicious) {
            luggage.tint = 0xFF5555;
        }

        return luggage;
    }
};

game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');