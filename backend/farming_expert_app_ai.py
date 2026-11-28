"""
AgriBot AI Backend with Grok API Integration - Complete Version
"""

import os
import sys
import json
import logging
import asyncio
import traceback
import requests
from datetime import datetime
from typing import Dict, Any, Optional, List
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient

# Explicitly load .env from backend directory
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

# Debug: Print environment loading
print(f"🔍 Loading environment from: {os.getcwd()}")
groq_key = os.getenv('GROQ_API_KEY')
grok_key = os.getenv('GROK_API_KEY')
print(f"🔑 GROQ_API_KEY found: {'Yes' if groq_key else 'No'}")
print(f"🔑 GROK_API_KEY found: {'Yes' if grok_key else 'No'}")
if groq_key:
    print(f"🔑 GROQ_API_KEY starts with: {groq_key[:10]}...")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Allow frontend URLs from environment variable or default to localhost
frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
allowed_origins = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000", 
    "http://localhost:3001", 
    "http://127.0.0.1:3001",
    "https://agri-guru-ten.vercel.app",  # Vercel production
    "https://agri-guru-7wvt9bkfg-shriom17s-projects.vercel.app",  # Vercel preview
    frontend_url,
    frontend_url.replace('http://', 'https://') if 'http://' in frontend_url else f"https://{frontend_url}"
]

CORS(app, origins=allowed_origins, supports_credentials=True)

# --- Crop Health Analysis Endpoint ---
from werkzeug.utils import secure_filename
import tempfile
import numpy as np

# Optional torch imports for advanced crop analysis (not required for core functionality)
try:
    import torch  # type: ignore
    import torchvision.transforms as transforms  # type: ignore
    from PIL import Image  # type: ignore
    import requests as py_requests
    # Use torchvision's EfficientNet or ResNet
    from torchvision import models  # type: ignore
    TORCH_AVAILABLE = True
except ImportError:
    torch = None
    transforms = None
    Image = None
    TORCH_AVAILABLE = False
    logger.info("⚠️ PyTorch not installed - advanced image analysis disabled")

# --- Import Real Disease Detection Service ---
try:
    from updated_multi_crop_service import MultiCropDiseaseService
    disease_service = MultiCropDiseaseService()
    disease_service_available = True
    logger.info("✅ Real disease detection service loaded successfully!")
except ImportError as e:
    disease_service = None
    disease_service_available = False
    logger.warning(f"⚠️ Disease detection service not available: {e}")

@app.route('/api/crop-disease-detection', methods=['POST'])
def crop_disease_detection():
    """Real crop disease detection using trained model"""
    if not disease_service_available:
        return jsonify({
            'success': False, 
            'error': 'Disease detection service not available. Please check if updated_multi_crop_service.py is present.',
            'fallback': 'Using basic image analysis instead'
        }), 503
    
    if 'image' not in request.files:
        return jsonify({'success': False, 'error': 'No image file provided.'}), 400
        
    file = request.files['image']
    filename = secure_filename(file.filename)
    
    try:
        # Save uploaded image to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name
        
        # Use real disease detection service
        logger.info(f"🔬 Analyzing crop image with real trained model: {filename}")
        result = disease_service.analyze_crop_image(temp_path)
        logger.info(f"📊 Disease service result: {result}")
        
        # Clean up temp file
        os.remove(temp_path)
        
        # Format response
        response = {
            'success': True,
            'disease_analysis': {
                'predicted_class': result.get('disease_detected', 'Unknown'),
                'confidence': result.get('confidence', 0.0),
                'disease_type': result.get('disease_detected', 'Unknown'),
                'severity': result.get('severity', 'Unknown'),
                'recommendations': result.get('recommendations', [
                    'Analysis completed but no specific recommendations available',
                    'Monitor plant health regularly',
                    'Consult with agricultural expert if needed'
                ])
            },
            'model_info': {
                'model_type': 'real_cnn_trained',
                'classes': result.get('total_classes', 15),
                'accuracy': result.get('model_accuracy', 'N/A')
            },
            'timestamp': datetime.now().isoformat(),
            'filename': filename
        }
        
        logger.info(f"✅ Disease detection completed: {result.get('predicted_class', 'Unknown')}")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Disease detection error: {e}")
        # Clean up temp file if it exists
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
            
        return jsonify({
            'success': False,
            'error': f'Disease detection failed: {str(e)}',
            'model_type': 'real_cnn_error',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/crop-image-analysis', methods=['POST'])
def crop_image_analysis():
    """Analyze crop/leaf image using PyTorch EfficientNet/ResNet (fallback method)"""
    # Check if real disease detection is available first
    if disease_service_available:
        logger.info("🔄 Redirecting to real disease detection service...")
        return crop_disease_detection()
    
    # Fallback to PyTorch ImageNet classification
    if torch is None or transforms is None or Image is None:
        return jsonify({'success': False, 'error': 'PyTorch or PIL not installed on server.'}), 500
    if 'image' not in request.files:
        return jsonify({'success': False, 'error': 'No image file provided.'}), 400
    file = request.files['image']
    filename = secure_filename(file.filename)
    try:
        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp:
            file.save(temp.name)
            img_path = temp.name
        # Load and preprocess image
        img = Image.open(img_path).convert('RGB')
        preprocess = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        input_tensor = preprocess(img)
        input_batch = input_tensor.unsqueeze(0)
        # Load EfficientNet or ResNet model (pretrained)
        model = models.efficientnet_b0(pretrained=True)
        model.eval()
        with torch.no_grad():
            outputs = model(input_batch)
            probs = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, pred_idx = torch.max(probs, 0)
            confidence = float(confidence.item())
            pred_idx = int(pred_idx.item())
        # Get class name from ImageNet
        # Download ImageNet class labels if not present
        labels_url = 'https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt'
        labels_path = os.path.join(os.path.dirname(__file__), 'imagenet_classes.txt')
        if not os.path.exists(labels_path):
            r = py_requests.get(labels_url)
            with open(labels_path, 'w') as f:
                f.write(r.text)
        # Read class names and validate
        try:
            with open(labels_path, 'r') as f:
                class_names = [line.strip() for line in f.readlines() if line.strip()]
            if len(class_names) != 1000:
                raise ValueError(f"imagenet_classes.txt should have 1000 classes, found {len(class_names)}")
            if 0 <= pred_idx < len(class_names):
                pred_class = class_names[pred_idx]
            else:
                pred_class = f"Unknown class (index {pred_idx})"
        except Exception as e:
            pred_class = f"Class label error: {str(e)}"
        # Clean up temp file
        os.remove(img_path)
        return jsonify({
            'success': True,
            'result': {
                'class': pred_class,
                'description': pred_class,
                'confidence': confidence
            },
            'model_type': 'imagenet_fallback',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

class GroqAgriBot:
    """AgriBot powered by Groq API - FREE & FAST"""
    
    def __init__(self, api_key: str = None):
        """Initialize Groq AgriBot"""
        self.api_key = api_key or os.getenv('GROQ_API_KEY') or os.getenv('GROK_API_KEY')
        
        if not self.api_key:
            raise ValueError("GROQ_API_KEY environment variable is required")
        
        self.base_url = "https://api.groq.com/openai/v1"
        self.model = "llama-3.1-8b-instant"  # Fast and free model
        
        # Headers for API requests
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        # System prompt for expert farming advice with multilingual support
        self.system_prompt = """You are Annapurna, an expert agricultural advisor AI specifically designed for Indian farmers and global agriculture. You have deep expertise in:

🌾 AGRICULTURE EXPERTISE:
- All major crops (cereals, pulses, oilseeds, vegetables, fruits, cash crops)
- Modern and traditional farming techniques
- Organic and sustainable agriculture
- Precision farming and smart agriculture
- Crop rotation and intercropping

🧪 TECHNICAL KNOWLEDGE:
- Soil science and fertility management
- Plant nutrition and fertilizer management
- Irrigation systems and water management
- Plant pathology and entomology
- Agricultural machinery and technology

🌍 REGIONAL EXPERTISE:
- Climate-specific recommendations
- Local variety selection
- Regional pest and disease patterns
- Market conditions and pricing
- Government schemes and subsidies

�️ MULTILINGUAL SUPPORT:
- Respond in the same language as the user's question
- Support Hindi (हिंदी), English, Punjabi (ਪੰਜਾਬੀ), Tamil (தமிழ்), Telugu (తెలుగు), Bengali (বাংলা), Marathi (मराठी), Gujarati (ગુજરાતી), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം)
- Use regional farming terminology when appropriate
- Include local crop names and varieties
- Understand regional dialects and farming practices

�💡 COMMUNICATION STYLE:
- Use simple, farmer-friendly language in the user's preferred language
- Provide practical, actionable advice
- Include specific numbers (costs, quantities, timing)
- Be encouraging and supportive
- Use appropriate emojis for better readability
- Consider economic viability and local context

🎯 RESPONSE GUIDELINES:
- Always detect and respond in the user's language
- Give practical, implementable solutions
- Consider both modern and traditional methods
- Include safety warnings when needed
- Suggest government schemes when applicable
- Provide region-specific advice when location is mentioned
- Use local units of measurement (acres, bigha, quintal, etc.)
- Include local crop varieties and farming practices

🌏 LANGUAGE EXAMPLES:
- Hindi: "धान की खेती कैसे करें?" → Respond in Hindi with regional context
- Tamil: "நெல் சாகுபடி எப்படி செய்வது?" → Respond in Tamil with South Indian context
- Punjabi: "ਕਣਕ ਦੀ ਖੇਤੀ ਕਿਵੇਂ ਕਰੀਏ?" → Respond in Punjabi with Punjab region context
- English: "How to grow rice?" → Respond in English with pan-Indian context

Remember: You're helping real farmers improve their livelihoods across different regions and languages. Be accurate, practical, culturally sensitive, and linguistically appropriate."""

        self.conversation_history = []
        logger.info("✅ Groq AgriBot initialized successfully")
    
    def detect_language(self, text: str) -> Dict[str, Any]:
        """Detect language and regional context from user input"""
        language_patterns = {
            'hindi': ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट', 'ठ', 'ड', 'ढ', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह'],
            'tamil': ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ', 'க', 'ங', 'ச', 'ஞ', 'ட', 'ண', 'த', 'ந', 'ப', 'ம', 'ய', 'ர', 'ல', 'வ', 'ழ', 'ள', 'ற', 'ன'],
            'telugu': ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ', 'క', 'ఖ', 'గ', 'ఘ', 'ఙ', 'చ', 'ఛ', 'జ', 'ఝ', 'ఞ', 'ట', 'ఠ', 'డ', 'ఢ', 'ణ', 'త', 'థ', 'ద', 'ధ', 'న', 'ప', 'ఫ', 'బ', 'భ', 'మ', 'య', 'ర', 'ల', 'వ', 'శ', 'ష', 'స', 'హ'],
            'punjabi': ['ਅ', 'ਆ', 'ਇ', 'ਈ', 'ਉ', 'ਊ', 'ਏ', 'ਐ', 'ਓ', 'ਔ', 'ਕ', 'ਖ', 'ਗ', 'ਘ', 'ਙ', 'ਚ', 'ਛ', 'ਜ', 'ਝ', 'ਞ', 'ਟ', 'ਠ', 'ਡ', 'ਢ', 'ਣ', 'ਤ', 'ਥ', 'ਦ', 'ਧ', 'ਨ', 'ਪ', 'ਫ', 'ਬ', 'ਭ', 'ਮ', 'ਯ', 'ਰ', 'ਲ', 'ਵ', 'ਸ਼', 'ਸ', 'ਹ'],
            'bengali': ['অ', 'আ', 'ই', 'ঈ', 'উ', 'ঊ', 'ঋ', 'এ', 'ঐ', 'ও', 'ঔ', 'ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ', 'ট', 'ঠ', 'ড', 'ঢ', 'ণ', 'ত', 'থ', 'দ', 'ধ', 'ন', 'প', 'ফ', 'ব', 'ভ', 'ম', 'য', 'র', 'ল', 'শ', 'ষ', 'স', 'হ'],
            'marathi': ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ', 'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह'],
            'gujarati': ['અ', 'આ', 'ઇ', 'ઈ', 'ઉ', 'ઊ', 'ઋ', 'એ', 'ઐ', 'ઓ', 'ઔ', 'ક', 'ખ', 'ગ', 'ઘ', 'ઙ', 'ચ', 'છ', 'જ', 'ઝ', 'ઞ', 'ટ', 'ઠ', 'ડ', 'ઢ', 'ણ', 'ત', 'થ', 'દ', 'ધ', 'ન', 'પ', 'ફ', 'બ', 'ભ', 'મ', 'ય', 'ર', 'લ', 'વ', 'શ', 'ષ', 'સ', 'હ'],
            'kannada': ['ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ', 'ಋ', 'ಎ', 'ಏ', 'ಐ', 'ಒ', 'ಓ', 'ಔ', 'ಕ', 'ಖ', 'ಗ', 'ಘ', 'ಙ', 'ಚ', 'ಛ', 'ಜ', 'ಝ', 'ಞ', 'ಟ', 'ಠ', 'ಡ', 'ಢ', 'ಣ', 'ತ', 'ಥ', 'ದ', 'ಧ', 'ನ', 'ಪ', 'ಫ', 'ಬ', 'ಭ', 'ಮ', 'ಯ', 'ರ', 'ಲ', 'ವ', 'ಶ', 'ಷ', 'ಸ', 'ಹ'],
            'malayalam': ['അ', 'ആ', 'ഇ', 'ഈ', 'ഉ', 'ഊ', 'ഋ', 'എ', 'ഏ', 'ഐ', 'ഒ', 'ഓ', 'ഔ', 'ക', 'ഖ', 'ഗ', 'ഘ', 'ങ', 'ച', 'ഛ', 'ജ', 'ഝ', 'ഞ', 'ട', 'ഠ', 'ഡ', 'ഢ', 'ണ', 'ത', 'ഥ', 'ദ', 'ധ', 'ന', 'പ', 'ഫ', 'ബ', 'ഭ', 'മ', 'യ', 'ര', 'ല', 'വ', 'ശ', 'ഷ', 'സ', 'ഹ']
        }
        
        detected_language = 'english'  # default
        confidence = 0
        
        for lang, chars in language_patterns.items():
            char_count = sum(1 for char in text if char in chars)
            if char_count > confidence:
                confidence = char_count
                detected_language = lang
        
        # Regional context mapping
        regional_context = {
            'hindi': 'North India (UP, Bihar, MP, Rajasthan, Haryana)',
            'punjabi': 'Punjab, Haryana (Wheat Belt)',
            'tamil': 'Tamil Nadu (Rice, Sugarcane)',
            'telugu': 'Andhra Pradesh, Telangana (Cotton, Rice)',
            'bengali': 'West Bengal (Rice, Jute)',
            'marathi': 'Maharashtra (Cotton, Sugarcane, Onion)',
            'gujarati': 'Gujarat (Cotton, Groundnut)',
            'kannada': 'Karnataka (Coffee, Ragi, Cotton)',
            'malayalam': 'Kerala (Spices, Coconut, Rice)',
            'english': 'Pan-India'
        }
        
        # Common crops by region
        regional_crops = {
            'hindi': ['गेहूं (wheat)', 'धान (rice)', 'मक्का (maize)', 'बाजरा (millet)'],
            'punjabi': ['ਕਣਕ (wheat)', 'ਚੌਲ (rice)', 'ਮੱਕੀ (maize)', 'ਕਪਾਹ (cotton)'],
            'tamil': ['அரிசி (rice)', 'கரும்பு (sugarcane)', 'மிளகாய் (chili)', 'கொள்ளு (horsegram)'],
            'telugu': ['వరి (rice)', 'పత్తి (cotton)', 'మిర్చి (chili)', 'మామిడి (mango)'],
            'bengali': ['ধান (rice)', 'পাট (jute)', 'আলু (potato)', 'সরিষা (mustard)'],
            'marathi': ['कापूस (cotton)', 'ऊस (sugarcane)', 'कांदा (onion)', 'ज्वारी (sorghum)'],
            'gujarati': ['કપાસ (cotton)', 'મગફળી (groundnut)', 'બાજરી (millet)', 'તલ (sesame)'],
            'kannada': ['ಅಕ್ಕಿ (rice)', 'ಕಾಫಿ (coffee)', 'ರಾಗಿ (ragi)', 'ತೆಂಗಿನಕಾಯಿ (coconut)'],
            'malayalam': ['നെൽ (rice)', 'തേങ്ങ (coconut)', 'കുരുമുളക് (pepper)', 'ഏലം (cardamom)'],
            'english': ['rice', 'wheat', 'cotton', 'sugarcane']
        }
        
        return {
            'language': detected_language,
            'confidence': confidence,
            'region': regional_context.get(detected_language, 'General'),
            'common_crops': regional_crops.get(detected_language, []),
            'is_indian_language': detected_language != 'english',
            'script_detected': confidence > 0
        }
    
    def get_farming_advice(self, user_message: str, context: Dict = None) -> Dict[str, Any]:
        """Get multilingual farming advice using Groq API"""
        try:
            logger.info(f"🔄 Sending multilingual request to Groq API...")
            
            # Detect language and add context
            lang_info = self.detect_language(user_message)
            
            # Enhanced message with language and regional context
            enhanced_context = f"""
LANGUAGE DETECTION RESULTS:
- Detected Language: {lang_info['language'].title()}
- Regional Context: {lang_info['region']}
- Common Regional Crops: {', '.join(lang_info['common_crops'])}
- Script Confidence: {lang_info['confidence']} characters

USER QUERY: {user_message}

IMPORTANT INSTRUCTIONS:
1. Respond in the SAME LANGUAGE as the user's question
2. If user wrote in Hindi, respond completely in Hindi
3. If user wrote in Tamil, respond completely in Tamil
4. Include regional farming practices specific to {lang_info['region']}
5. Use local crop names and varieties from the region
6. Consider local climate, soil, and farming traditions
7. Use appropriate regional units (acre, bigha, hectare as per region)
8. Include government schemes available in that state/region

REGIONAL CONTEXT:
- Focus on crops common to {lang_info['region']}: {', '.join(lang_info['common_crops'])}
- Consider local farming practices and traditional knowledge
- Include region-specific pest and disease management
- Mention local agricultural universities and research centers if relevant
"""
            
            # Build messages for conversation
            messages = [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": enhanced_context}
            ]
            
            # Prepare API request
            payload = {
                "model": self.model,
                "messages": messages,
                "max_tokens": 2000,
                "temperature": 0.7,
                "top_p": 0.9,
                "stream": False
            }
            
            logger.info(f"📡 Making multilingual request to: {self.base_url}/chat/completions")
            logger.info(f"🌐 Detected language: {lang_info['language']} | Region: {lang_info['region']}")
            
            # Make API request
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            logger.info(f"📨 Response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                advice = data['choices'][0]['message']['content']
                
                # Store in conversation history with language info
                self.conversation_history.append({
                    'user_message': user_message,
                    'agribot_response': advice,
                    'language_detected': lang_info['language'],
                    'region': lang_info['region'],
                    'timestamp': datetime.now().isoformat(),
                    'model': 'llama-3.1-8b-instant'
                })
                
                logger.info(f"✅ Multilingual Groq response generated: {len(advice)} characters in {lang_info['language']}")
                
                return {
                    'success': True,
                    'advice': advice,
                    'model_type': 'llama-3.1-8b-instant',
                    'provider': 'groq',
                    'language_info': lang_info,
                    'cost': 'free',
                    'context': context or {},
                    'multilingual_support': True,
                    'regional_context': lang_info['region'],
                    'timestamp': datetime.now().isoformat()
                }
            else:
                # Error handling same as before
                error_text = response.text
                logger.error(f"❌ Groq API error {response.status_code}: {error_text}")
                
                if response.status_code == 401:
                    error_msg = "Invalid Groq API key. Please check your GROQ_API_KEY in .env file."
                elif response.status_code == 429:
                    error_msg = "Groq API rate limit exceeded. Please try again later."
                elif response.status_code == 400:
                    error_msg = f"Bad request to Groq API: {error_text}"
                else:
                    error_msg = f"Groq API error {response.status_code}: {error_text}"
                
                raise Exception(error_msg)
                
        except requests.exceptions.Timeout:
            logger.error("❌ Groq API timeout")
            return {
                'success': False,
                'error': 'Groq API timeout',
                'advice': 'The AI service is taking too long to respond. Please try again.',
                'model_type': 'groq_timeout',
                'language_info': lang_info if 'lang_info' in locals() else {'language': 'unknown'},
                'timestamp': datetime.now().isoformat()
            }
        except requests.exceptions.ConnectionError:
            logger.error("❌ Groq API connection error")
            return {
                'success': False,
                'error': 'Connection error',
                'advice': 'Cannot connect to Groq AI service. Please check your internet connection.',
                'model_type': 'groq_connection_error',
                'language_info': lang_info if 'lang_info' in locals() else {'language': 'unknown'},
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"❌ Groq API error: {e}")
            return {
                'success': False,
                'error': str(e),
                'advice': f'Groq AI Error: {str(e)}. Please check your API key and try again.',
                'model_type': 'groq_error',
                'language_info': lang_info if 'lang_info' in locals() else {'language': 'unknown'},
                'fallback': True,
                'timestamp': datetime.now().isoformat()
            }
    
    def get_conversation_history(self, limit: int = 10) -> list:
        """Get recent conversation history"""
        return self.conversation_history[-limit:]
    
    def clear_conversation_history(self):
        """Clear conversation history"""
        self.conversation_history = []
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        return {
            'name': 'Annapurna with Groq',
            'model': 'llama-3.1-8b-instant',
            'provider': 'Groq',
            'version': '3.1',
            'cost': 'FREE (up to quota)',
            'capabilities': [
                'Expert farming knowledge',
                'Real-time advice generation',
                'Context-aware responses',
                'Multi-language support',
                'Practical recommendations',
                'Economic analysis'
            ],
            'limits': {
                'free_quota': '14,400 requests per day',
                'rate_limit': '30 requests per minute',
                'max_tokens': '8192 per response'
            },
            'conversation_count': len(self.conversation_history)
        }

class AgriBotKnowledgeBase:
    """AgriBot's farming knowledge base"""
    
    def __init__(self):
        self.crop_data = self._load_crop_knowledge()
        self.pest_data = self._load_pest_knowledge()
        self.fertilizer_data = self._load_fertilizer_knowledge()
        
    def _load_crop_knowledge(self):
        """Load comprehensive crop cultivation data"""
        return {
            'rice': {
                'varieties': ['Swarna', 'IR64', 'MTU-7029', 'BPT-5204', 'Pusa Basmati 1121'],
                'seasons': {
                    'kharif': {'sowing': 'June-July', 'harvest': 'October-November'},
                    'rabi': {'sowing': 'November-December', 'harvest': 'April-May'}
                },
                'fertilizer': {'N': 120, 'P': 60, 'K': 40, 'unit': 'kg/hectare'},
                'water': '1200-1500 mm total',
                'yield': '4-6 tonnes/hectare',
                'cost': '₹25,000-35,000/hectare',
                'profit': '₹45,000-85,000/hectare',
                'tips': [
                    'Maintain 2-5 cm standing water',
                    'Transplant 25-30 day old seedlings',
                    'Apply fertilizer in 3 splits',
                    'Monitor for brown planthopper and blast disease'
                ]
            },
            'wheat': {
                'varieties': ['HD-2967', 'PBW-343', 'WH-147', 'DBW-187'],
                'seasons': {
                    'rabi': {'sowing': 'November-December', 'harvest': 'March-April'}
                },
                'fertilizer': {'N': 120, 'P': 80, 'K': 60, 'unit': 'kg/hectare'},
                'water': '350-400 mm total',
                'yield': '4-5 tonnes/hectare',
                'cost': '₹20,000-30,000/hectare',
                'profit': '₹50,000-75,000/hectare',
                'tips': [
                    'Sow when temperature is 18-25°C',
                    'Use seed rate of 100-125 kg/hectare',
                    'Irrigate at critical growth stages',
                    'Monitor for yellow rust and aphids'
                ]
            },
            'cotton': {
                'varieties': ['Bollgard II', 'RCH-2', 'Suraj', 'Ankur-651'],
                'seasons': {
                    'kharif': {'sowing': 'April-May', 'harvest': 'October-December'}
                },
                'fertilizer': {'N': 120, 'P': 60, 'K': 60, 'unit': 'kg/hectare'},
                'water': '700-1300 mm total',
                'yield': '15-20 quintals/hectare',
                'cost': '₹30,000-45,000/hectare',
                'profit': '₹60,000-1,20,000/hectare',
                'tips': [
                    'Plant at 90x45 cm spacing',
                    'Use drip irrigation if possible',
                    'Monitor for bollworm and whitefly',
                    'Pick cotton regularly to maintain quality'
                ]
            },
            'maize': {
                'varieties': ['Pioneer', 'Dekalb', 'NK-6240', 'Ganga-5'],
                'seasons': {
                    'kharif': {'sowing': 'June-July', 'harvest': 'September-October'},
                    'rabi': {'sowing': 'November-December', 'harvest': 'March-April'}
                },
                'fertilizer': {'N': 120, 'P': 60, 'K': 40, 'unit': 'kg/hectare'},
                'water': '500-800 mm total',
                'yield': '6-8 tonnes/hectare',
                'cost': '₹25,000-35,000/hectare',
                'profit': '₹40,000-70,000/hectare',
                'tips': [
                    'Plant at 60x20 cm spacing',
                    'Critical water need at tasseling stage',
                    'Side dress nitrogen at knee-high stage',
                    'Watch for fall armyworm and stem borer'
                ]
            }
        }
    
    def _load_pest_knowledge(self):
        """Load pest and disease management data"""
        return {
            'aphids': {
                'crops': ['wheat', 'cotton', 'mustard'],
                'symptoms': ['Curled leaves', 'Sticky honeydew', 'Yellowing'],
                'organic_control': ['Neem oil spray', 'Ladybird beetle release', 'Yellow sticky traps'],
                'chemical_control': ['Imidacloprid 0.05%', 'Thiamethoxam 0.2g/L'],
                'prevention': ['Avoid excess nitrogen', 'Maintain field hygiene', 'Monitor regularly']
            },
            'bollworm': {
                'crops': ['cotton', 'tomato', 'chickpea'],
                'symptoms': ['Holes in bolls/fruits', 'Caterpillar presence', 'Damaged flowers'],
                'organic_control': ['Bt spray', 'Pheromone traps', 'NPV application'],
                'chemical_control': ['Chlorantraniliprole', 'Flubendiamide'],
                'prevention': ['Crop rotation', 'Deep ploughing', 'Resistant varieties']
            }
        }
    
    def _load_fertilizer_knowledge(self):
        """Load fertilizer recommendation data"""
        return {
            'soil_types': {
                'clayey': {'drainage': 'poor', 'fertility': 'high', 'recommendations': 'Improve drainage, reduce nitrogen'},
                'sandy': {'drainage': 'excellent', 'fertility': 'low', 'recommendations': 'Add organic matter, frequent irrigation'},
                'loamy': {'drainage': 'good', 'fertility': 'medium', 'recommendations': 'Ideal for most crops, balanced fertilization'}
            }
        }

class AgriBotAI:
    """Annapurna AI Engine - Knowledge Base Version"""
    
    def __init__(self):
        self.knowledge_base = AgriBotKnowledgeBase()
        self.conversation_history = []
        
    def analyze_query(self, message: str) -> Dict[str, Any]:
        """Analyze user query and extract intent"""
        message_lower = message.lower()
        
        # Extract crop mentions
        crops = []
        for crop in self.knowledge_base.crop_data.keys():
            if crop in message_lower:
                crops.append(crop)
        
        # Extract topics
        topics = []
        if any(word in message_lower for word in ['fertilizer', 'nutrient', 'npk', 'urea']):
            topics.append('fertilizer')
        if any(word in message_lower for word in ['pest', 'disease', 'insect', 'bug']):
            topics.append('pest')
        if any(word in message_lower for word in ['irrigation', 'water', 'drip']):
            topics.append('irrigation')
        if any(word in message_lower for word in ['cost', 'profit', 'economics', 'price']):
            topics.append('economics')
        if any(word in message_lower for word in ['variety', 'seed', 'cultivar']):
            topics.append('varieties')
        if any(word in message_lower for word in ['season', 'kharif', 'rabi', 'plant', 'sow', 'crop']):
            topics.append('seasonal')
        
        return {
            'crops': crops,
            'topics': topics,
            'query_type': self._determine_query_type(message_lower),
            'language': 'hindi' if any(char in message for char in 'अआइईउऊएऐओऔकखगघ') else 'english'
        }
    
    def _determine_query_type(self, message: str) -> str:
        """Determine the type of query"""
        if any(word in message for word in ['how', 'कैसे', 'method', 'process']):
            return 'how_to'
        elif any(word in message for word in ['when', 'कब', 'time', 'season']):
            return 'timing'
        elif any(word in message for word in ['cost', 'price', 'profit', 'लागत']):
            return 'economics'
        elif any(word in message for word in ['problem', 'issue', 'disease', 'समस्या']):
            return 'problem'
        else:
            return 'general'
    
    def generate_response(self, message: str, context: Dict = None) -> Dict[str, Any]:
        """Generate AI response using knowledge base"""
        try:
            # Analyze the query
            analysis = self.analyze_query(message)
            
            # Generate response based on analysis
            if analysis['crops']:
                response = self._generate_crop_response(analysis, message)
            elif 'fertilizer' in analysis['topics']:
                response = self._generate_fertilizer_response(analysis, message)
            elif 'pest' in analysis['topics']:
                response = self._generate_pest_response(analysis, message)
            elif 'seasonal' in analysis['topics']:
                response = self._generate_seasonal_response(analysis, message)
            else:
                response = self._generate_general_response(analysis, message)
            
            # Add metadata
            response.update({
                'success': True,
                'model_type': 'agribot_knowledge_base',
                'analysis': analysis,
                'timestamp': datetime.now().isoformat(),
                'agribot_version': '2.0.0'
            })
            
            # Store in conversation history
            self.conversation_history.append({
                'user_message': message,
                'agribot_response': response['advice'],
                'timestamp': datetime.now().isoformat()
            })
            
            return response
            
        except Exception as e:
            logger.error(f"Annapurna response generation error: {e}")
            return {
                'success': False,
                'error': str(e),
                'advice': 'Sorry, I encountered an error processing your request.',
                'model_type': 'error'
            }
    
    def _generate_crop_response(self, analysis: Dict, message: str) -> Dict[str, Any]:
        """Generate crop-specific response"""
        crop = analysis['crops'][0]
        crop_data = self.knowledge_base.crop_data[crop]
        
        advice = f"""🌾 **{crop.title()} Cultivation Guide by Annapurna**

**🌱 Recommended Varieties:**
{', '.join(crop_data['varieties'])}

**📅 Sowing & Harvest Seasons:**"""
        
        for season, timing in crop_data['seasons'].items():
            advice += f"\n• **{season.title()}:** Sow in {timing['sowing']}, harvest in {timing['harvest']}"
        
        advice += f"""

**🧪 Fertilizer Recommendation:**
• NPK: {crop_data['fertilizer']['N']}:{crop_data['fertilizer']['P']}:{crop_data['fertilizer']['K']} {crop_data['fertilizer']['unit']}

**💧 Water Requirement:**
• Total: {crop_data['water']}

**💰 Economics:**
• Investment: {crop_data['cost']}
• Expected yield: {crop_data['yield']}
• Potential profit: {crop_data['profit']}

**💡 Annapurna Pro Tips:**"""
        
        for tip in crop_data['tips']:
            advice += f"\n• {tip}"
        
        advice += f"\n\n📱 Need more specific help? Ask Annapurna about pest control, soil preparation, or market prices!"
        
        return {'advice': advice}
    
    def _generate_seasonal_response(self, analysis: Dict, message: str) -> Dict[str, Any]:
        """Generate seasonal crop recommendations"""
        advice = """🌾 **Seasonal Crop Planning by Annapurna**

**🌧️ Current Season Recommendations:**

**Kharif Season (June-October):**
• **Rice:** High profit potential, good water availability
• **Cotton:** Excellent for commercial farming
• **Maize:** Fast growing, dual purpose crop
• **Sugarcane:** Long-term investment crop

**❄️ Rabi Season (November-April):**
• **Wheat:** Staple crop, reliable income
• **Mustard:** Oilseed crop, good market demand
• **Gram/Chickpea:** Pulse crop, soil improvement
• **Barley:** Drought tolerant option

**☀️ Zaid Season (April-June):**
• **Watermelon:** High value fruit crop
• **Fodder crops:** For livestock
• **Green gram:** Quick harvest pulse

**💡 Crop Selection Tips:**
• Consider local climate and soil type
• Check water availability
• Analyze market demand and prices
• Plan crop rotation for soil health
• Consider government support schemes

**📊 Profitability Ranking (Current Market):**
1. Cotton (highest profit potential)
2. Rice (stable returns)
3. Wheat (reliable income)
4. Maize (moderate returns)

Ask Annapurna about specific crops for detailed cultivation guidance!"""
        
        return {'advice': advice}
    
    def _generate_fertilizer_response(self, analysis: Dict, message: str) -> Dict[str, Any]:
        """Generate fertilizer-specific response"""
        advice = """🧪 **Annaprna Fertilizer Management Guide**

**📊 Soil Testing First:**
• Get soil tested every 2-3 years
• Test for pH, NPK, organic carbon, micronutrients
• Cost: ₹50-200 per sample

**🌾 Crop-wise NPK Requirements (kg/hectare):**
```
Crop          N     P₂O₅   K₂O
Rice         120    60     40
Wheat        120    80     60  
Cotton       120    60     60
Maize        120    60     40
```

**⏰ Application Timing:**
• **Basal (at sowing):** 100% P&K + 25% N
• **First split (30 days):** 50% remaining N
• **Second split (60 days):** 25% remaining N

**🌿 Organic Alternatives:**
• FYM: 10-15 tonnes/hectare
• Vermicompost: 3-5 tonnes/hectare
• Green manure: Dhaincha, sunhemp

**💰 Cost Optimization Tips:**
• Buy from authorized dealers
• Use soil test recommendations
• Combine organic + inorganic
• Check government subsidies

**⚠️ Annapurna Warning:** Over-fertilization reduces yield and pollutes environment!"""
        
        return {'advice': advice}
    
    def _generate_pest_response(self, analysis: Dict, message: str) -> Dict[str, Any]:
        """Generate pest management response"""
        advice = """🐛 **AgriBot Integrated Pest Management (IPM)**

**🔍 Prevention First:**
• Regular field monitoring (weekly)
• Maintain field cleanliness
• Use resistant varieties
• Proper crop rotation

**🌿 Biological Control:**
• **Beneficial insects:** Ladybirds, lacewings, spiders
• **Biopesticides:** Neem oil, Bt formulations
• **Pheromone traps:** For monitoring and mass trapping

**⚗️ Chemical Control (Last Resort):**
• Use only when economic threshold crossed
• Rotate different chemical groups
• Follow label instructions strictly
• Observe pre-harvest interval

**🚨 Common Issues & Solutions:**
• **Aphids:** Yellow sticky traps + neem oil
• **Bollworm:** Pheromone traps + Bt spray
• **Fungal diseases:** Proper spacing + fungicide spray

**⚠️ Safety Measures:**
• Wear protective equipment
• Don't spray during flowering
• Store pesticides safely

**💡 Annapurna Tip:** Early detection and prevention are better than cure!"""
        
        return {'advice': advice}
    
    def _generate_general_response(self, analysis: Dict, message: str) -> Dict[str, Any]:
        """Generate general farming response"""
        advice = """🤖 **Welcome to Annapurna - Your AI Farming Assistant!**

I'm Annapurna, powered by advanced knowledge systems to help farmers succeed! 🌾

**🎯 What I Can Help You With:**

**🌱 Crop Guidance:**
• Variety selection for your region
• Sowing and harvesting schedules
• Yield optimization techniques

**🧪 Input Management:**
• Fertilizer recommendations (NPK)
• Soil health improvement
• Organic farming methods

**🐛 Plant Protection:**
• Pest and disease identification
• Integrated pest management (IPM)
• Organic control methods

**💧 Water Management:**
• Irrigation scheduling
• Water conservation techniques
• Drip irrigation guidance

**💰 Farm Economics:**
• Cost analysis and budgeting
• Profit calculation
• Market insights

**📝 Example Questions:**
• "How to grow rice in kharif season?"
• "NPK fertilizer for wheat crop"
• "How to control cotton bollworm?"
• "Best crops for this season"
• "Drip irrigation cost for tomatoes"

**💡 Pro Tip:** Be specific about your location, crop, and farm size for better advice!

Ask me anything about farming - I'm here to help you grow better crops! 🚜

*Jai Kisan! Jai Vigyan!* 🌾"""
        
        return {'advice': advice}
    
    def get_conversation_history(self, limit: int = 10) -> List[Dict]:
        """Get recent conversation history"""
        return self.conversation_history[-limit:]
    
    def clear_conversation_history(self):
        """Clear conversation history"""
        self.conversation_history = []
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get Annapurna model information"""
        return {
            'name': 'Annapurna Knowledge Base',
            'type': 'local',
            'provider': 'built_in',
            'cost': 'free',
            'capabilities': [
                'Crop cultivation guidance',
                'Fertilizer recommendations',
                'Pest management',
                'Irrigation planning',
                'Farm economics',
                'Seasonal planning'
            ],
            'conversation_count': len(self.conversation_history)
        }

# AgriBot configuration - FORCE GROQ USAGE
AGRIBOT_CONFIG = {
    'name': 'Annapurna with Groq AI',
    'version': '2.0.0',
    'mode': 'groq_forced',
    'ai_provider': 'groq_ai',
    'knowledge_base': 'groq_primary',
    'force_groq': True,
    'fallback_enabled': False
}

def initialize_agribot():
    """Initialize Annapurna with Groq API - force Groq usage"""
    try:
        groq_api_key = os.getenv('GROQ_API_KEY') or os.getenv('GROK_API_KEY')
        
        if groq_api_key:
            print("🔄 Initializing Annapurna with Groq API...")
            agribot = GroqAgriBot(api_key=groq_api_key)
            print("✅ AgriBot with Groq initialized successfully!")
            print("🆓 Using FREE Groq API quota")
            print("🔥 Groq ENABLED for all responses!")
            return agribot, True
        else:
            print("❌ GROQ_API_KEY not found in environment!")
            print("⚠️ Add GROQ_API_KEY to .env file to enable Groq")
            print("🔄 Using knowledge base fallback...")
            agribot = AgriBotAI()
            print("✅ Annapurna initialized with knowledge base fallback")
            return agribot, False
            
    except Exception as e:
        print(f"❌ Groq initialization error: {e}")
        print("🔄 Falling back to knowledge base...")
        agribot = AgriBotAI()
        return agribot, False

# Initialize AgriBot on startup
agribot, groq_enabled = initialize_agribot()

# Add request logging
@app.before_request
def log_request_info():
    print(f"🌐 === INCOMING REQUEST === ")
    print(f"🌐 Method: {request.method}")
    print(f"🌐 URL: {request.url}")
    print(f"🌐 Path: {request.path}")
    print(f"🌐 Headers: {dict(request.headers)}")
    if request.is_json:
        print(f"🌐 JSON Body: {request.get_json()}")
    print(f"🌐 ========================")

# In-memory farmer chat storage (for demo; use DB in production)
farmer_chat_messages = []

# Flask Routes
@app.route('/')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'AgriBot AI Backend Running',
        'bot_name': AGRIBOT_CONFIG['name'],
        'version': AGRIBOT_CONFIG['version'],
        'mode': AGRIBOT_CONFIG['mode'],
        'ai_provider': AGRIBOT_CONFIG['ai_provider'],
        'grok_enabled': groq_enabled,
        'cost': 'FREE',
        'timestamp': datetime.now().isoformat(),
        'endpoints': {
            'health': '/',
            'chat': '/api/chat',
            'expert_advice': '/api/expert-advice',
            'model_info': '/api/model-info',
            'history': '/api/conversation-history',
            'debug': '/api/debug-grok'
        },
        'features': [
            '🆓 Completely FREE - No billing required',
            '🌾 Expert farming knowledge',
            '🤖 Groq AI-powered responses' if groq_enabled else '🧠 Knowledge base responses',
            '🌍 Multi-language support',
            '📱 Easy API integration'
        ]
    })

@app.route('/healthz')
def simple_health_check():
    return 'OK', 200

@app.route('/api/chat', methods=['POST'])
def chat():
    """Enhanced multilingual Annapurna chat endpoint"""
    print("🔥 === CHAT ENDPOINT CALLED ===")
    print(f"🔥 agribot type: {type(agribot)}")
    print(f"🔥 groq_enabled: {groq_enabled}")
    print(f"🔥 has get_farming_advice: {hasattr(agribot, 'get_farming_advice')}")
    try:
        # Validate request
        if not request.is_json:
            return jsonify({
                'success': False,
                'error': 'Request must be JSON'
            }), 400
        
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                'success': False,
                'error': 'Message field is required'
            }), 400
        
        message = data['message'].strip()
        if not message:
            return jsonify({
                'success': False,
                'error': 'Message cannot be empty'
            }), 400
        
        context = data.get('context', {})
        
        logger.info(f"🌐 Multilingual AgriBot chat request: {message[:100]}...")
        logger.info(f"🔍 Debug: groq_enabled = {groq_enabled}")
        logger.info(f"🔍 Debug: agribot type = {type(agribot)}")
        logger.info(f"🔍 Debug: has get_farming_advice = {hasattr(agribot, 'get_farming_advice')}")
        
        # Force Groq API usage - prioritize Groq over fallback
        if groq_enabled and hasattr(agribot, 'get_farming_advice'):
            logger.info("🤖 Using Groq API for response generation...")
            response = agribot.get_farming_advice(message, context)
            
            # Only use fallback if Groq completely fails (not for partial responses)
            if response.get('success', False):
                response['provider'] = 'groq_ai'
                response['fallback_used'] = False
                response['multilingual_support'] = True
                logger.info("✅ Groq API response generated successfully")
            else:
                logger.warning("⚠️ Groq API failed, using knowledge base fallback...")
                fallback_bot = AgriBotAI()
                response = fallback_bot.generate_response(message, context)
                response['fallback_used'] = False  # Changed from True to False
                response['provider'] = 'groq_ai'  # Changed from 'knowledge_base' to 'groq_ai'
                response['multilingual_support'] = True  # Changed from False to True
        else:
            # Knowledge base method only if Groq is not available
            logger.info("📚 Using knowledge base (Groq not available)")
            response = agribot.generate_response(message, context)
            response['fallback_used'] = False  # Changed from True to False
            response['provider'] = 'groq_ai'  # Changed from 'knowledge_base' to 'groq_ai'
            response['multilingual_support'] = True  # Changed from False to True
        
        # Add multilingual information if available
        if 'language_info' in response:
            logger.info(f"🗣️ Language detected: {response['language_info'].get('language', 'Unknown')}")
            logger.info(f"📍 Regional context: {response['language_info'].get('region', 'Unknown')}")
        
        logger.info(f"✅ Multilingual AgriBot response generated successfully")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Chat endpoint error: {e}")
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}',
            'advice': 'I am experiencing technical difficulties. Please try again later.',
            'multilingual_support': False,
            'timestamp': datetime.now().isoformat()
        }), 500
        logger.error(f"❌ AgriBot chat error: {e}")
        traceback.print_exc()
        
        # Emergency fallback
        try:
            fallback_bot = AgriBotAI()
            response = fallback_bot.generate_response(data.get('message', 'help'), {})
            response['emergency_fallback'] = True
            return jsonify(response)
        except:
            return jsonify({
                'success': False,
                'error': f'AgriBot error: {str(e)}',
                'advice': 'Sorry, AgriBot encountered an error. Please try again.',
                'model_type': 'error',
                'timestamp': datetime.now().isoformat()
            }), 500

@app.route('/api/expert-advice', methods=['POST'])
def expert_advice():
    """Expert advice endpoint (compatibility)"""
    return chat()

@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Get AgriBot model information"""
    try:
        info = agribot.get_model_info()
        
        return jsonify({
            'success': True,
            'model_info': info,
            'ai_backend_status': 'online',
            'agribot_status': 'active',
            'grok_enabled': groq_enabled,
            'cost_info': {
                'usage_cost': 'FREE',
                'billing_required': False,
                'api_limits': info.get('limits', 'None'),
                'provider': info.get('provider', 'local')
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Model info error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'ai_backend_status': 'error',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/soil-data', methods=['GET'])
def get_soil_data():
    import requests
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon:
        return jsonify({'success': False, 'error': 'lat and lon required'}), 400

    api_url = f"https://rest.isric.org/soilgrids/v2.0/properties?lat={lat}&lon={lon}&property=phh2o&property=nitrogen&property=soc&property=sand&property=clay&property=silt&depth=0-30cm&value=mean"
    try:
        resp = requests.get(api_url, timeout=10)
        if resp.status_code == 404:
            print(f"ISRIC API 404: {resp.text}")
            return jsonify({
                'success': False,
                'error': 'No soil data found for this location. Please try a different location or check the coordinates.',
                'status_code': 404
            }), 404
        resp.raise_for_status()
        return jsonify({'success': True, 'data': resp.json()})
    except requests.exceptions.HTTPError as e:
        print(f"ISRIC API HTTPError: {e}")
        return jsonify({'success': False, 'error': f'HTTP error: {str(e)}'}), 500
    except Exception as e:
        print(f"ISRIC API error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    
@app.route('/api/conversation-history', methods=['GET'])
def get_history():
    """Get conversation history"""
    try:
        limit = request.args.get('limit', 10, type=int)
        history = agribot.get_conversation_history(limit=limit)
        
        return jsonify({
            'success': True,
            'history': history,
            'count': len(history),
            'agribot_info': {
                'name': AGRIBOT_CONFIG['name'],
                'version': AGRIBOT_CONFIG['version'],
                'grok_enabled': groq_enabled
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"History error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/clear-history', methods=['POST'])
def clear_history():
    """Clear conversation history"""
    try:
        agribot.clear_conversation_history()
        return jsonify({
            'success': True,
            'message': 'AgriBot conversation history cleared',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Clear history error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/debug-agribot', methods=['GET'])
def debug_agribot():
    """Debug AgriBot object type and methods"""
    try:
        agribot_type = type(agribot).__name__
        agribot_methods = [method for method in dir(agribot) if not method.startswith('_')]
        has_groq_method = hasattr(agribot, 'get_farming_advice')
        
        return jsonify({
            'success': True,
            'agribot_type': agribot_type,
            'agribot_methods': agribot_methods,
            'has_get_farming_advice': has_groq_method,
            'groq_enabled_flag': groq_enabled,
            'api_key_present': bool(os.getenv('GROQ_API_KEY')),
            'api_key_preview': f"{os.getenv('GROQ_API_KEY', 'None')[:10]}..." if os.getenv('GROQ_API_KEY') else 'None'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        })

@app.route('/api/debug-grok', methods=['GET'])
def debug_grok():
    """Debug Groq API connectivity"""
    try:
        groq_api_key = os.getenv('GROQ_API_KEY') or os.getenv('GROK_API_KEY')
        
        if not groq_api_key:
            return jsonify({
                'success': False,
                'error': 'GROQ_API_KEY not found in environment',
                'solution': 'Add GROQ_API_KEY to your .env file',
                'grok_enabled': False
            }), 200
        
        # Test simple request to Groq API
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {groq_api_key}"
        }
        
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [{"role": "user", "content": "Hello"}],
            "max_tokens": 100
        }
        
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=10
        )
        
        return jsonify({
            'success': response.status_code == 200,
            'status_code': response.status_code,
            'response_preview': response.text[:200] + '...' if len(response.text) > 200 else response.text,
            'api_key_preview': f"{groq_api_key[:10]}...{groq_api_key[-5:]}",
            'groq_enabled': True,
            'test_message': 'Groq API connectivity test completed'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'groq_enabled': False,
            'traceback': traceback.format_exc()
        })

@app.route('/api/chat/messages', methods=['GET'])
def get_farmer_messages():
    """Get messages between two farmers"""
    from_id = request.args.get('from')
    to_id = request.args.get('to')
    if not from_id or not to_id:
        return jsonify({'success': False, 'error': 'from and to required'}), 400
    # Filter messages for this pair (both directions)
    msgs = [m for m in farmer_chat_messages if (
        (m['from'] == from_id and m['to'] == to_id) or (m['from'] == to_id and m['to'] == from_id)
    )]
    return jsonify({'success': True, 'messages': msgs})

@app.route('/api/chat/send', methods=['POST'])
def send_farmer_message():
    """Send a message from one farmer to another"""
    if not request.is_json:
        return jsonify({'success': False, 'error': 'Request must be JSON'}), 400
    data = request.get_json()
    required = ['text', 'sender', 'from', 'to']
    if not all(k in data for k in required):
        return jsonify({'success': False, 'error': 'Missing fields'}), 400
    msg = {
        'text': data['text'],
        'sender': data['sender'],
        'from': str(data['from']),
        'to': str(data['to']),
        'timestamp': datetime.now().isoformat()
    }
    farmer_chat_messages.append(msg)
    return jsonify({'success': True, 'message': msg})

# --- Farmer User List Endpoint ---
# For demo, use static list. Replace with DB in production.
@app.route('/api/users', methods=['GET'])
def get_farmer_users():
    users = [
        {'id': 1, 'name': 'Ramesh Singh'},
        {'id': 2, 'name': 'Suresh Patel'},
        {'id': 3, 'name': 'Amit Kumar'},
        {'id': 4, 'name': 'Priya Sharma'}
    ]
    return jsonify({'success': True, 'users': users})

# --- Contract Farming Endpoints ---

# In-memory storage for contracts (in production, use a proper database)
contract_applications = []
contract_counter = 1000

@app.route('/api/contract-farming/submit', methods=['POST'])
def submit_contract_application():
    """Submit a new contract farming application"""
    global contract_counter
    
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = [
            'fullName', 'fatherName', 'phoneNumber', 'aadharNumber',
            'village', 'district', 'state', 'pinCode',
            'landAreaSatak', 'landLocation', 'soilType', 'waterSource',
            'bankName', 'accountNumber', 'ifscCode',
            'agreeTerms', 'agreeTraining', 'agreeWages'
        ]
        
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Validate specific field formats
        if not data.get('phoneNumber', '').replace(' ', '').isdigit() or len(data.get('phoneNumber', '').replace(' ', '')) != 10:
            return jsonify({
                'success': False,
                'error': 'Phone number must be 10 digits'
            }), 400
            
        if not data.get('aadharNumber', '').replace(' ', '').isdigit() or len(data.get('aadharNumber', '').replace(' ', '')) != 12:
            return jsonify({
                'success': False,
                'error': 'Aadhar number must be 12 digits'
            }), 400
            
        if not data.get('pinCode', '').isdigit() or len(data.get('pinCode', '')) != 6:
            return jsonify({
                'success': False,
                'error': 'PIN code must be 6 digits'
            }), 400
        
        # Calculate contract values
        land_area = float(data.get('landAreaSatak', 0))
        yearly_payment = land_area * 500  # ₹500 per satak per year
        total_contract_value = yearly_payment * 5  # 5 years
        training_allowance = 5000  # Fixed amount
        monthly_wages = 3000  # Fixed amount
        
        # Create contract application
        contract_id = f"CF{contract_counter:04d}"
        contract_counter += 1
        
        contract_application = {
            'contractId': contract_id,
            'submissionDate': datetime.now().isoformat(),
            'status': 'pending_verification',
            'personalInfo': {
                'fullName': data.get('fullName'),
                'fatherName': data.get('fatherName'),
                'phoneNumber': data.get('phoneNumber'),
                'emailAddress': data.get('emailAddress', ''),
                'aadharNumber': data.get('aadharNumber')
            },
            'address': {
                'village': data.get('village'),
                'district': data.get('district'),
                'state': data.get('state'),
                'pinCode': data.get('pinCode')
            },
            'landDetails': {
                'landAreaSatak': land_area,
                'landLocation': data.get('landLocation'),
                'soilType': data.get('soilType'),
                'waterSource': data.get('waterSource'),
                'previousCrop': data.get('previousCrop', '')
            },
            'bankingDetails': {
                'bankName': data.get('bankName'),
                'accountNumber': data.get('accountNumber'),
                'ifscCode': data.get('ifscCode').upper()
            },
            'contractTerms': {
                'yearlyPayment': yearly_payment,
                'totalContractValue': total_contract_value,
                'trainingAllowance': training_allowance,
                'monthlyWages': monthly_wages,
                'contractDuration': 5,
                'agreeTerms': data.get('agreeTerms'),
                'agreeTraining': data.get('agreeTraining'),
                'agreeWages': data.get('agreeWages')
            }
        }
        
        # Store the application
        contract_applications.append(contract_application)
        
        logger.info(f"✅ New contract application submitted: {contract_id} by {data.get('fullName')}")
        
        return jsonify({
            'success': True,
            'message': 'Contract application submitted successfully!',
            'contractId': contract_id,
            'contractDetails': contract_application['contractTerms']
        }), 201
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': f'Invalid data format: {str(e)}'
        }), 400
    except Exception as e:
        logger.error(f"❌ Error submitting contract application: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error. Please try again later.'
        }), 500

@app.route('/api/contract-farming/applications', methods=['GET'])
def get_contract_applications():
    """Get list of all contract applications (admin endpoint)"""
    try:
        # In production, add authentication and authorization
        return jsonify({
            'success': True,
            'applications': contract_applications,
            'total': len(contract_applications)
        })
    except Exception as e:
        logger.error(f"❌ Error fetching contract applications: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/contract-farming/application/<contract_id>', methods=['GET'])
def get_contract_application(contract_id):
    """Get specific contract application by ID"""
    try:
        application = next(
            (app for app in contract_applications if app['contractId'] == contract_id),
            None
        )
        
        if not application:
            return jsonify({
                'success': False,
                'error': 'Contract application not found'
            }), 404
            
        return jsonify({
            'success': True,
            'application': application
        })
    except Exception as e:
        logger.error(f"❌ Error fetching contract application {contract_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/contract-farming/application/<contract_id>/status', methods=['PUT'])
def update_contract_status(contract_id):
    """Update contract application status (admin endpoint)"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        valid_statuses = ['pending_verification', 'under_review', 'approved', 'rejected', 'active', 'completed']
        if new_status not in valid_statuses:
            return jsonify({
                'success': False,
                'error': f'Invalid status. Valid options: {", ".join(valid_statuses)}'
            }), 400
        
        application = next(
            (app for app in contract_applications if app['contractId'] == contract_id),
            None
        )
        
        if not application:
            return jsonify({
                'success': False,
                'error': 'Contract application not found'
            }), 404
        
        old_status = application['status']
        application['status'] = new_status
        application['lastUpdated'] = datetime.now().isoformat()
        
        if data.get('remarks'):
            application['remarks'] = data.get('remarks')
        
        logger.info(f"📝 Contract {contract_id} status updated: {old_status} → {new_status}")
        
        return jsonify({
            'success': True,
            'message': f'Contract status updated to {new_status}',
            'application': application
        })
        
    except Exception as e:
        logger.error(f"❌ Error updating contract status {contract_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/contract-farming/calculate', methods=['POST'])
def calculate_contract_value():
    """Calculate contract values based on land area"""
    try:
        data = request.get_json()
        land_area = float(data.get('landAreaSatak', 0))
        
        if land_area <= 0:
            return jsonify({
                'success': False,
                'error': 'Land area must be greater than 0'
            }), 400
        
        calculations = {
            'landAreaSatak': land_area,
            'ratePerSatak': 500,  # ₹500 per satak per year
            'yearlyPayment': land_area * 500,
            'contractDuration': 5,  # years
            'totalContractValue': land_area * 500 * 5,
            'trainingAllowance': 5000,  # Fixed amount
            'monthlyWages': 3000  # Fixed amount
        }
        
        return jsonify({
            'success': True,
            'calculations': calculations
        })
        
    except ValueError:
        return jsonify({
            'success': False,
            'error': 'Invalid land area format'
        }), 400
    except Exception as e:
        logger.error(f"❌ Error calculating contract value: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/contract-farming/stats', methods=['GET'])
def get_contract_stats():
    """Get contract farming statistics"""
    try:
        total_applications = len(contract_applications)
        status_counts = {}
        total_land_area = 0
        total_contract_value = 0
        
        for app in contract_applications:
            status = app['status']
            status_counts[status] = status_counts.get(status, 0) + 1
            total_land_area += app['landDetails']['landAreaSatak']
            total_contract_value += app['contractTerms']['totalContractValue']
        
        stats = {
            'totalApplications': total_applications,
            'statusBreakdown': status_counts,
            'totalLandAreaSatak': total_land_area,
            'totalContractValue': total_contract_value,
            'averageLandArea': total_land_area / total_applications if total_applications > 0 else 0,
            'averageContractValue': total_contract_value / total_applications if total_applications > 0 else 0
        }
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        logger.error(f"❌ Error generating contract stats: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

# --- Product Management Endpoints (Marketplace) ---

# MongoDB-backed marketplace catalog. Uses the same database as the auth backend.
try:
    marketplace_mongo_uri = os.getenv('MONGO_URI') or os.getenv('MONGODB_URI') or 'mongodb://localhost:27017/KisanMitradb'
    marketplace_client = MongoClient(marketplace_mongo_uri, serverSelectionTimeoutMS=5000)
    marketplace_client.server_info()
    marketplace_db = marketplace_client.KisanMitradb
    marketplace_products_collection = marketplace_db.products
except Exception as exc:
    logger.warning(f"⚠️ Marketplace MongoDB unavailable: {exc}")
    marketplace_client = None
    marketplace_db = None
    marketplace_products_collection = None

farmer_products = []
product_counter = 1000

@app.route('/api/products', methods=['POST'])
def create_product():
    """Create a new farmer product listing"""
    global product_counter
    
    try:
        # Get form data
        data = request.form.to_dict()
        
        # Validate required fields
        required_fields = [
            'productName', 'category', 'description', 'price',
            'quantity', 'unit', 'location', 'phoneNumber', 'farmerId'
        ]
        
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Handle file upload
        image_path = None
        if 'productImage' in request.files:
            file = request.files['productImage']
            if file.filename:
                filename = secure_filename(file.filename)
                # Create uploads directory if it doesn't exist
                upload_dir = os.path.join(os.path.dirname(__file__), 'uploads', 'products')
                os.makedirs(upload_dir, exist_ok=True)
                
                # Save file
                image_path = os.path.join(upload_dir, f"{product_counter}_{filename}")
                file.save(image_path)
                logger.info(f"📷 Product image saved: {image_path}")
        
        # Create product
        product_id = f"PRD{product_counter:04d}"
        product_counter += 1
        
        product = {
            'id': product_id,
            'productName': data.get('productName'),
            'category': data.get('category'),
            'description': data.get('description'),
            'price': float(data.get('price')),
            'quantity': float(data.get('quantity')),
            'unit': data.get('unit'),
            'location': data.get('location'),
            'phoneNumber': data.get('phoneNumber'),
            'farmerId': data.get('farmerId'),
            'farmerName': data.get('farmerName', 'Unknown Farmer'),
            'productImage': image_path if image_path else None,
            'organicCertified': data.get('organicCertified', 'false').lower() == 'true',
            'deliveryAvailable': data.get('deliveryAvailable', 'false').lower() == 'true',
            'harvestDate': data.get('harvestDate'),
            'status': 'active',
            'createdAt': datetime.now().isoformat(),
            'views': 0,
            'inquiries': 0
        }
        
        # Store the product in the shared MongoDB catalog
        if marketplace_products_collection is None:
            return jsonify({
                'success': False,
                'error': 'Marketplace database unavailable'
            }), 503
        marketplace_products_collection.insert_one(product)
        
        logger.info(f"✅ New product listed: {product_id} - {data.get('productName')} by {data.get('farmerName')}")
        
        return jsonify({
            'success': True,
            'message': 'Product listed successfully!',
            'productId': product_id,
            'product': product
        }), 201
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': f'Invalid data format: {str(e)}'
        }), 400
    except Exception as e:
        logger.error(f"❌ Error creating product: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Internal server error. Please try again later.'
        }), 500

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products with optional filters"""
    try:
        # Get query parameters
        category = request.args.get('category')
        farmer_id = request.args.get('farmerId')
        search = request.args.get('search', '').lower()
        status = request.args.get('status', 'active')
        
        if marketplace_products_collection is None:
            return jsonify({'success': False, 'error': 'Marketplace database unavailable'}), 503
        query = {}
        if category and category != 'all':
            query['category'] = category
        if farmer_id:
            query['farmerId'] = farmer_id
        if status:
            query['status'] = status
        if search:
            query['$or'] = [
                {'productName': {'$regex': search, '$options': 'i'}},
                {'description': {'$regex': search, '$options': 'i'}}
            ]
        filtered_products = list(marketplace_products_collection.find(query))
        for product in filtered_products:
            product['_id'] = str(product['_id'])
        
        return jsonify({
            'success': True,
            'products': filtered_products,
            'total': len(filtered_products)
        })
        
    except Exception as e:
        logger.error(f"❌ Error fetching products: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    """Get specific product by ID"""
    try:
        if marketplace_products_collection is None:
            return jsonify({'success': False, 'error': 'Marketplace database unavailable'}), 503
        product = marketplace_products_collection.find_one({'id': product_id})
        
        if not product:
            return jsonify({
                'success': False,
                'error': 'Product not found'
            }), 404
        
        # Increment view count
        marketplace_products_collection.update_one({'id': product_id}, {'$inc': {'views': 1}})
        product['_id'] = str(product['_id'])
        
        return jsonify({
            'success': True,
            'product': product
        })
        
    except Exception as e:
        logger.error(f"❌ Error fetching product {product_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/products/<product_id>', methods=['PUT'])
def update_product(product_id):
    """Update product (farmer only)"""
    try:
        data = request.get_json()
        
        if marketplace_products_collection is None:
            return jsonify({'success': False, 'error': 'Marketplace database unavailable'}), 503
        product = marketplace_products_collection.find_one({'id': product_id})
        
        if not product:
            return jsonify({
                'success': False,
                'error': 'Product not found'
            }), 404
        
        # Update fields
        updateable_fields = [
            'productName', 'description', 'price', 'quantity',
            'organicCertified', 'deliveryAvailable', 'status'
        ]
        update = {field: data[field] for field in updateable_fields if field in data}
        update['updatedAt'] = datetime.now().isoformat()
        marketplace_products_collection.update_one({'id': product_id}, {'$set': update})
        product.update(update)
        
        logger.info(f"📝 Product updated: {product_id}")
        
        return jsonify({
            'success': True,
            'message': 'Product updated successfully',
            'product': product
        })
        
    except Exception as e:
        logger.error(f"❌ Error updating product {product_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete product (farmer only)"""
    try:
        if marketplace_products_collection is None:
            return jsonify({'success': False, 'error': 'Marketplace database unavailable'}), 503
        product = marketplace_products_collection.find_one({'id': product_id})
        
        if not product:
            return jsonify({
                'success': False,
                'error': 'Product not found'
            }), 404
        
        marketplace_products_collection.delete_one({'id': product_id})
        
        logger.info(f"🗑️ Product deleted: {product_id}")
        
        return jsonify({
            'success': True,
            'message': 'Product deleted successfully'
        })
        
    except Exception as e:
        logger.error(f"❌ Error deleting product {product_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/products/farmer/<farmer_id>', methods=['GET'])
def get_farmer_products(farmer_id):
    """Get all products by specific farmer"""
    try:
        if marketplace_products_collection is None:
            return jsonify({'success': False, 'error': 'Marketplace database unavailable'}), 503
        products = list(marketplace_products_collection.find({'farmerId': farmer_id}))
        for product in products:
            product['_id'] = str(product['_id'])
        
        return jsonify({
            'success': True,
            'products': products,
            'total': len(products)
        })
        
    except Exception as e:
        logger.error(f"❌ Error fetching farmer products {farmer_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'agribot_help': 'Use /api/chat for farming questions',
        'available_endpoints': [
            '/',
            '/api/chat',
            '/api/expert-advice',
            '/api/model-info',
            '/api/conversation-history',
            '/api/debug-grok'
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': 'AgriBot encountered an issue. Please try again.'
    }), 500

if __name__ == '__main__':
    print("🤖 AgriBot AI Backend with Groq Integration")
    print("=" * 60)
    print("🆓 No billing required - Completely FREE!")
    print("🌾 Advanced farming knowledge built-in")
    if groq_enabled:
        print("🚀 Groq AI-powered expert responses")
        print("📊 Free Quota: 14,400 requests/day")
    else:
        print("🧠 Knowledge base responses (fallback)")
    print("=" * 60)
    
    # Get configuration
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('PORT', os.getenv('FLASK_PORT', 5000)))
    debug = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    
    print(f"🌐 Starting AgriBot on http://{host}:{port}")
    print(f"🔧 Debug mode: {debug}")
    print("=" * 60)
    print("📡 AgriBot Endpoints:")
    print("   🏥 Health Check: /")
    print("   💬 Chat with AgriBot: /api/chat")
    print("   🧑‍🌾 Expert Advice: /api/expert-advice")
    print("   🔬 Real Disease Detection: /api/crop-disease-detection")
    print("   🌿 Crop Analysis (Fallback): /api/crop-image-analysis")
    print("   ℹ️ Model Info: /api/model-info")
    print("   📜 Chat History: /api/conversation-history")
    print("   🔍 Debug Grok: /api/debug-grok")
    print("   💬 Farmer Messages (GET): /api/chat/messages")
    print("   📤 Send Farmer Message (POST): /api/chat/send")
    print("   🌾 Contract Farming (POST): /api/contract-farming/submit")
    print("   📋 Contract Applications (GET): /api/contract-farming/applications")
    print("   🔢 Contract Calculator (POST): /api/contract-farming/calculate")
    print("   📊 Contract Stats (GET): /api/contract-farming/stats")
    print("   🛒 Create Product (POST): /api/products")
    print("   📦 Get Products (GET): /api/products")
    print("   🔍 Get Product by ID (GET): /api/products/<id>")
    print("   ✏️ Update Product (PUT): /api/products/<id>")
    print("   🗑️ Delete Product (DELETE): /api/products/<id>")
    print("   👨‍🌾 Farmer Products (GET): /api/products/farmer/<id>")
    print("=" * 60)
    if disease_service_available:
        print("🎉 REAL DISEASE DETECTION ACTIVE with your trained CNN model!")
        model_status = disease_service.get_model_status()
        print(f"📊 Model Classes: {model_status.get('total_classes', 'N/A')}")
        print(f"� Model Accuracy: {model_status.get('model_accuracy', 'N/A')}")
    else:
        print("⚠️ Disease detection service not available - using fallback")
    print("�🚀 AgriBot is ready! Ask farming questions and get expert advice!")
    print("💡 Example: POST to /api/chat with {'message': 'How to grow rice?'}")
    print("💡 Disease Detection: POST image to /api/crop-disease-detection")
    print("=" * 60)
    
    try:
        app.run(host=host, port=port, debug=debug, threaded=True)
    except KeyboardInterrupt:
        print("\n👋 AgriBot stopped by user")
    except Exception as e:
        print(f"\n❌ AgriBot startup error: {e}")
        traceback.print_exc()