function AirportManagementSystem() {

    // Local
    // this.checkInServiceAddress = 'http://localhost:5000/api';
    // this.scanServiceAddress = 'http://localhost:5001/api';
    // this.sortServiceAddress = 'http://localhost:5002/api';

    // Mesh
    this.meshIpAddress = "51.144.231.229";
    this.checkInServiceAddress = 'http://' + this.meshIpAddress + '/api';
    this.scanServiceAddress = 'http://' + this.meshIpAddress + '/api';
    this.sortServiceAddress = 'http://' + this.meshIpAddress + '/api';

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
            return response.status == 200 ? "Ok" : "Busy";
        });
    }
}

module.exports = AirportManagementSystem;