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
            option1.setAttribute("data-dst", timeZoneData["DST"]);
            timezoneSelect1.add(option1);

            const option2 = document.createElement("option");
            option2.text = timeZoneData["Display Name"];
            option2.value = timezoneName;
            option2.setAttribute("data-dst", timeZoneData["DST"]);
            timezoneSelect2.add(option2);
        });

        const userTimeZoneFull = getCurrentTimeZoneFullName();

        for (let i = 0; i < timezoneSelect1.options.length; i++) {
            if (timezoneSelect1.options[i].text.includes(userTimeZoneFull)) {
                timezoneSelect1.options[i].selected = true;
                break;
            }
        }

        timezoneSelect2.options[59].selected = true;
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

    convertedTimeElement.innerHTML = `<strong>Converted Time:</strong> ${convertedHours.toString().padStart(2, "0")}:${convertedMinutes.toString().padStart(2, "0")} ${meridian}`;

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

function isItDaylightSavings() {
    const currentTime = updateCurrentTime();
    const date = currentTime.getDate();
    const month = currentTime.getMonth() + 1; // Months are zero-based, so add 1

    // Check if the date is between March 9 and November 8
    if ((month === 3 && date >= 9) || (month > 3 && month < 11) || (month === 11 && date <= 8)) {
        return true; // It's daylight saving time
    } else {
        return false; // It's not daylight saving time
    }
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

    const dstMessage = document.getElementById("dst-message");
    if (isItDaylightSavings()) { 
        dstMessage.textContent = "It is currently Daylight Savings Time (DST). DST Time Zones are populated in the option forms."
        document.getElementById("hide-dst-chekcbox").checked = true;
    } else { 
        dstMessage.textContent = "It is not currently Daylight Savings Time (DST). DST Time Zones are  not populated in the option forms."
        document.getElementById("hide-dst-chekcbox").checked = false;
    }
}

// Attach an event listener to the DST checkbox
const dstCheckbox = document.getElementById("hide-dst-checkbox");
dstCheckbox.addEventListener("change", () => {

    const timezoneSelect1 = document.getElementById("timezone1");
    const timezoneSelect2 = document.getElementById("timezone2");

    const hideDST = dstCheckbox.checked;
    console.log(hideDST)

    // Loop through the options in both dropdowns
    for (let i = 0; i < timezoneSelect1.options.length; i++) {
        const dstValue = timezoneSelect1.options[i].getAttribute("data-dst");

        console.log(dstValue)

        if (dstValue === "TRUE" && hideDST) {
            timezoneSelect1.options[i].style.display = "none";
        } else {
            timezoneSelect1.options[i].style.display = "block";
        }
    }

    for (let i = 0; i < timezoneSelect2.options.length; i++) {
        const dstValue = timezoneSelect2.options[i].getAttribute("data-dst");
        if (dstValue === "TRUE" && hideDST) {
            timezoneSelect2.options[i].style.display = "none";
        } else {
            timezoneSelect2.options[i].style.display = "block";
        }
    }
});
