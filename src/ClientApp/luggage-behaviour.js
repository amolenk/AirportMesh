function LuggageBehaviour(game, airportManagementSystem) {

    this.luggageSpeed = 200;

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
                luggage.body.velocity.y = -this.luggageSpeed;
            }
        }        

        if (luggage.behaviour.state == "unsorted") {
            if (luggage.body.x >= 1221) {
                luggage.behaviour.state = "readyForSorting";
            } else {
                luggage.body.velocity.x = this.luggageSpeed;
            }
        }

        if (luggage.behaviour.state == "readyForSorting") {
            luggage.body.velocity.x = 0;
            luggage.behaviour.state = "sorting";

            airportManagementSystem.sortLuggage(luggage.behaviour.airline)
            .then((result) => {

                if (result) {
                    luggage.body.velocity.y = this.luggageSpeed;
                    luggage.behaviour.processArea = 1;
                } else {
                    luggage.body.velocity.x = this.luggageSpeed;
                    luggage.behaviour.processArea = 0;
                }
                luggage.behaviour.state = "sorted";
            })
            .catch((error) => { 
                // Wait a second before trying again.
                setTimeout(() => { luggage.behaviour.state = "readyForSorting" }, 1000);
            });

            return;
        }

        if (luggage.behaviour.state == "sorted") {
            if (luggage.body.velocity.y > 0
                && luggage.body.y >= 388) {
                luggage.body.velocity.x = this.luggageSpeed;
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
            .then((result) => {
                var scanner = gameContext.scanners[luggage.behaviour.processArea];
                scanner.setLedColor(result.ledStatus);

                if (result.divertSetting == 0) {
                    luggage.body.velocity.x = this.luggageSpeed;
                    luggage.behaviour.state = "approved";
                } else {

                    scanner.divertLuggage(luggage, result.divertSetting);

                    luggage.body.velocity.y = -result.divertSetting * this.luggageSpeed;
                    luggage.behaviour.state = "diverted";
                }
            })
            .catch((error) => { 
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

module.exports = LuggageBehaviour;