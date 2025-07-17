// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract WaterQuality {
    struct Reading {
        string sensorId;
        uint256 pH; // Stored as integer (e.g., 72 for 7.2)
        uint256 temperature; // Stored as integer (e.g., 250 for 25.0)
        uint256 turbidity; // Stored as integer (e.g., 1 for 0.01)
        uint256 salinity; // Stored as integer (e.g., 500 for 50.0)
        uint256 waterLevel; // Stored as integer (e.g., 750 for 75.0)
        uint256 timestamp;
    }

    Reading[] public readings;

    event WaterQualityRecorded(
        string sensorId,
        uint256 pH,
        uint256 temperature,
        uint256 turbidity,
        uint256 salinity,
        uint256 waterLevel,
        uint256 timestamp
    );

    function checkWaterQuality(
        string memory sensorId,
        uint256 pH,
        uint256 temperature,
        uint256 turbidity,
        uint256 salinity,
        uint256 waterLevel
    ) public {
        readings.push(Reading(sensorId, pH, temperature, turbidity, salinity, waterLevel, block.timestamp));
        emit WaterQualityRecorded(sensorId, pH, temperature, turbidity, salinity, waterLevel, block.timestamp);
    }

    function getReadings() public view returns (Reading[] memory) {
        return readings;
    }

    function getReadingCount() public view returns (uint256) {
        return readings.length;
    }
}