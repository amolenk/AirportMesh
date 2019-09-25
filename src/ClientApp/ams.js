function AirportManagementSystem() {

    console.log('Using local endpoints');
    this.checkInServiceAddress = 'http://localhost:5000/api';
    this.scanServiceAddress = 'http://localhost:5001/api';
    this.sortServiceAddress = 'http://localhost:5002/api';

    this.sortLuggage = function (airlineCode) {

        return fetch(this.sortServiceAddress + '/sort/' + airlineCode)
        .then(function (response) {
            return response.json();
        });
    }

    this.scanLuggage = function (xRayData, processArea) {

        return new Promise(function(resolve) {
            resolve({
                "ledStatus": false,
                "divertSetting": 1
            });
          });
        // return fetch(this.scanServiceAddress + '/scan?xRayData=' + xRayData, {
        //     headers: {
        //         "x-process-area": processArea
        //     }
        // })
        // .then(function (response) {
        //     return response.json();
        // });
    }

    this.checkin = function (passportNumber) {

        return fetch(this.checkInServiceAddress + '/security/' + passportNumber, {
            method: 'PUT'
        })
        .then((response) => response.ok);
    }
}

module.exports = AirportManagementSystem;