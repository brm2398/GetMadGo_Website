const TOTAL_SHOUTING_LIMIT = 50;
const CURRENT_SHOUTING_THRESHOLD = 0.05;

let totalShouted = 0.0;
let signupShown = false;

async function handleShoutButtonClicked(element) {
  // hide button to try to ensure this doesn't get called multiple times
  element.style.display = 'none';
  try {
    await setupRecording();
  } catch(err) {
    element.style.display = 'block';
    throw err;
  }
}

async function setupRecording() {
  let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  let context = new AudioContext();
  let source = context.createMediaStreamSource(stream);
  let processor = context.createScriptProcessor();

  source.connect(processor);
  processor.connect(context.destination);
  processor.onaudioprocess = handleAudioProcess;
}

function handleAudioProcess(event) {
  let currentShouted = rmsFromAudioInput(event);
  let bounce = document.getElementById('bounce');

  if(currentShouted >= CURRENT_SHOUTING_THRESHOLD) {
    totalShouted += currentShouted;
    bounce.style.animationPlayState = 'running';
    updateLocalShouts();
    showSignupIfLimitReached();
  } else {
    bounce.style.animationPlayState = 'paused';
  }
}

function rmsFromAudioInput(event) {
  const channelData = event.inputBuffer.getChannelData(0);
  const sum_of_squares = channelData.reduce(
    (accumulator, currentValue) => {
      return accumulator + currentValue * currentValue;
    }, 0);
  return Math.sqrt(sum_of_squares / channelData.length);
}

function showSignupIfLimitReached() {
  if(!signupShown && totalShouted > TOTAL_SHOUTING_LIMIT) {
    signupShown = true;
    document.getElementById('signupForm').style.display = 'block';
  }
}

function updateLocalShouts() {
  const totalShoutedProgress = totalShouted / TOTAL_SHOUTING_LIMIT
  const totalShoutedPercent = (totalShoutedProgress * 100).toFixed();

  document.getElementById('localTotalShouts').textContent = totalShoutedPercent;
}