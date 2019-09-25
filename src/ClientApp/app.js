
import './styles/site.css'

const uuidv1 = require('uuid/v1');

const AirportManagementSystem = require('./ams');
const Scanner = require('./scanner');
const LuggageBehaviour = require('./luggage-behaviour');
const TravellerBehaviour = require('./traveller-behaviour');

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

var BasicGame = function (game) { };

BasicGame.Boot = function (game) { };

var luggageBehaviour, travellerBehaviour;
var luggageGroup, travellerGroup;

BasicGame.Boot.prototype =
{
    travellersProcessed: 0,
    travellersHappy: 0,
    scanners: [],

    preload: function () {

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

        var airportManagementSystem = new AirportManagementSystem();
        luggageBehaviour = new LuggageBehaviour(game, airportManagementSystem);
        travellerBehaviour = new TravellerBehaviour(game, airportManagementSystem);

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

        this.scanners.push(this.addScanner(2112, 256));
        this.scanners.push(this.addScanner(1920, 448));

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

        this.addTraveller(CHECK_IN_LANE_MIDDLE, LUGGAGE_TYPE_RED, 'OW');
        setTimeout(() => this.addTraveller(CHECK_IN_LANE_LEFT, LUGGAGE_TYPE_BLUE, 'KL'), 500);
        setTimeout(() => this.addTraveller(CHECK_IN_LANE_RIGHT, LUGGAGE_TYPE_GREEN, 'OA'), 1000);

        var key1 = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
        var key2 = game.input.keyboard.addKey(Phaser.Keyboard.TWO);
        var key9 = game.input.keyboard.addKey(Phaser.Keyboard.NINE);
        var key0 = game.input.keyboard.addKey(Phaser.Keyboard.ZERO);
        var keySpace = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

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

        travellerGroup.forEach((traveller) => {
            travellerBehaviour.update(traveller, this);
        });

        luggageGroup.forEach((luggage) => {
            luggageBehaviour.update(luggage, this);
        });
    },
    addScanner: function(x, y) {

        var diverterSprite = game.add.sprite(x + 10, y, 'scanner-push');
        var scannerSprite = game.add.sprite(x, y, 'scanner');

        // Add a scanning effect to the scanners.
        var scannerBeam = game.add.sprite(x, y - 64, 'scanner-beam');
        scannerBeam.animations.add('scan', Phaser.Animation.generateFrameNames(
            './scanner-beam-', 1, 3), 6, true);
        scannerBeam.animations.play('scan');

        return new Scanner(scannerSprite, diverterSprite, game);

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
        luggage.body.velocity.x = luggageBehaviour.luggageSpeed;

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