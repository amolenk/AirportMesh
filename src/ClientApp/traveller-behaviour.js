function TravellerBehaviour(game, airportManagementSystem) {

    this.walkingSpeed = 200;

    this.update = function(traveller, gameContext) {
        
        if (traveller.behaviour.state == "nextInLine") {
            if (traveller.body.y <= 360) {
                traveller.behaviour.state = "checkingIn";
            } else {
                traveller.body.velocity.y = -this.walkingSpeed;
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

            airportManagementSystem.checkin(traveller.behaviour.passportNumber)
            .then((result) => {
                if (traveller.children.length == 0) {
                    traveller.addChild(game.make.sprite(-17, -70, 'traveller-happy'));
                }
                traveller.behaviour.state = "checkedIn";
            })
            .catch(() => {
                if (traveller.children.length == 0) {
                    traveller.addChild(game.make.sprite(-17, -70, 'traveller-angry'));
                }
                // Not really checkedIn, but this makes them go away ;-)
                traveller.behaviour.angry = true;
                traveller.behaviour.state = "checkedIn";
            });
        }

        if (traveller.behaviour.state == "checkedIn") {

            traveller.behaviour.state = "walkingToGate";

            gameContext.updateScore(!traveller.behaviour.angry);

            traveller.animations.play('walkLeft');
            traveller.body.velocity.x = -this.walkingSpeed;

            if (traveller.behaviour.angry) {
                traveller.behaviour.luggage.destroy();
                traveller.behaviour.luggage = null;
            } else {
                traveller.behaviour.luggage.behaviour.state = "checkedIn";
            }
            
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

module.exports = TravellerBehaviour;