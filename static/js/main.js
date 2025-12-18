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

// Add click handler for disabled button feedback
document.querySelector('.button-group').addEventListener('click', (e) => {
    if (e.target === generateTryonBtn && generateTryonBtn.disabled) {
        if (!modelImage && !bagImage) {
            showError('Please upload both a Model Image and a Bag Image first.');
        } else if (!modelImage) {
            showError('Please upload a Model Image first.');
        } else if (!bagImage) {
            showError('Please upload a Bag Image first.');
        }
    }
    if (e.target === generateVideoBtn && generateVideoBtn.disabled) {
        if (!tryonImageUrl) {
            showError('Please generate a Try-On image first.');
        }
    }
});

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
    console.log('Checking button state - modelImage:', !!modelImage, 'bagImage:', !!bagImage);
    
    if (modelImage && bagImage) {
        generateTryonBtn.disabled = false;
        generateTryonBtn.style.opacity = '1';
        generateTryonBtn.style.cursor = 'pointer';
        console.log('✅ Generate Try-On button ENABLED');
    } else {
        generateTryonBtn.disabled = true;
        generateTryonBtn.style.opacity = '0.5';
        generateTryonBtn.style.cursor = 'not-allowed';
        
        if (!modelImage) {
            console.log('⚠️ Missing: Model Image');
        }
        if (!bagImage) {
            console.log('⚠️ Missing: Bag Image');
        }
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

// ==================== MODEL SELECTION POPUP ====================

// Modal Elements
const modelModal = document.getElementById('modelModal');
const closeModalBtn = document.getElementById('closeModal');
const uploadTabBtn = document.getElementById('uploadTabBtn');
const generateTabBtn = document.getElementById('generateTabBtn');
const uploadTabContent = document.getElementById('uploadTabContent');
const generateTabContent = document.getElementById('generateTabContent');
const uploadZone = document.getElementById('uploadZone');
const modalFileInput = document.getElementById('modalFileInput');
const generateModelForm = document.getElementById('generateModelForm');
const generateModelBtn = document.getElementById('generateModelBtn');
const modelPreviewSection = document.getElementById('generatedModelPreview');
const generatedModelImage = document.getElementById('generatedModelImage');
const useModelBtn = document.getElementById('useModelBtn');
const modalLoading = document.getElementById('modalLoading');

let generatedModelUrl = null;

/**
 * Open model selection modal
 */
function openModelModal() {
    console.log('Opening modal...');
    modelModal.classList.add('active');
    switchTab('upload');
}

/**
 * Close model selection modal
 */
function closeModelModal() {
    modelModal.classList.remove('active');
    resetModal();
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    if (tabName === 'upload') {
        uploadTabBtn.classList.add('active');
        generateTabBtn.classList.remove('active');
        uploadTabContent.classList.add('active');
        generateTabContent.classList.remove('active');
    } else if (tabName === 'generate') {
        generateTabBtn.classList.add('active');
        uploadTabBtn.classList.remove('active');
        generateTabContent.classList.add('active');
        uploadTabContent.classList.remove('active');
    }
    
    console.log('Tab switched successfully');
}

/**
 * Reset modal to initial state
 */
function resetModal() {
    generateModelForm.reset();
    modelPreviewSection.classList.remove('active');
    modalLoading.classList.remove('active');
    generatedModelUrl = null;
    
    // Show form again if it was hidden
    const formElement = generateModelForm.querySelector('.generate-form');
    if (formElement) {
        formElement.classList.remove('preview-active');
    }
}

/**
 * Handle file upload from modal
 */
/**
 * Handle file upload from modal
 */
function handleModalFileUpload(e) {
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
        
        closeModelModal();
        checkEnableGenerateButton();
        showSuccess('Model image uploaded successfully!');
    }
}


/**
 * Generate AI Model
 */
async function generateAIModel(e) {
    e.preventDefault();
    
    const formData = new FormData(generateModelForm);
    
    // Show loading
    modalLoading.classList.add('active');
    generateModelBtn.disabled = true;
    
    try {
        const response = await fetch('/generate-ai-model', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            generatedModelUrl = data.model_image_url;
            
            // Show preview
            generatedModelImage.src = generatedModelUrl;
            modelPreviewSection.classList.add('active');
            modalLoading.classList.remove('active');
            
            // ✅ FIXED: Hide form and scroll to preview
            const formElement = generateModelForm.querySelector('.generate-form');
            if (formElement) {
                formElement.classList.add('preview-active');
            }
            
            // Scroll to preview section smoothly
            setTimeout(() => {
                modelPreviewSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 200);
            
            showSuccess(data.message || 'AI model generated successfully!');
        } else {
            throw new Error('Failed to generate AI model');
        }
        
    } catch (error) {
        modalLoading.classList.remove('active');
        showError('Error generating AI model: ' + error.message);
    } finally {
        generateModelBtn.disabled = false;
    }
}

/**
 * Use generated AI model
 */
async function useGeneratedModel() {
    if (!generatedModelUrl) {
        showError('No model generated yet');
        return;
    }
    
    try {
        // Fetch the generated image and convert to File object
        const response = await fetch(generatedModelUrl);
        const blob = await response.blob();
        const file = new File([blob], 'ai_model.jpg', { type: 'image/jpeg' });
        
        // Set as model image
        modelImage = file;
        modelPreview.src = generatedModelUrl;
        modelPreview.classList.add('visible');
        modelPlaceholder.style.display = 'none';
        
        // Close modal
        closeModelModal();
        checkEnableGenerateButton();
        
        showSuccess('AI-generated model ready! Upload a bag image to continue.');
        
    } catch (error) {
        showError('Error using generated model: ' + error.message);
    }
}

// Event Listeners for Modal
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModelModal);
    console.log('✅ Close button listener attached');
}

if (uploadTabBtn) {
    uploadTabBtn.addEventListener('click', () => {
        console.log('Upload tab clicked');
        switchTab('upload');
    });
    console.log('✅ Upload tab listener attached');
}

if (generateTabBtn) {
    generateTabBtn.addEventListener('click', () => {
        console.log('Generate tab clicked');
        switchTab('generate');
    });
    console.log('✅ Generate tab listener attached');
}

if (uploadZone) {
    uploadZone.addEventListener('click', () => modalFileInput.click());
}

if (modalFileInput) {
    modalFileInput.addEventListener('change', handleModalFileUpload);
}

if (generateModelForm) {
    generateModelForm.addEventListener('submit', generateAIModel);
}

if (useModelBtn) {
    useModelBtn.addEventListener('click', useGeneratedModel);
}

// Close modal when clicking outside
if (modelModal) {
    modelModal.addEventListener('click', (e) => {
        if (e.target === modelModal) {
            closeModelModal();
        }
    });
}

console.log('✅ Modal functions loaded successfully');
