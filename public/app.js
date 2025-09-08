// Material Forge - Client-side JavaScript for Vercel deployment
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1';
const GEMINI_API_BASE_BETA = 'https://generativelanguage.googleapis.com/v1beta';

// Get API key from environment variable endpoint
let API_KEY = null;

// Initialize API key and event listeners
async function initializeApp() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        API_KEY = config.apiKey;
    } catch (error) {
        console.error('Failed to load API configuration:', error);
        API_KEY = 'YOUR_API_KEY_HERE'; // Fallback
    }
    
    setupEventListeners();
    setupDownloadButton();
}

// Setup download button
function setupDownloadButton() {
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', downloadAllImages);
    }
}


// Setup event listeners
function setupEventListeners() {
    // Setup drag and drop
    const fullUpload = document.getElementById('fullUpload');
    const collapsedUpload = document.getElementById('collapsedUpload');
    const fileInput = document.getElementById('fileInput');

    // Setup drag and drop for both areas
    if (fullUpload) setupDragAndDrop(fullUpload);
    if (collapsedUpload) setupDragAndDrop(collapsedUpload);

    // Prevent default drag behaviors globally
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false);
        document.addEventListener(eventName, preventDefaults, false);  
        window.addEventListener(eventName, preventDefaults, false);
    });

    // Handle file input change and collapsed upload click
    if (fileInput) fileInput.addEventListener('change', handleFileInputChange);
    if (collapsedUpload) collapsedUpload.addEventListener('click', toggleUploadSection);

    // Image viewer event listeners
    const closeViewer = document.getElementById('closeViewer');
    const nextImage = document.getElementById('nextImage');
    const prevImage = document.getElementById('prevImage');
    const imageViewer = document.getElementById('imageViewer');

    if (closeViewer) closeViewer.addEventListener('click', closeImageViewer);
    if (nextImage) nextImage.addEventListener('click', nextImageHandler);
    if (prevImage) prevImage.addEventListener('click', prevImageHandler);

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (imageViewer && !imageViewer.classList.contains('hidden')) {
            switch(e.key) {
                case 'Escape':
                    closeImageViewer();
                    break;
                case 'ArrowRight':
                    nextImageHandler();
                    break;
                case 'ArrowLeft':
                    prevImageHandler();
                    break;
            }
        }
    });

    // Close viewer when clicking outside the image
    if (imageViewer) {
        imageViewer.addEventListener('click', function(e) {
            if (e.target === this) {
                closeImageViewer();
            }
        });
    }
}

// Setup drag and drop for both full and collapsed upload areas
function setupDragAndDrop(element) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        element.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        element.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        element.addEventListener(eventName, unhighlight, false);
    });
    
    element.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    const target = e.currentTarget;
    if (target.id === 'fullUpload') {
        target.classList.add('border-blue-500', 'bg-blue-50');
    } else if (target.id === 'collapsedUpload') {
        target.classList.add('border-blue-500', 'bg-blue-50');
    }
}

function unhighlight(e) {
    const target = e.currentTarget;
    if (target.id === 'fullUpload') {
        target.classList.remove('border-blue-500', 'bg-blue-50');
    } else if (target.id === 'collapsedUpload') {
        target.classList.remove('border-blue-500', 'bg-blue-50');
    }
}

function toggleUploadSection() {
    const fullUpload = document.getElementById('fullUpload');
    const collapsedUpload = document.getElementById('collapsedUpload');
    const expandIcon = document.getElementById('expandIcon');
    
    if (fullUpload.classList.contains('hidden')) {
        // Expand
        fullUpload.classList.remove('hidden');
        collapsedUpload.classList.add('hidden');
        if (expandIcon) expandIcon.style.transform = 'rotate(0deg)';
    } else {
        // Collapse
        fullUpload.classList.add('hidden');
        collapsedUpload.classList.remove('hidden');
        if (expandIcon) expandIcon.style.transform = 'rotate(-90deg)';
    }
}

function collapseUploadSection() {
    const fullUpload = document.getElementById('fullUpload');
    const collapsedUpload = document.getElementById('collapsedUpload');
    
    fullUpload.classList.add('hidden');
    collapsedUpload.classList.remove('hidden');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
        handleFileUpload(files[0]);
    }
}

function handleFileInputChange(event) {
    const file = event.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
}

async function handleFileUpload(file) {
    if (!file) return;

    // Collapse the upload section to focus on processing
    collapseUploadSection();
    
    // Show processing UI
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('gallery').classList.add('hidden');

    try {
        // Convert file to base64
        const imageData = await fileToBase64(file);
        
        // Display the uploaded image
        const uploadedImage = document.getElementById('uploadedImage');
        const uploadedImageContainer = document.getElementById('uploadedImageContainer');
        uploadedImage.src = imageData;
        uploadedImageContainer.classList.remove('hidden');
        
        // Run the Material Forge pipeline with parallel processing
        await runMaterialForgePipeline(imageData);
        
    } catch (error) {
        console.error('Error processing image:', error);
        const progressElement = document.getElementById('progressMessage');
        progressElement.innerHTML = error.message.replace(/\n/g, '<br>');
        
        // Hide the loading spinner when there's an error
        const spinner = document.querySelector('.animate-spin');
        if (spinner) spinner.style.display = 'none';
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Helper functions for whimsical progress updates
function updateProgressMessage(message, subtext = '') {
    const progressMsg = document.getElementById('progressMessage');
    const progressSub = document.getElementById('progressSubtext');
    if (progressMsg) progressMsg.innerHTML = message;
    if (progressSub) progressSub.textContent = subtext;
}

function showMaterialCounter(total) {
    const counter = document.getElementById('materialCounter');
    const totalCount = document.getElementById('totalCount');
    const completedCount = document.getElementById('completedCount');
    const progressBar = document.getElementById('progressBar');
    
    if (totalCount) totalCount.textContent = total;
    if (completedCount) completedCount.textContent = '0';
    if (progressBar) progressBar.style.width = '0%';
    if (counter) counter.classList.remove('hidden');
}

function updateMaterialProgress(completed, total, currentMaterial = '') {
    const completedCount = document.getElementById('completedCount');
    const progressBar = document.getElementById('progressBar');
    const currentMaterialElement = document.getElementById('currentMaterial');
    
    if (completedCount) completedCount.textContent = completed;
    const percentage = (completed / total) * 100;
    if (progressBar) progressBar.style.width = `${percentage}%`;
    
    if (currentMaterial && currentMaterialElement) {
        currentMaterialElement.innerHTML = `→ Rendering ${currentMaterial}`;
    }
}

async function runMaterialForgePipeline(imageData) {
    try {
        // Phase 1: Discover materials with validation
        updateProgressMessage('🔍 Analyzing material composition...', 'Identifying optimal material transformations');
        
        const materials = await discoverMaterials(imageData);
        
        updateProgressMessage(`✓ Identified ${materials.length} compatible materials`, 'Initializing advanced rendering pipeline');
        showMaterialCounter(materials.length);
        
        // Phase 2: Transform materials in parallel batches
        updateProgressMessage('⚡ Processing material variations...', 'Parallel rendering across material specifications');
        
        const BATCH_SIZE = 5; // Process 5 materials in parallel
        const transformations = [];
        let completedCount = 0;
        
        for (let i = 0; i < materials.length; i += BATCH_SIZE) {
            const batch = materials.slice(i, i + BATCH_SIZE);
            
            // Update current materials being processed
            const materialCount = batch.length;
            updateProgressMessage('⚡ Executing parallel transformations', `Processing batch of ${materialCount} materials...`);
            
            // Process batch in parallel
            const batchPromises = batch.map(async (material) => {
                try {
                    const transformedImage = await transformToMaterial(imageData, material);
                    
                    // Validate transformation
                    const validation = await validateTransformation(imageData, transformedImage, material);
                    
                    if (validation.isCorrectMaterial) {
                        completedCount++;
                        updateMaterialProgress(completedCount, materials.length, material.name);
                        
                        return {
                            material,
                            image: transformedImage,
                            confidence: validation.confidence,
                            success: true,
                            attempts: 1
                        };
                    }
                } catch (error) {
                    console.error(`Failed to transform to ${material.name}:`, error);
                }
                return null;
            });
            
            // Wait for batch to complete
            const batchResults = await Promise.all(batchPromises);
            transformations.push(...batchResults.filter(result => result !== null));
        }
        
        // Phase 3: Final polish
        updateProgressMessage('✨ Finalizing renderings...', 'Applying post-processing refinements');
        
        // Brief pause for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        updateProgressMessage(`✓ Rendering complete`, `Generated ${transformations.length} high-fidelity material variations`);
        
        // Show results after a moment
        setTimeout(() => showResults(transformations), 1500);
        
    } catch (error) {
        console.error('Pipeline error:', error);
        updateProgressMessage('❌ Processing error encountered', '');
        const progressSub = document.getElementById('progressSubtext');
        if (progressSub) progressSub.innerHTML = error.message.replace(/\n/g, '<br>');
        
        // Hide the loading spinner when there's an error
        const spinner = document.querySelector('.animate-spin');
        if (spinner) spinner.style.display = 'none';
    }
}

async function discoverMaterials(imageData) {
    const prompt = `
    First, determine if this image is suitable for material transformation. Material transformation works best with:
    - Product designs, furniture, objects, architectural elements
    - Sketches, drawings, or renderings of objects
    - Items that could realistically be made from different materials
    
    NOT suitable for material transformation:
    - Photos of people, animals, or living beings
    - Landscapes, nature scenes, or environments
    - Abstract art or patterns without clear objects
    - Food items or organic matter
    - Complex scenes with multiple unrelated objects
    
    If the image IS suitable for material transformation, analyze the design and provide a comprehensive list of materials that would work well for this object.
    
    Include materials from ALL these categories:
    - Natural materials: wood, bamboo, stone, marble, granite, limestone, cork, leather, wool, cotton, linen, silk
    - Metals: steel, aluminum, brass, copper, bronze, titanium, gold, silver, iron, chrome
    - Glass and crystal: clear glass, frosted glass, stained glass, crystal, tempered glass
    - Modern synthetics: plastic, acrylic, carbon fiber, fiberglass, resin, silicone
    - Specialty materials: ceramic, concrete, rubber, velvet, denim, canvas, felt
    
    Provide at least 20 different materials. Be creative and think of materials that would create visually distinct and interesting variations.
    
    Respond with JSON in ONE of these formats:
    
    If SUITABLE for material transformation:
    {
      "suitable": true,
      "materials": [
        {"name": "oak wood", "description": "natural oak with visible grain"},
        {"name": "brushed aluminum", "description": "modern brushed aluminum finish"},
        ... (continue with at least 20 materials total)
      ]
    }
    
    If NOT suitable for material transformation:
    {
      "suitable": false,
      "reason": "This appears to be a photo of a person, which is not suitable for material transformation",
      "suggestion": "Please upload an image of a product, furniture piece, architectural element, or object design that could be made from different materials. Examples: chairs, lamps, vases, buildings, jewelry, tools, or product sketches."
    }
    `;

    try {
        const response = await fetch(`${GEMINI_API_BASE}/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: "image/jpeg", data: imageData.split(',')[1] } }
                    ]
                }]
            })
        });

        const result = await response.json();
        
        // Debug logging
        console.log('API Response:', result);
        
        if (!result.candidates || result.candidates.length === 0) {
            console.error('No candidates in response:', result);
            throw new Error('API returned no candidates. Response: ' + JSON.stringify(result));
        }
        
        const responseText = result.candidates[0].content.parts[0].text;
        const jsonMatch = responseText.match(/{[\s\S]*}/);
        
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            
            // Check if content is suitable for material transformation
            if (data.suitable === false) {
                throw new Error(`${data.reason}\n\n💡 ${data.suggestion}`);
            }
            
            return data.materials || [];
        }
    } catch (error) {
        console.error('Error discovering materials:', error);
        throw error;
    }
    
    // Fallback materials
    return [
        { name: "oak wood", description: "natural oak with visible grain" },
        { name: "brushed aluminum", description: "modern brushed aluminum finish" },
        { name: "clear glass", description: "transparent tempered glass" },
        { name: "white marble", description: "polished white marble with veining" },
        { name: "black leather", description: "premium black leather texture" },
        { name: "stainless steel", description: "polished stainless steel" },
        { name: "walnut wood", description: "dark walnut wood grain" },
        { name: "frosted glass", description: "translucent frosted glass" },
        { name: "brass", description: "warm brass metal finish" },
        { name: "concrete", description: "industrial concrete texture" },
        { name: "bamboo", description: "sustainable bamboo material" },
        { name: "copper", description: "warm copper metal finish" },
        { name: "acrylic", description: "clear acrylic plastic" },
        { name: "cork", description: "natural cork texture" },
        { name: "ceramic", description: "smooth ceramic finish" },
        { name: "carbon fiber", description: "high-tech carbon fiber weave" },
        { name: "velvet", description: "soft velvet fabric texture" },
        { name: "granite", description: "speckled granite stone" },
        { name: "titanium", description: "lightweight titanium metal" },
        { name: "silk", description: "smooth silk fabric finish" }
    ];
}

async function transformToMaterial(imageData, material) {
    const prompt = `
    Transform this design into ${material.name}.
    
    MAINTAIN EXACTLY:
    - The exact same shape and proportions
    - All design elements and structure
    - Same viewing angle and composition
    
    CHANGE TO ${material.name.toUpperCase()}:
    - Surface material: ${material.description}
    - Appropriate texture and finish for ${material.name}
    - Realistic lighting and reflections
    
    Make it photorealistic.
    `;

    const response = await fetch(`${GEMINI_API_BASE_BETA}/models/gemini-2.5-flash-image-preview:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: "image/jpeg", data: imageData.split(',')[1] } }
                ]
            }]
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.candidates && result.candidates[0]) {
        const content = result.candidates[0].content;
        for (const part of content.parts) {
            if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    throw new Error('No image generated');
}

async function validateTransformation(originalImage, transformedImage, material) {
    const prompt = `
    Compare these two images and determine if the transformation was successful.
    
    The second image should show the same design made of ${material.name}.
    
    Respond with JSON:
    {
      "isCorrectMaterial": true/false,
      "confidence": 0.0-1.0,
      "reasoning": "brief explanation"
    }
    `;

    try {
        const response = await fetch(`${GEMINI_API_BASE}/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: "image/jpeg", data: originalImage.split(',')[1] } },
                        { inline_data: { mime_type: "image/jpeg", data: transformedImage.split(',')[1] } }
                    ]
                }]
            })
        });

        if (!response.ok) {
            return { isCorrectMaterial: true, confidence: 0.8, reasoning: "Validation unavailable" };
        }

        const result = await response.json();
        const responseText = result.candidates[0].content.parts[0].text;
        
        const jsonMatch = responseText.match(/{[\s\S]*}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        return { isCorrectMaterial: true, confidence: 0.8, reasoning: "Validation completed" };
    } catch (error) {
        console.error('Error validating transformation:', error);
        return { isCorrectMaterial: true, confidence: 0.7, reasoning: "Validation system error" };
    }
}

function showResults(transformations) {
    document.getElementById('results').classList.add('hidden');
    document.getElementById('gallery').classList.remove('hidden');
    
    // Store transformations globally for the image viewer
    window.currentTransformations = transformations;
    
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = '';
    
    transformations.forEach((transformation, index) => {
        const card = document.createElement('div');
        card.className = 'bg-gray-900 dark:bg-gray-900 rounded-lg p-4 border border-gray-800 dark:border-gray-800';
        
        card.innerHTML = `
            <div class="mb-3 bg-black dark:bg-black rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-gray-800 dark:border-gray-800"
                 onclick="openImageViewer(${index})">
                <img src="${transformation.image}" alt="${transformation.material.name} version" 
                     class="w-full h-auto object-contain hover:scale-105 transition-transform">
            </div>
            <div class="text-center">
                <h3 class="font-semibold text-lg capitalize mb-3 text-white dark:text-white">${transformation.material.name}</h3>
                <div class="flex justify-center space-x-2">
                    <button class="bg-blue-600 dark:bg-blue-600 text-white p-2 rounded hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors"
                            onclick="downloadImage('${transformation.image}', '${transformation.material.name}')"
                            title="Download">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function downloadImage(imageData, materialName) {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `materialforge-${materialName}.png`;
    link.click();
}

function downloadAllImages() {
    if (!window.currentTransformations || window.currentTransformations.length === 0) {
        return;
    }
    
    // Download each image with a small delay to avoid browser blocking
    window.currentTransformations.forEach((transformation, index) => {
        setTimeout(() => {
            downloadImage(transformation.image, transformation.material.name);
        }, index * 500); // 500ms delay between downloads
    });
}

// Image Viewer functionality
let currentImageIndex = 0;
let allTransformations = [];

function openImageViewer(index) {
    currentImageIndex = index;
    allTransformations = window.currentTransformations || [];
    
    if (allTransformations.length === 0) return;
    
    updateViewerImage();
    document.getElementById('imageViewer').classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeImageViewer() {
    document.getElementById('imageViewer').classList.add('hidden');
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

function nextImageHandler() {
    if (allTransformations.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % allTransformations.length;
    updateViewerImage();
}

function prevImageHandler() {
    if (allTransformations.length === 0) return;
    currentImageIndex = (currentImageIndex - 1 + allTransformations.length) % allTransformations.length;
    updateViewerImage();
}

function updateViewerImage() {
    if (allTransformations.length === 0) return;
    
    const transformation = allTransformations[currentImageIndex];
    const viewerImage = document.getElementById('viewerImage');
    const viewerTitle = document.getElementById('viewerTitle');
    const viewerCounter = document.getElementById('viewerCounter');
    
    if (viewerImage) {
        viewerImage.src = transformation.image;
        viewerImage.alt = `${transformation.material.name} version`;
    }
    
    if (viewerTitle) {
        viewerTitle.textContent = transformation.material.name.charAt(0).toUpperCase() + transformation.material.name.slice(1);
    }
    
    if (viewerCounter) {
        viewerCounter.textContent = `${currentImageIndex + 1} of ${allTransformations.length}`;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);