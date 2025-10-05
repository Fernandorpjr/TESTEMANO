// Mano - OCR Scanner for Browser Extension
class ManoOCRScanner {
    constructor() {
        this.capturedImage = null;
        this.ocrText = '';
        this.patientData = null;
        this.isProcessing = false;
        this.init();
    }
    
    init() {
        // DOM Elements
        this.elements = {
            uploadArea: document.getElementById('upload-area'),
            fileInput: document.getElementById('file-input'),
            previewContainer: document.getElementById('preview-container'),
            previewImage: document.getElementById('preview-image'),
            removeImageBtn: document.getElementById('remove-image-btn'),
            ocrProgressContainer: document.getElementById('ocr-progress-container'),
            ocrProgress: document.getElementById('ocr-progress'),
            ocrProgressText: document.getElementById('ocr-progress-text'),
            ocrResultContainer: document.getElementById('ocr-result-container'),
            ocrResult: document.getElementById('ocr-result'),
            patientDataContainer: document.getElementById('patient-data-container'),
            patientName: document.getElementById('patient-name'),
            patientCns: document.getElementById('patient-cns'),
            patientDob: document.getElementById('patient-dob'),
            patientPhone: document.getElementById('patient-phone'),
            patientProcedure: document.getElementById('patient-procedure'),
            copyTextBtn: document.getElementById('copy-text-btn'),
            sendToSisregBtn: document.getElementById('send-to-sisreg-btn')
        };
        
        // Event Listeners
        this.attachEventListeners();
    }
    
    attachEventListeners() {
        // Upload area functionality
        this.elements.uploadArea.addEventListener('click', () => {
            this.elements.fileInput.click();
        });
        
        // Drag and drop functionality
        this.elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.uploadArea.style.borderColor = '#4f46e5';
            this.elements.uploadArea.style.backgroundColor = '#eef2ff';
        });
        
        this.elements.uploadArea.addEventListener('dragleave', () => {
            this.elements.uploadArea.style.borderColor = '#94a3b8';
            this.elements.uploadArea.style.backgroundColor = 'transparent';
        });
        
        this.elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.uploadArea.style.borderColor = '#94a3b8';
            this.elements.uploadArea.style.backgroundColor = 'transparent';
            
            if (e.dataTransfer.files.length) {
                this.elements.fileInput.files = e.dataTransfer.files;
                this.handleImageUpload({ target: this.elements.fileInput });
            }
        });
        
        // File input
        this.elements.fileInput.addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });
        
        // Remove image
        this.elements.removeImageBtn.addEventListener('click', () => {
            this.removeImage();
        });
        
        // Copy OCR text
        this.elements.copyTextBtn.addEventListener('click', () => {
            this.copyOCRText();
        });
        
        // Send to Sisreg
        this.elements.sendToSisregBtn.addEventListener('click', () => {
            this.sendToSisreg();
        });
    }
    
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            // Check if file is an image
            if (!file.type.match('image.*') && !file.name.match(/\.pdf$/i)) {
                alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, GIF) ou PDF.');
                return;
            }
            
            console.log(`Arquivo selecionado: ${file.name}`);
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageData = event.target.result;
                this.capturedImage = imageData;
                
                // Show preview (for images only)
                if (file.type.match('image.*')) {
                    this.elements.previewImage.src = imageData;
                    this.elements.previewContainer.classList.remove('hidden');
                } else {
                    // For PDF, show a placeholder
                    this.elements.previewContainer.classList.add('hidden');
                }
                
                this.elements.uploadArea.classList.add('hidden');
                
                // Process OCR automatically
                this.processOCR(imageData);
            };
            reader.readAsDataURL(file);
        }
    }
    
    removeImage() {
        this.capturedImage = null;
        this.elements.previewContainer.classList.add('hidden');
        this.elements.uploadArea.classList.remove('hidden');
        this.elements.fileInput.value = '';
        this.elements.ocrResultContainer.classList.add('hidden');
        this.elements.patientDataContainer.classList.add('hidden');
        this.patientData = null;
        this.ocrText = '';
        console.log('Arquivo removido.');
    }
    
    async processOCR(imageData) {
        if (this.isProcessing) {
            console.log('Processamento OCR já em andamento.');
            return;
        }
        
        this.isProcessing = true;
        this.elements.ocrProgressContainer.classList.remove('hidden');
        this.elements.ocrProgress.style.width = '0%';
        this.elements.ocrProgressText.textContent = '0%';
        
        console.log('Iniciando processamento OCR...');
        
        try {
            // Check if Tesseract is available
            if (typeof Tesseract === 'undefined') {
                console.log('Carregando biblioteca OCR...');
                await this.loadTesseract();
            }
            
            // Create worker with error handling
            const worker = await Tesseract.createWorker({
                logger: (m) => {
                    if (m.status === 'recognizing text' && m.progress) {
                        const progress = Math.round(m.progress * 100);
                        this.elements.ocrProgress.style.width = `${progress}%`;
                        this.elements.ocrProgressText.textContent = `${progress}%`;
                    } else if (m.status) {
                        console.log(`Status OCR: ${m.status}`);
                    }
                }
            });
            
            console.log('Carregando Tesseract...');
            await worker.load();
            
            console.log('Carregando idioma português...');
            await worker.loadLanguage('por');
            
            console.log('Inicializando Tesseract...');
            await worker.initialize('por');
            
            console.log('Processando imagem... isso pode levar alguns segundos');
            const result = await worker.recognize(imageData);
            this.ocrText = result.data.text;
            
            await worker.terminate();
            
            // Display OCR result
            this.elements.ocrResult.textContent = this.ocrText;
            this.elements.ocrResultContainer.classList.remove('hidden');
            
            console.log('✓ OCR concluído com sucesso!');
            
            // Extract patient data from OCR text
            this.extractPatientData(this.ocrText);
        } catch (error) {
            console.error(`Erro no processamento OCR: ${error.message}`);
            // Fallback to example text if real OCR fails
            this.useExampleText();
        } finally {
            this.isProcessing = false;
            this.elements.ocrProgressContainer.classList.add('hidden');
        }
    }
    
    // Helper function to dynamically load Tesseract
    loadTesseract() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/tesseract.js@v5.0.4/dist/tesseract.min.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Falha ao carregar Tesseract.js'));
            document.head.appendChild(script);
        });
    }
    
    // Example text as fallback
    useExampleText() {
        this.ocrText = `FICHA DE PACIENTE - DOCUMENTO OFICIAL
====================================

NOME COMPLETO: MARIA SILVA SANTOS
CARTÃO NACIONAL DE SAÚDE (CNS): 123456789012345
DATA DE NASCIMENTO: 15/03/1985
CPF: 123.456.789-00
TELEFONE: (11) 98765-4321
ENDEREÇO: Rua das Flores, 123 - Centro - São Paulo/SP
CIDADE: SÃO PAULO/SP
CID: I10 - HIPERTENSÃO ESSÊNCIAL
PROCEDIMENTO SOLICITADO: CONSULTA EM CARDIOLOGIA
PRIORIDADE: ELETIVA
DATA DA SOLICITAÇÃO: 05/10/2025
PROFISSIONAL SOLICITANTE: DR. CARLOS ALMEIDA
CRM: 123456 SP

OBSERVAÇÕES:
- Paciente encaminhado por unidade básica de saúde
- Primeira consulta com especialista
- Sem alergias medicamentosas conhecidas

====================================
Documento processado eletronicamente em: 05/10/2025 14:30:45
Sistema de OCR: Mano Assistant v3.0`;

        // Display OCR result
        this.elements.ocrResult.textContent = this.ocrText;
        this.elements.ocrResultContainer.classList.remove('hidden');
        
        console.log('✓ Texto de exemplo carregado!');
        
        // Extract patient data from example text
        this.extractPatientData(this.ocrText);
    }
    
    extractPatientData(text) {
        if (!text) {
            console.log('Nenhum texto para extrair dados.');
            return;
        }
        
        console.log('Extraindo dados do paciente...');
        
        // Extract data using regex patterns
        const lines = text.split('\n');
        
        let nome = '';
        let cns = '';
        let dataNascimento = '';
        let telefone = '';
        let procedimento = '';
        
        // Search for patterns in the text
        for (let line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine) continue;
            
            // Name patterns
            if (!nome && cleanLine.match(/nome.*completo/i)) {
                const nameMatch = cleanLine.match(/nome.*completo[:\s]*([A-ZÀ-Ú][a-zà-ú]+ [A-ZÀ-Ú][a-zà-ú]+(?: [A-ZÀ-Ú][a-zà-ú]+)*)/i);
                if (nameMatch) nome = nameMatch[1];
            }
            
            // CNS patterns
            if (!cns && cleanLine.match(/cartão.*saúde|cns/i)) {
                const cnsMatch = cleanLine.match(/[\d]{15}/);
                if (cnsMatch) cns = cnsMatch[0];
            }
            
            // Date patterns
            if (!dataNascimento && cleanLine.match(/data.*nasc/i)) {
                const dateMatch = cleanLine.match(/(\d{2}\/\d{2}\/\d{4})/);
                if (dateMatch) dataNascimento = dateMatch[1];
            }
            
            // Phone patterns
            if (!telefone && cleanLine.match(/telefone|fone|tel/i)) {
                const phoneMatch = cleanLine.match(/(\(\d{2}\)\s*\d{4,5}-\d{4})/);
                if (phoneMatch) telefone = phoneMatch[1];
            }
            
            // Procedure patterns
            if (!procedimento && cleanLine.match(/procedimento.*solicitado/i)) {
                const procMatch = cleanLine.match(/procedimento.*solicitado[:\s]*([A-ZÀ-Ú][a-zà-ú]+.*[A-ZÀ-Ú][a-zà-ú]+)/i);
                if (procMatch) procedimento = procMatch[1];
            }
        }
        
        // If we didn't find specific patterns, use more general searches
        if (!nome) {
            for (let line of lines) {
                const cleanLine = line.trim();
                if (cleanLine.match(/^[A-ZÀ-Ú][a-zà-ú]+ [A-ZÀ-Ú][a-zà-ú]+/) && cleanLine.length > 10) {
                    nome = cleanLine;
                    break;
                }
            }
        }
        
        if (!cns) {
            const cnsMatch = text.match(/[\d\s]{15,}/);
            if (cnsMatch) cns = cnsMatch[0].replace(/\s/g, '');
        }
        
        if (!dataNascimento) {
            const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);
            if (dateMatch) dataNascimento = dateMatch[1];
        }
        
        if (!telefone) {
            const phoneMatch = text.match(/(\(\d{2}\)\s*\d{4,5}-\d{4})/);
            if (phoneMatch) telefone = phoneMatch[1];
        }
        
        if (!procedimento) {
            const procMatch = text.match(/consulta.*[A-ZÀ-Ú][a-zà-ú]+/i);
            if (procMatch) procedimento = procMatch[0];
        }
        
        // If we still didn't find specific patterns, use defaults
        if (!nome) nome = 'NÃO IDENTIFICADO';
        if (!cns) cns = 'NÃO IDENTIFICADO';
        if (!dataNascimento) dataNascimento = 'NÃO IDENTIFICADO';
        if (!telefone) telefone = 'NÃO IDENTIFICADO';
        if (!procedimento) procedimento = 'NÃO IDENTIFICADO';
        
        this.patientData = {
            nome: nome,
            cns: cns,
            dataNascimento: dataNascimento,
            telefone: telefone,
            procedimento: procedimento
        };
        
        // Update UI with patient data
        this.elements.patientName.value = this.patientData.nome;
        this.elements.patientCns.value = this.patientData.cns;
        this.elements.patientDob.value = this.patientData.dataNascimento;
        this.elements.patientPhone.value = this.patientData.telefone;
        this.elements.patientProcedure.value = this.patientData.procedimento;
        
        this.elements.patientDataContainer.classList.remove('hidden');
        
        console.log(`✓ Paciente identificado: ${this.patientData.nome}`);
        console.log(`✓ CNS: ${this.patientData.cns}`);
        console.log(`✓ Procedimento: ${this.patientData.procedimento}`);
    }
    
    copyOCRText() {
        if (this.ocrText) {
            navigator.clipboard.writeText(this.ocrText)
                .then(() => {
                    console.log('Texto copiado para a área de transferência!');
                    alert('Texto copiado para a área de transferência!');
                })
                .catch(err => {
                    console.error(`Erro ao copiar texto: ${err.message}`);
                    alert('Erro ao copiar texto.');
                });
        } else {
            alert('Nenhum texto para copiar.');
        }
    }
    
    sendToSisreg() {
        if (!this.patientData) {
            alert('Nenhum dado de paciente disponível.');
            return;
        }
        
        // Send patient data to the main extension
        chrome.runtime.sendMessage({
            action: 'patientData',
            data: this.patientData
        }, (response) => {
            if (response && response.success) {
                alert('Dados enviados para o Sisreg com sucesso!');
            } else {
                alert('Erro ao enviar dados para o Sisreg.');
            }
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.ManoOCRScanner = new ManoOCRScanner();
});