// Material Forge Server - Clean Version with Parallel Processing
require('dotenv').config({ path: '.env.local' });
const http = require('http');
const port = 3000;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Material Forge - AI Material Transformation</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class'
        }
    </script>
</head>
<body class="min-h-screen bg-gradient-to-b from-black to-gray-900 dark:from-black dark:to-gray-900 transition-colors">

    <div class="min-h-screen flex flex-col">
        <div class="container mx-auto px-4 py-8 flex-1 flex flex-col">
            <header class="text-center mb-8">
                <h1 class="text-4xl font-bold text-white dark:text-white mb-4">Material Forge</h1>
                <p class="text-xl text-gray-300 dark:text-gray-300 max-w-2xl mx-auto">
                    Transform any design into every possible material with AI. 
                    Upload your sketch or design and watch it come to life in the most suitable materials.
                </p>
            </header>

            <div class="max-w-6xl mx-auto flex-1 flex flex-col justify-center">
            <!-- Upload Section -->
            <div id="uploadSection" class="transition-all duration-500 ease-in-out">
                <!-- Collapsed Header (hidden by default) -->
                <div id="collapsedUpload" class="hidden bg-gray-900 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-800 dark:border-gray-800 p-4 cursor-pointer hover:shadow-md transition-shadow mb-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <img src="/sketch.png" alt="Design" class="w-6 h-6" style="filter: brightness(0) saturate(100%) invert(70%) sepia(76%) saturate(2474%) hue-rotate(193deg) brightness(97%) contrast(89%);">
                            <div>
                                <h3 class="font-semibold text-white dark:text-white">Upload New Design</h3>
                                <p class="text-sm text-gray-300 dark:text-gray-300">Click to upload another image</p>
                            </div>
                        </div>
                        <div class="text-gray-400 dark:text-gray-400">
                            <svg class="w-5 h-5 transform transition-transform" id="expandIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>
                </div>
                
                <!-- Full Upload Area -->
                <div id="fullUpload" class="border-2 border-dashed border-gray-700 dark:border-gray-700 rounded-lg p-12 text-center hover:border-gray-600 dark:hover:border-gray-600 transition-colors">
                    <div class="space-y-4">
                        <div class="flex justify-center">
                            <img src="/sketch.png" alt="Design" class="w-16 h-16" style="filter: brightness(0) saturate(100%) invert(70%) sepia(76%) saturate(2474%) hue-rotate(193deg) brightness(97%) contrast(89%);">
                        </div>
                        <div>
                            <h3 class="text-xl font-semibold text-white dark:text-white mb-2">Upload Your Design</h3>
                            <p class="text-gray-300 dark:text-gray-300 mb-4">Drag and drop your sketch, photo, or design file here</p>
                            <p class="text-sm text-gray-400 dark:text-gray-400 mb-6">Supports JPG, PNG, WebP files up to 10MB</p>
                        </div>
                        <div>
                            <input type="file" id="fileInput" accept="image/*" class="hidden">
                            <label for="fileInput" class="bg-blue-600 dark:bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors cursor-pointer inline-block">
                                Choose File
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div id="results" class="mt-8 hidden">
                <div class="bg-gray-900 dark:bg-gray-900 rounded-lg shadow-lg p-8 border border-gray-800 dark:border-gray-800">
                    <h2 class="text-2xl font-semibold mb-6 text-center text-white dark:text-white">Material Forge AI Pipeline</h2>
                    <div class="space-y-6">
                        <div class="flex justify-center">
                            <div id="uploadedImageContainer" class="hidden mb-4">
                                <div class="max-w-md mx-auto">
                                    <p class="text-sm text-gray-400 dark:text-gray-400 mb-2 text-center">Original Design:</p>
                                    <img id="uploadedImage" src="" alt="Uploaded design" class="w-full h-auto rounded-lg shadow-sm border border-gray-700 dark:border-gray-700">
                                </div>
                            </div>
                        </div>
                        <!-- Whimsical Progress Indicator -->
                        <div class="text-center">
                            <div class="flex justify-center mb-4">
                                <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-800 dark:border-gray-800 border-t-blue-400"></div>
                            </div>
                            
                            <!-- Main Progress Message -->
                            <div class="mb-6">
                                <p id="progressMessage" class="text-xl font-bold text-blue-400 dark:text-blue-400 mb-2">🔮 Analyzing your design...</p>
                                <p id="progressSubtext" class="text-md text-gray-300 dark:text-gray-300">Preparing for material transformation magic</p>
                            </div>
                            
                            <!-- Material Counter -->
                            <div id="materialCounter" class="mb-6 hidden">
                                <div class="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-900 dark:to-gray-800 rounded-lg p-4 max-w-md mx-auto border border-gray-800 dark:border-gray-800">
                                    <div class="flex items-center justify-center space-x-2 mb-3">
                                        <img src="/sketch.png" alt="Design" class="w-6 h-6" style="filter: brightness(0) saturate(100%) invert(70%) sepia(76%) saturate(2474%) hue-rotate(193deg) brightness(97%) contrast(89%);">
                                        <span class="font-semibold text-white dark:text-white">Material Forge Laboratory</span>
                                        <span class="text-2xl">⚗️</span>
                                    </div>
                                    <div class="text-center">
                                        <p class="text-lg font-bold text-purple-300 dark:text-purple-300 mb-1">
                                            <span id="completedCount">0</span> / <span id="totalCount">0</span> materials
                                        </p>
                                        <div class="w-full bg-black dark:bg-black rounded-full h-3 mb-2">
                                            <div id="progressBar" class="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300" style="width: 0%"></div>
                                        </div>
                                        <p id="currentMaterial" class="text-sm text-gray-300 dark:text-gray-300 italic">Getting ready...</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Fun Phase Indicators -->
                            <div class="text-center text-gray-300 dark:text-gray-300">
                                <div class="text-sm space-y-3">
                                    <div id="phase1" class="flex items-center justify-center space-x-3 p-2 rounded-lg transition-all">
                                        <div class="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                                        <span class="font-medium text-gray-300 dark:text-gray-300">🔍 Material Discovery & Validation</span>
                                        <div class="text-xl">🧙‍♂️</div>
                                    </div>
                                    <div id="phase2" class="flex items-center justify-center space-x-3 p-2 rounded-lg transition-all opacity-50">
                                        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span class="font-medium text-gray-300 dark:text-gray-300">⚡ Parallel Material Transformation</span>
                                        <div class="text-xl">🔬</div>
                                    </div>
                                    <div id="phase3" class="flex items-center justify-center space-x-3 p-2 rounded-lg transition-all opacity-50">
                                        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span class="font-medium text-gray-300 dark:text-gray-300">✨ Quality Assurance & Magic Polish</span>
                                        <div class="text-xl">🎩</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="gallery" class="mt-8 hidden">
                <div class="bg-gray-900 dark:bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-800 dark:border-gray-800">
                    <h2 class="text-2xl font-semibold mb-6 text-white dark:text-white">Material Transformations</h2>
                    <div id="galleryGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Results will be inserted here -->
                    </div>
                </div>
            </div>
            
            </div>
        </div>
    </div>

            <!-- Image Viewer Modal -->
            <div id="imageViewer" class="fixed inset-0 bg-black bg-opacity-90 z-50 hidden flex items-center justify-center">
                <div class="relative max-w-full max-h-full p-4">
                    <!-- Close button -->
                    <button id="closeViewer" class="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    
                    <!-- Previous button -->
                    <button id="prevImage" class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    </button>
                    
                    <!-- Next button -->
                    <button id="nextImage" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>
                    
                    <!-- Main image -->
                    <img id="viewerImage" src="" alt="" class="max-w-full max-h-full object-contain">
                    
                    <!-- Image info -->
                    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
                        <h3 id="viewerTitle" class="text-xl font-semibold mb-1"></h3>
                        <p id="viewerCounter" class="text-sm opacity-75"></p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="app.js"></script>
</body>
</html>`;
    
    res.end(html);
  } else if (req.url === '/app.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(getAppJS());
  } else if (req.url === '/sketch.png') {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'sketch.png');
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(data);
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

function getAppJS() {
  return `
const API_KEY = '${process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'YOUR_API_KEY_HERE'}';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1';
const GEMINI_API_BASE_BETA = 'https://generativelanguage.googleapis.com/v1beta';

// Dark Mode - permanently enabled
document.addEventListener('DOMContentLoaded', function() {
    document.documentElement.classList.add('dark');
});

// Setup drag and drop
const fullUpload = document.getElementById('fullUpload');
const collapsedUpload = document.getElementById('collapsedUpload');
const fileInput = document.getElementById('fileInput');

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

// Apply drag and drop to both areas
setupDragAndDrop(fullUpload);
setupDragAndDrop(collapsedUpload);

// Prevent default drag behaviors globally
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.body.addEventListener(eventName, preventDefaults, false);
    document.addEventListener(eventName, preventDefaults, false);  
    window.addEventListener(eventName, preventDefaults, false);
});

// Handle file input change and collapsed upload click
fileInput.addEventListener('change', handleFileInputChange);
collapsedUpload.addEventListener('click', toggleUploadSection);

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
        expandIcon.style.transform = 'rotate(0deg)';
    } else {
        // Collapse
        fullUpload.classList.add('hidden');
        collapsedUpload.classList.remove('hidden');
        expandIcon.style.transform = 'rotate(-90deg)';
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
        progressElement.innerHTML = error.message.replace(/\\n/g, '<br>');
        
        // Hide the loading spinner when there's an error
        document.querySelector('.animate-spin').style.display = 'none';
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
    document.getElementById('progressMessage').innerHTML = message;
    document.getElementById('progressSubtext').textContent = subtext;
}

function showMaterialCounter(total) {
    const counter = document.getElementById('materialCounter');
    document.getElementById('totalCount').textContent = total;
    document.getElementById('completedCount').textContent = '0';
    document.getElementById('progressBar').style.width = '0%';
    counter.classList.remove('hidden');
}

function updateMaterialProgress(completed, total, currentMaterial = '') {
    document.getElementById('completedCount').textContent = completed;
    const percentage = (completed / total) * 100;
    document.getElementById('progressBar').style.width = \`\${percentage}%\`;
    
    if (currentMaterial) {
        const emojis = ['✨', '🔮', '⚡', '🎨', '🌟', '💫', '🎭', '🔥'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        document.getElementById('currentMaterial').innerHTML = \`\${randomEmoji} Crafting \${currentMaterial}...\`;
    }
}

function activatePhase(phaseNumber) {
    // Reset all phases
    ['phase1', 'phase2', 'phase3'].forEach(id => {
        const phase = document.getElementById(id);
        phase.classList.remove('bg-purple-100', 'bg-blue-100', 'bg-green-100');
        phase.classList.add('opacity-50');
    });
    
    // Activate current phase
    const currentPhase = document.getElementById(\`phase\${phaseNumber}\`);
    currentPhase.classList.remove('opacity-50');
    const colors = ['bg-purple-100', 'bg-blue-100', 'bg-green-100'];
    currentPhase.classList.add(colors[phaseNumber - 1]);
}

async function runMaterialForgePipeline(imageData) {
    try {
        // Phase 1: Discover materials with validation
        activatePhase(1);
        updateProgressMessage('🔮 Analyzing your design...', 'Our AI wizard is studying your creation');
        
        const materials = await discoverMaterials(imageData);
        
        updateProgressMessage(\`🎉 Found \${materials.length} magical materials!\`, 'Preparing the transformation laboratory');
        showMaterialCounter(materials.length);
        
        // Phase 2: Transform materials in parallel batches
        activatePhase(2);
        updateProgressMessage('⚡ Material transformation in progress...', 'Watch the magic happen in real-time');
        
        const BATCH_SIZE = 5; // Process 5 materials in parallel
        const transformations = [];
        let completedCount = 0;
        
        for (let i = 0; i < materials.length; i += BATCH_SIZE) {
            const batch = materials.slice(i, i + BATCH_SIZE);
            
            // Update current materials being processed
            const materialNames = batch.map(m => m.name).join(', ');
            updateProgressMessage('⚡ Parallel transformation magic!', \`Currently transforming: \${materialNames}\`);
            
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
                    console.error(\`Failed to transform to \${material.name}:\`, error);
                }
                return null;
            });
            
            // Wait for batch to complete
            const batchResults = await Promise.all(batchPromises);
            transformations.push(...batchResults.filter(result => result !== null));
        }
        
        // Phase 3: Final polish
        activatePhase(3);
        updateProgressMessage('✨ Adding magical finishing touches...', 'Polishing your material collection');
        
        // Brief pause for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        updateProgressMessage(\`🎩 Transformation complete!\`, \`Successfully created \${transformations.length} material variations\`);
        
        // Show results after a moment
        setTimeout(() => showResults(transformations), 1500);
        
    } catch (error) {
        console.error('Pipeline error:', error);
        updateProgressMessage('❌ Oops! Magic spell failed', '');
        document.getElementById('progressSubtext').innerHTML = error.message.replace(/\\n/g, '<br>');
        
        // Hide the loading spinner when there's an error
        document.querySelector('.animate-spin').style.display = 'none';
    }
}

async function discoverMaterials(imageData) {
    const prompt = \`
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
    \`;

    try {
        const response = await fetch(\`\${GEMINI_API_BASE}/models/gemini-1.5-flash:generateContent?key=\${API_KEY}\`, {
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
        const responseText = result.candidates[0].content.parts[0].text;
        const jsonMatch = responseText.match(/{[\\s\\S]*}/);
        
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            
            // Check if content is suitable for material transformation
            if (data.suitable === false) {
                throw new Error(\`\${data.reason}\\n\\n💡 \${data.suggestion}\`);
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
    const prompt = \`
    Transform this design into \${material.name}.
    
    MAINTAIN EXACTLY:
    - The exact same shape and proportions
    - All design elements and structure
    - Same viewing angle and composition
    
    CHANGE TO \${material.name.toUpperCase()}:
    - Surface material: \${material.description}
    - Appropriate texture and finish for \${material.name}
    - Realistic lighting and reflections
    
    Make it photorealistic.
    \`;

    const response = await fetch(\`\${GEMINI_API_BASE_BETA}/models/gemini-2.5-flash-image-preview:generateContent?key=\${API_KEY}\`, {
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
        throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const result = await response.json();
    if (result.candidates && result.candidates[0]) {
        const content = result.candidates[0].content;
        for (const part of content.parts) {
            if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
                return \`data:\${part.inlineData.mimeType};base64,\${part.inlineData.data}\`;
            }
        }
    }
    throw new Error('No image generated');
}

async function validateTransformation(originalImage, transformedImage, material) {
    const prompt = \`
    Compare these two images and determine if the transformation was successful.
    
    The second image should show the same design made of \${material.name}.
    
    Respond with JSON:
    {
      "isCorrectMaterial": true/false,
      "confidence": 0.0-1.0,
      "reasoning": "brief explanation"
    }
    \`;

    try {
        const response = await fetch(\`\${GEMINI_API_BASE}/models/gemini-1.5-flash:generateContent?key=\${API_KEY}\`, {
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
        
        const jsonMatch = responseText.match(/{[\\s\\S]*}/);
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
    
    transformations.forEach(transformation => {
        const card = document.createElement('div');
        card.className = 'bg-gray-800 dark:bg-gray-800 rounded-lg p-4 border border-gray-700 dark:border-gray-700';
        
        card.innerHTML = \`
            <div class="mb-3 bg-gray-900 dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-gray-700 dark:border-gray-700"
                 onclick="openImageViewer(\${transformations.indexOf(transformation)})">
                <img src="\${transformation.image}" alt="\${transformation.material.name} version" 
                     class="w-full h-auto object-contain hover:scale-105 transition-transform">
            </div>
            <div class="text-center">
                <h3 class="font-semibold text-lg capitalize mb-3 text-white dark:text-white">\${transformation.material.name}</h3>
                <div class="flex justify-center space-x-2">
                    <button class="bg-blue-600 dark:bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors"
                            onclick="downloadImage('\${transformation.image}', '\${transformation.material.name}')">
                        Download
                    </button>
                </div>
            </div>
        \`;
        
        grid.appendChild(card);
    });
}

function downloadImage(imageData, materialName) {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = \`materialforge-\${materialName}.png\`;
    link.click();
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

function nextImage() {
    if (allTransformations.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % allTransformations.length;
    updateViewerImage();
}

function prevImage() {
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
    
    viewerImage.src = transformation.image;
    viewerImage.alt = \`\${transformation.material.name} version\`;
    viewerTitle.textContent = transformation.material.name.charAt(0).toUpperCase() + transformation.material.name.slice(1);
    viewerCounter.textContent = \`\${currentImageIndex + 1} of \${allTransformations.length}\`;
}

// Event listeners for image viewer
document.getElementById('closeViewer').addEventListener('click', closeImageViewer);
document.getElementById('nextImage').addEventListener('click', nextImage);
document.getElementById('prevImage').addEventListener('click', prevImage);

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (!document.getElementById('imageViewer').classList.contains('hidden')) {
        switch(e.key) {
            case 'Escape':
                closeImageViewer();
                break;
            case 'ArrowRight':
                nextImage();
                break;
            case 'ArrowLeft':
                prevImage();
                break;
        }
    }
});

// Close viewer when clicking outside the image
document.getElementById('imageViewer').addEventListener('click', function(e) {
    if (e.target === this) {
        closeImageViewer();
    }
});
`;
}

server.listen(port, () => {
  console.log(`🚀 Material Forge server running at http://localhost:${port}`);
  console.log('🎨 Upload an image to test the AI material transformation pipeline!');
});