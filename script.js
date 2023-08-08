function updateCurrentTime() {
    const currentTime = new Date();
    return currentTime;
}

function displayCurrentTime() {
    const currentTime = updateCurrentTime();
    const timeElement = document.getElementById("current-time");
    timeElement.textContent = currentTime.toLocaleTimeString();
}

function getCurrentTimeZoneAbbreviation() {
    const options = { timeZoneName: 'short' };
    const currentTimeZone = Intl.DateTimeFormat(undefined, options).formatToParts().find(part => part.type === 'timeZoneName').value;
    return currentTimeZone;
}

fetch('timezones.csv')
    .then(response => response.text())
    .then(csvText => {
        const lines = csvText.trim().split('\n');
        const headers = lines.shift().split(',');
        const data = {};

        lines.forEach(line => {
            const values = [];
            let withinQuotes = false;
            let currentValue = '';

            for (let char of line) {
                if (char === '"') {
                    withinQuotes = !withinQuotes;
                } else if (char === ',' && !withinQuotes) {
                    values.push(currentValue.trim()); // Trim the value to remove any whitespace
                    currentValue = '';
                } else {
                    currentValue += char;
                }
            }

            values.push(currentValue.trim()); // Trim the last value
            const rowData = {};
            headers.forEach((header, index) => {
                rowData[header.trim()] = values[index]; // Trim the header as well
            });

            data[rowData["Windows Time Zone Name"]] = rowData;
        });

        // Populate time zone select options
        const timezoneSelect1 = document.getElementById("timezone1");
        const timezoneSelect2 = document.getElementById("timezone2");

        Object.keys(data).forEach(timezoneName => {
            const option1 = document.createElement("option");
            option1.text = timezoneName;
            option1.value = timezoneName;
            timezoneSelect1.add(option1);

            const option2 = document.createElement("option");
            option2.text = timezoneName;
            option2.value = timezoneName;
            timezoneSelect2.add(option2);
        });
    })
    .catch(error => console.error('Error fetching the CSV:', error));

// Update the time every second
setInterval(displayCurrentTime, 1000);

// Convert time based on user input
const convertButton = document.getElementById("convert-button");
const inputTime = document.getElementById("input-time");
const convertedTimeElement = document.getElementById("converted-time");

convertButton.addEventListener("click", () => {
    const selectedTimezone1 = data[timezoneSelect1.value];
    const selectedTimezone2 = data[timezoneSelect2.value];
    const selectedTime = inputTime.value;

    const timeDiff = selectedTimezone2["UTC Time"] - selectedTimezone1["UTC Time"];
    const [hours, minutes] = selectedTime.split(":");
    const convertedHours = parseInt(hours) + timeDiff;
    const convertedTime = `${(convertedHours < 10 ? "0" : "")}${convertedHours}:${minutes}`;

    convertedTimeElement.textContent = `Converted Time: ${convertedTime}`;
});

// Display the user's current time zone abbreviation
window.onload = function() {
    const userTimeZoneAbbreviation = getCurrentTimeZoneAbbreviation();
    const userTimeZoneElement = document.getElementById("user-time-zone");
    userTimeZoneElement.textContent = userTimeZoneAbbreviation;
}
