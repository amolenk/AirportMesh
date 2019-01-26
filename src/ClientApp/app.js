
import './styles/site.css'
const uuidv1 = require('uuid/v1');
const AirportManagementSystem = require('./ams');
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
const SortOTronImage = require('./assets/sort-o-tron.png')
const ScannerBeamImageMetadata = require('./assets/scanner-beam.json')
const TravellerAngryImage = require('./assets/traveller-angry.png')
const TravellerHappyImage = require('./assets/traveller-happy.png')

const LUGGAGE_TYPE_BLUE = 0;
const LUGGAGE_TYPE_RED = 1;
const LUGGAGE_TYPE_GREEN = 2;
const LUGGAGE_TYPE_PACKAGE = 3;

const CHECK_IN_LANE_LEFT = 0;
const CHECK_IN_LANE_MIDDLE = 1;
const CHECK_IN_LANE_RIGHT = 2;

var game = new Phaser.Game(896, 640, Phaser.AUTO, 'test', null, true, false);

var cursors;

var walkingSpeed = 200;
var luggageSpeed = 200;

var BasicGame = function (game) { };

BasicGame.Boot = function (game) { };

var luggageBehaviour, travellerBehaviour;
var luggageGroup, travellerGroup;
var scanners = [];

var airportManagementSystem = new AirportManagementSystem();

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

            airportManagementSystem.sortLuggage(luggage.behaviour.airline)
            .then(function(result) {
                if (result) {
                    luggage.body.velocity.y = luggageSpeed;
                    luggage.behaviour.processArea = 1;
                } else {
                    luggage.body.velocity.x = luggageSpeed;
                    luggage.behaviour.processArea = 0;
                }
                luggage.behaviour.state = "sorted";
            })
            .catch(function(error) { 
                // Wait a second before trying again.
                setTimeout(() => { luggage.behaviour.state = "readyForSorting" }, 1000);
            });

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

            var xRayData = luggage.behaviour.suspicious ? '32ddaw2[something_iffy]312dss' : 'fsd324fsd34ncse3';

            airportManagementSystem.scanLuggage(xRayData, luggage.behaviour.processArea)
            .then(function(result) {
                var scanner = scanners[luggage.behaviour.processArea];
                scanner.setLedColor(result.ledStatus);

                if (result.divertSetting == 0) {
                    luggage.body.velocity.x = luggageSpeed;
                    luggage.behaviour.state = "approved";
                } else {

                    var scanner = scanners[luggage.behaviour.processArea];
                    scanner.divertLuggage(1000 - (result.divertSetting * 250));

                    luggage.body.velocity.y = -result.divertSetting * luggageSpeed;

                    if (result.divertSetting < 3) {
                        var fadeTween = game.add.tween(luggage).to( { alpha: 0 }, 500 - (result.divertSetting * 200), Phaser.Easing.Linear.None, true);
                        fadeTween.onComplete.add(() => {
                            luggage.destroy();
                        });
                    }

                    luggage.behaviour.state = "diverted";
                }
            })
            .catch(function(error) { 
                // Wait a second before trying again.
                setTimeout(() => { luggage.behaviour.state = "readyForScanning" }, 1000);
            });
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
            traveller.behaviour.state = "submittingPassportCheck";

            if (!traveller.behaviour.luggage) {
                var luggage = gameContext.addLuggage(traveller.behaviour.luggageType,
                    traveller.body.x - 10, traveller.body.y, { "state": "checkingIn", "airline": traveller.behaviour.airline });
                traveller.behaviour.luggage = luggage;
            }

            airportManagementSystem.submitPassportCheck(traveller.behaviour.passportNumber)
            .then(function() {
                setTimeout(() => { traveller.behaviour.state = "pollForPassportCheckResult" }, 5000);
            })
            .catch(function(error) { 
console.log('error!');
                if (traveller.children.length == 0) {
                    traveller.addChild(game.make.sprite(-17, -70, 'traveller-angry'));
                }

                // Wait a second before trying again.
                setTimeout(() => { traveller.behaviour.state = "checkingIn" }, 2000);
            });
        }

        if (traveller.behaviour.state == "pollForPassportCheckResult") {

            traveller.behaviour.state = "pollingForPassportCheckResult";

            // if (traveller.children.length == 0) {
            //     traveller.addChild(game.make.sprite(-17, -70, 'traveller-angry'));
            // }

            airportManagementSystem.getPassportCheckStatus(traveller.behaviour.passportNumber)
            .then(function(result) {
                if (result == "Ok") {

                    if (!traveller.behaviour.waitingForHomelandSecurity
                        && traveller.children.length == 0) {
                        traveller.addChild(game.make.sprite(-17, -70, 'traveller-happy'));
                    }

                    traveller.behaviour.state = "checkedIn";
                } else {
                    console.log(result);

                    if (traveller.children.length == 0) {
                        traveller.addChild(game.make.sprite(-17, -70, 'traveller-angry'));
                    }

                    traveller.behaviour.waitingForHomelandSecurity = true;

                    // Wait a second before trying again.
                    setTimeout(() => { traveller.behaviour.state = "pollForPassportCheckResult" }, 2000);
                }
            });
        }

        if (traveller.behaviour.state == "checkedIn") {

            traveller.behaviour.state = "walkingToGate";

            gameContext.updateScore(!traveller.behaviour.waitingForHomelandSecurity);

            traveller.animations.play('walkLeft');
            traveller.body.velocity.x = -walkingSpeed;

            // nicer, but travellers need to be added to distinct groups
//            traveller.body.velocity.y = walkingSpeed / 8;

            traveller.behaviour.luggage.behaviour.state = "checkedIn";
            traveller.behaviour.luggage = null;

            setTimeout(() => {
                gameContext.addTraveller(
                    traveller.behaviour.lane,
                    traveller.behaviour.luggageType,
                    traveller.behaviour.airline);    
            }, game.rnd.integerInRange(1000, 2000));
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
//    divertLuggageTween: null,
    travellersProcessed: 0,
    travellersHappy: 0,
    //scoreText,

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
        game.load.image('sort-o-tron', SortOTronImage);
        game.load.image('traveller-angry', TravellerAngryImage);
        game.load.image('traveller-happy', TravellerHappyImage);
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

        game.add.sprite(1194, 172, 'sort-o-tron');


        this.luggageDiverter = game.add.sprite(2122, 256, 'scanner-push');

        scanners.push(this.addScanner(2112, 256));
        scanners.push(this.addScanner(1920, 448));

        // Add a scanning effect to the scanners.
        var scannerBeam = game.add.sprite(2112, 192, 'scanner-beam');
        scannerBeam.animations.add('scan', Phaser.Animation.generateFrameNames(
            './scanner-beam-', 1, 3), 6, true);
        scannerBeam.animations.play('scan');

        var bar = game.add.graphics();
        bar.beginFill(0x000000, 0.5);
        bar.drawRect(0, 0, 380, 50);
        bar.fixedToCamera = true;

        var scoreEmoticon = game.add.sprite(10, 8, 'traveller-happy');
        scoreEmoticon.fixedToCamera = true;

        var style = { font: "bold 22px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

        this.scoreText = game.add.text(55, 10, "shiny happy travellers: --", style);
        this.scoreText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
        this.scoreText.fixedToCamera = true;

        //  Create our Timer
        var timer = game.time.create(false);
        timer.loop(500, () => {
           //this.addSuitcase();
        }, this);
        timer.start();

        var self = this;
        this.addTraveller(CHECK_IN_LANE_MIDDLE, LUGGAGE_TYPE_RED, 'OW');
        setTimeout(() => this.addTraveller(CHECK_IN_LANE_LEFT, LUGGAGE_TYPE_BLUE, 'KL'), 500);
        setTimeout(() => this.addTraveller(CHECK_IN_LANE_RIGHT, LUGGAGE_TYPE_GREEN, 'OA'), 1000);

        var key1 = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
        var key2 = game.input.keyboard.addKey(Phaser.Keyboard.TWO);
        var key9 = game.input.keyboard.addKey(Phaser.Keyboard.NINE);
        var key0 = game.input.keyboard.addKey(Phaser.Keyboard.ZERO);
        var keySpace = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        //game.camera.x = 1680;

        key1.onDown.add(() => this.addExtraLuggage(LUGGAGE_TYPE_PACKAGE, game.camera.x, 'KL', false));
        key2.onDown.add(() => this.addExtraLuggage(LUGGAGE_TYPE_PACKAGE, game.camera.x, 'OW', false));
        key9.onDown.add(() => this.addExtraLuggage(LUGGAGE_TYPE_PACKAGE, game.camera.x, 'KL', true));
        key0.onDown.add(() => this.addExtraLuggage(LUGGAGE_TYPE_PACKAGE, game.camera.x, 'OW', true));
        keySpace.onDown.add(() => { game.paused = !game.paused; });
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
        //game.debug.font = '28px Courier';
        //game.debug.text(game.time.fps || '--', 2, 14, "#a7aebe");
        //game.debug.cameraInfo(game.camera, 32, 32);
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
    addTraveller: function(lane, luggageType, airline) {

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
            "lane": lane,
            "luggageType": luggageType,
            "airline": airline,
            "passportNumber": uuidv1()
        };

        return traveller;
    },
    addLuggage: function(luggageType, x, y, behaviour) {

        var luggage = luggageGroup.create(x ? x : 0, y ? y : 216, 'luggage');
        luggage.anchor.set(0.5, 0.5);
        luggage.frame = luggageType;
        game.physics.arcade.enable(luggage);

        luggage.animations.add('explode', Phaser.Animation.generateFrameNames(
            './explosion-', 1, 5), 12, false);

        luggage.behaviour = behaviour;
        // luggage.behaviour.airline = 

        return luggage;
    },
    addExtraLuggage: function(luggageType, x, airline, suspicious) {

        var behaviour = {
            "state": "unsorted",
            "airline": airline,
            "suspicious": suspicious
        };

        var luggage = this.addLuggage(luggageType, 1220, 215, behaviour);
        luggage.frame = 3;
        luggage.body.velocity.x = luggageSpeed;

        if (suspicious) {
            luggage.tint = 0xFF5555;
        }

        return luggage;
    },
    updateScore: function(happy) {
        this.travellersProcessed += 1;
        if (happy) {
            this.travellersHappy += 1;
        }

        this.scoreText.setText("shiny happy travellers: "
            + Math.round(this.travellersHappy / this.travellersProcessed * 100) + "%");
    }
};

game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');