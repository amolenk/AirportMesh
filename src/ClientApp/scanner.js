function Scanner(scannerSprite, diverterSprite, game) {

    this.divertLuggage = function(luggage, force) {

        if (this.divertLuggageTween == null) {
            this.divertLuggageTween = game.add.tween(diverterSprite);
            this.divertLuggageTween.from({ y: scannerSprite.y - 32 }, 1000 - (force * 250), Phaser.Easing.Linear.In, false);
            this.divertLuggageTween.onComplete.add(() => {
                this.divertLuggageTween = null;
            });
            this.divertLuggageTween.start();
        }

        if (force < 3) {
            var fadeTween = game.add.tween(luggage).to( { alpha: 0 }, 500 - (force * 200), Phaser.Easing.Linear.None, true);
            fadeTween.onComplete.add(() => {
                luggage.destroy();
            });
        }
    }

    this.setLedColor = function(ok) {
        scannerSprite.frame = ok ? 1 : 2;
    }
}

module.exports = Scanner;