function updateCurrentTime() {
    const currentTime = new Date();
    return currentTime;
}

function displayCurrentTime() {
    const currentTime = updateCurrentTime();
    const timeElement = document.getElementById("current-time");
    timeElement.textContent = currentTime.toLocaleTimeString();
}

function displayCurrentTimeZone() {
    const options = { timeZoneName: 'long' };
    const currentTimeZone = Intl.DateTimeFormat(undefined, options).resolvedOptions().timeZone;
    const userTimeZoneElement = document.getElementById("user-time-zone"); 
    userTimeZoneElement.textContent = currentTimeZone;
}

// Update the time every second
setInterval(displayCurrentTime, 1000);
displayCurrentTimeZone()

