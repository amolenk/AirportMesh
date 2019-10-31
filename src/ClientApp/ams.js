function AirportManagementSystem() {

    if (process.env.NODE_ENV == 'development') {
        console.log('Using local endpoints');
        this.checkInServiceAddress = 'http://localhost:5000/api';
        this.scanServiceAddress = 'http://localhost:5001/api';
        this.sortServiceAddress = 'http://localhost:5002/api';
    } else {
        // Mesh
        this.checkInServiceAddress = 'http://example.com/api';
        this.scanServiceAddress = 'http://example.com/api';
        this.sortServiceAddress = 'http://example.com/api';
    }

    this.sortLuggage = function (airlineCode) {

        return fetch(this.sortServiceAddress + '/sort/' + airlineCode)
        .then(function (response) {
            return response.json();
        });
    }

    this.scanLuggage = function (xRayData, processArea) {

        return fetch(this.scanServiceAddress + '/scan?xRayData=' + xRayData, {
            headers: {
                "x-process-area": processArea
            }
        })
        .then(function (response) {
            return response.json();
        });
    }

    this.submitPassportCheck = function (passportNumber) {

        return fetch(this.checkInServiceAddress + '/passport/' + passportNumber, {
            method: "PUT"
        });
    }

    this.getPassportCheckStatus = function (passportNumber) {

        return fetch(this.checkInServiceAddress + '/passport/' + passportNumber)
        .then(function (response) {
            return response.text();
        })
    }
}

module.exports = AirportManagementSystem;