// Global variables
let modelImage = null;
let bagImage = null;
let tryonImageUrl = null;

// DOM Elements
const modelImageInput = document.getElementById('modelImageInput');
const bagImageInput = document.getElementById('bagImageInput');
const modelPreview = document.getElementById('modelPreview');
const bagPreview = document.getElementById('bagPreview');
const modelPlaceholder = document.getElementById('modelPlaceholder');
const bagPlaceholder = document.getElementById('bagPlaceholder');
const generateTryonBtn = document.getElementById('generateTryonBtn');
const generateVideoBtn = document.getElementById('generateVideoBtn');
const tryonLoading = document.getElementById('tryonLoading');
const videoLoading = document.getElementById('videoLoading');
const tryonResult = document.getElementById('tryonResult');
const videoResult = document.getElementById('videoResult');
const emptyState = document.getElementById('emptyState');
const tryonImage = document.getElementById('tryonImage');
const videoPlayer = document.getElementById('videoPlayer');
const videoSource = document.getElementById('videoSource');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const successMessage = document.getElementById('successMessage');
const successText = document.getElementById('successText');

// Event Listeners
modelImageInput.addEventListener('change', handleModelImageUpload);
bagImageInput.addEventListener('change', handleBagImageUpload);
generateTryonBtn.addEventListener('click', generateTryon);
generateVideoBtn.addEventListener('click', generateVideo);

/**
 * Handle model image upload and preview
 */
function handleModelImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        modelImage = file;
        const reader = new FileReader();
        reader.onload = (ev) => {
            modelPreview.src = ev.target.result;
            modelPreview.classList.add('visible');
            modelPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
        checkEnableGenerateButton();
    }
}

/**
 * Handle bag image upload and preview
 */
function handleBagImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        bagImage = file;
        const reader = new FileReader();
        reader.onload = (ev) => {
            bagPreview.src = ev.target.result;
            bagPreview.classList.add('visible');
            bagPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
        checkEnableGenerateButton();
    }
}

/**
 * Enable generate button when both images are uploaded
 */
function checkEnableGenerateButton() {
    if (modelImage && bagImage) {
        generateTryonBtn.disabled = false;
    }
}

/**
 * Generate virtual try-on image
 */
async function generateTryon() {
    if (!modelImage || !bagImage) {
        showError('Please upload both model and bag images.');
        return;
    }

    emptyState.style.display = 'none';
    tryonResult.classList.remove('visible');
    videoResult.classList.remove('visible');
    hideMessages();

    tryonLoading.classList.add('visible');
    generateTryonBtn.disabled = true;
    generateVideoBtn.disabled = true;

    try {
        const formData = new FormData();
        formData.append('model_image', modelImage);
        formData.append('bag_image', bagImage);

        const response = await fetch('/generate-tryon', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            tryonImageUrl = data.tryon_image_url;
            tryonImage.src = tryonImageUrl;
            tryonImage.classList.add('visible');
            tryonResult.classList.add('visible');
            generateVideoBtn.disabled = false;
            showSuccess('Virtual try-on generated successfully!');
        } else {
            showError('Failed to generate try-on image.');
            emptyState.style.display = 'block';
        }
    } catch (error) {
        showError('Error: ' + error.message);
        emptyState.style.display = 'block';
    } finally {
        tryonLoading.classList.remove('visible');
        generateTryonBtn.disabled = false;
    }
}

/**
 * Generate video ad from try-on image
 */
async function generateVideo() {
    if (!tryonImageUrl) {
        showError('Please generate a try-on image first.');
        return;
    }

    videoResult.classList.remove('visible');
    hideMessages();

    videoLoading.classList.add('visible');
    generateVideoBtn.disabled = true;

    try {
        const formData = new FormData();
        formData.append('tryon_image_url', tryonImageUrl);

        const response = await fetch('/generate-video', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            videoSource.src = data.video_url;
            videoPlayer.load();
            videoResult.classList.add('visible');
            showSuccess('Video ad generated successfully!');
        } else {
            showError('Failed to generate video.');
        }
    } catch (error) {
        showError('Error: ' + error.message);
    } finally {
        videoLoading.classList.remove('visible');
        generateVideoBtn.disabled = false;
    }
}

/**
 * Show error message
 */
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.add('visible');
    successMessage.classList.remove('visible');
    setTimeout(() => {
        errorMessage.classList.remove('visible');
    }, 4500);
}

/**
 * Show success message
 */
function showSuccess(message) {
    successText.textContent = message;
    successMessage.classList.add('visible');
    errorMessage.classList.remove('visible');
    setTimeout(() => {
        successMessage.classList.remove('visible');
    }, 4500);
}

/**
 * Hide all messages
 */
function hideMessages() {
    errorMessage.classList.remove('visible');
    successMessage.classList.remove('visible');
}
