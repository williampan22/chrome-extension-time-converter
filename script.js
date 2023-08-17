
const data = {};

fetch('timezones2.csv')
    .then(response => response.text())
    .then(csvText => {
        const lines = csvText.trim().split('\n');
        const headers = lines.shift().split(',');


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

            data[rowData["Display Name"]] = rowData;
        });

        // Populate time zone select options
        const timezoneSelect1 = document.getElementById("timezone1");
        const timezoneSelect2 = document.getElementById("timezone2");

        Object.keys(data).forEach(timezoneName => {
            const timeZoneData = data[timezoneName];
            const option1 = document.createElement("option");
            option1.text = timeZoneData["Display Name"];
            option1.value = timezoneName;
            timezoneSelect1.add(option1);

            const option2 = document.createElement("option");
            option2.text = timeZoneData["Display Name"];
            option2.value = timezoneName;
            timezoneSelect2.add(option2);
        });
    })
    .catch(error => console.error('Error fetching the CSV:', error));

// Convert time based on user input
const convertButton = document.getElementById("convert-button");
const inputTime = document.getElementById("input-time");
const convertedTimeElement = document.getElementById("converted-time");

convertButton.addEventListener("click", () => {
    const timezoneSelect1 = document.getElementById("timezone1");
    const timezoneSelect2 = document.getElementById("timezone2");
    const timezone1 = data[timezoneSelect1.value];
    const timezone2 = data[timezoneSelect2.value];
    const selectedTime = inputTime.value;

    const [hours1, minutes1] = timezone1["UTC Time"].split(":").map(Number);
    const [hours2, minutes2] = timezone2["UTC Time"].split(":").map(Number);
    const [hoursSelect, minutesSelect] = selectedTime.split(":").map(Number);

    let hourDiff = hours2 - hours1;
    let minuteDiff = minutes2 - minutes1;

    if (minuteDiff < 0) {
        hourDiff -= 1;
        minuteDiff += 60;
    } else if (minuteDiff >= 60) {
        hourDiff += 1;
        minuteDiff -= 60;
    }

    let convertedHours = hoursSelect + hourDiff;
    let convertedMinutes = minutesSelect + minuteDiff;

    if (convertedMinutes >= 60) {
        convertedHours += Math.floor(convertedMinutes / 60);
        convertedMinutes %= 60;
    } else if (convertedMinutes < 0) {
        convertedHours -= Math.ceil(Math.abs(convertedMinutes) / 60);
        convertedMinutes = 60 - Math.abs(convertedMinutes) % 60;
    }

    // Handle cases where convertedHours can exceed 24 or be negative
    convertedHours = (convertedHours + 24) % 24;

    // Determine AM/PM and adjust convertedHours if needed
    let meridian = "AM";
    if (convertedHours >= 12) {
        meridian = "PM";
        if (convertedHours > 12) {
            convertedHours -= 12;
        }
    } else if (convertedHours === 0) {
        convertedHours = 12; // 12:00 AM
    }

    convertedTimeElement.textContent = `Converted Time: ${convertedHours.toString().padStart(2, "0")}:${convertedMinutes.toString().padStart(2, "0")} ${meridian}`;

});

// For next version
function updateCurrentTime() {
    const currentTime = new Date();
    return currentTime;
}

function displayCurrentTime() {
    const currentTime = updateCurrentTime();
    const timeElement = document.getElementById("current-time");
    timeElement.textContent = currentTime.toLocaleTimeString();

    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    // Format hours and minutes as HH:mm
    const formattedCurrentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Set the default value of the input element to the current time
    const inputTimeElement = document.getElementById("input-time"); // Get the input element
    inputTimeElement.value = formattedCurrentTime;
    
}

// Update the time every second
setInterval(displayCurrentTime, 1000);

function getCurrentTimeZoneAbbreviation() {
    const options = { timeZoneName: 'short' };
    const currentTimeZone = Intl.DateTimeFormat(undefined, options).formatToParts().find(part => part.type === 'timeZoneName').value;
    return currentTimeZone;
}

function getCurrentTimeZoneFullName() {
    const options = { timeZoneName: 'long' };
    const currentTimeZone = Intl.DateTimeFormat(undefined, options).formatToParts().find(part => part.type === 'timeZoneName').value;
    return currentTimeZone;
}

// Display the user's current time zone abbreviation
window.onload = function () {
    const userTimeZoneAbbreviation = getCurrentTimeZoneAbbreviation();
    const userTimeZoneFull = getCurrentTimeZoneFullName();
    const userTimeZoneAbbreviationElement = document.getElementById("user-time-zone-abbreviation");
    userTimeZoneAbbreviationElement.textContent = userTimeZoneAbbreviation;
    const userTimeZoneFullElement = document.getElementById("user-time-zone-full");
    userTimeZoneFullElement.textContent = userTimeZoneFull;
}

console.log(data)