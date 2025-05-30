// Listen for DOM content to load
window.addEventListener('DOMContentLoaded', () => {
    // Get all elements we need
    const focusDigits = Array.from(document.querySelector('#focus-time').getElementsByClassName('digit-box'));
    const breakDigits = Array.from(document.querySelector('#break-time').getElementsByClassName('digit-box'));
    const startButton = document.getElementById('start-focus');
    const resetButton = document.getElementById('reset');
    const completionMessage = document.getElementById('completion_message');
    const volumeIcon = document.getElementById('volume-icon');
    const timerSound = document.getElementById('timer-sound');

    let timerInterval;
    let isRunning = false;
    let isFocusTime = true;
    let savedFocusTime = 25 * 60; // Store initial focus time in seconds
    let savedBreakTime = 5 * 60;  // Store initial break time in seconds
    let isMuted = false;

    // Function to get time from digit boxes (returns seconds)
    function getTimeFromDigits(digits) {
        const minutes = parseInt(digits[0].value + digits[1].value);
        const seconds = parseInt(digits[2].value + digits[3].value);
        return (minutes * 60) + seconds;
    }

    // Function to update digit boxes with time
    function updateDigitBoxes(digits, timeInSeconds) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        
        // Update minutes
        digits[0].value = Math.floor(minutes / 10);
        digits[1].value = minutes % 10;
        
        // Update seconds
        digits[2].value = Math.floor(seconds / 10);
        digits[3].value = seconds % 10;
    }

    // Function to start timer (either focus or break)
    function startTimer(isBreak = false) {
        if (isRunning) return;

        isFocusTime = !isBreak;
        isRunning = true;
        
        // Clear completion message when starting new timer
        completionMessage.textContent = '';
        
        // Save current timer values before starting
        if (isFocusTime) {
            savedFocusTime = getTimeFromDigits(focusDigits);
        } else {
            savedBreakTime = getTimeFromDigits(breakDigits);
        }
        
        // Disable all digit inputs while timer is running
        [...focusDigits, ...breakDigits].forEach(digit => digit.disabled = true);
        
        startButton.disabled = true;
        timerInterval = setInterval(runTimer, 1000);
    }

    // Timer function
    function runTimer() {
        const currentDigits = isFocusTime ? focusDigits : breakDigits;
        let timeLeft = getTimeFromDigits(currentDigits);

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            playTimerEndSound(); // Play sound when timer ends

            if (isFocusTime) {
                // Focus timer finished
                isFocusTime = false;
                completionMessage.textContent = 'Focus complete! Ready for a break?';
                startButton.textContent = 'Start Break';
                startButton.disabled = false;
                // Enable only break timer inputs
                breakDigits.forEach(digit => digit.disabled = false);
                // Restore saved focus time
                updateDigitBoxes(focusDigits, savedFocusTime);
            } else {
                // Break timer finished
                isFocusTime = true;
                completionMessage.textContent = 'Break complete! Ready to focus again?';
                startButton.textContent = 'Start Focus';
                startButton.disabled = false;
                // Enable only focus timer inputs
                focusDigits.forEach(digit => digit.disabled = false);
                // Restore saved break time
                updateDigitBoxes(breakDigits, savedBreakTime);
            }
            return;
        }

        timeLeft--;
        updateDigitBoxes(currentDigits, timeLeft);
    }

    // Start button click handler
    startButton.addEventListener('click', () => {
        // Check if we're starting a break or focus timer
        startTimer(!isFocusTime);
    });

    // Reset button click handler
    resetButton.addEventListener('click', () => {
        clearInterval(timerInterval);
        isRunning = false;
        isFocusTime = true;
        
        // Clear completion message
        completionMessage.textContent = '';
        
        // Enable all inputs
        [...focusDigits, ...breakDigits].forEach(digit => digit.disabled = false);
        
        // Reset focus timer to default (25:00)
        updateDigitBoxes(focusDigits, savedFocusTime);
        // Reset break timer to default (5:00)
        updateDigitBoxes(breakDigits, savedBreakTime);
        
        startButton.textContent = 'Start Focus';
        startButton.disabled = false;
    });

    // Input validation for digit boxes
    [...focusDigits, ...breakDigits].forEach(digit => {
        digit.addEventListener('input', () => {
            // Ensure single digit
            if (digit.value.length > 1) {
                digit.value = digit.value.slice(-1);
            }
            
            // Validate minutes/seconds
            const isMinutes = focusDigits.indexOf(digit) <= 1 || breakDigits.indexOf(digit) <= 1;
            const maxVal = isMinutes ? 9 : (digit.value === '6' ? 5 : 9);
            
            if (parseInt(digit.value) > maxVal) {
                digit.value = maxVal;
            }
        });
    });

    // Volume toggle functionality
    volumeIcon.addEventListener('click', () => {
        isMuted = !isMuted;
        volumeIcon.src = isMuted ? 'images/volume_off.png' : 'images/volume_on.png';
        volumeIcon.classList.toggle('muted', isMuted);
    });

    // Function to play sound
    function playTimerEndSound() {
        if (!isMuted && timerSound) {
            timerSound.currentTime = 0; // Reset sound to start
            timerSound.play().catch(error => console.log('Error playing sound:', error));
        }
    }

});
    