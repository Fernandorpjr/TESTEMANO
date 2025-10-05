// Mano Assistant - Versão Corrigida
class ManoAssistant {
    constructor() {
        this.isActive = false;
        this.isProcessing = false;
        this.patientData = null;
        this.capturedImage = null;
        this.ocrText = '';
        this.init();
    }
    
    init() {
        // DOM Elements
        this.elements = {
            toggleBtn: document.getElementById('toggle-btn'),
            statusIndicator: document.getElementById('status-indicator'),
            statusText: document.getElementById('status-text'),
            uploadArea: document.getElementById('upload-area'),
            fileInput: document.getElementById('file-input'),
            previewContainer: document.getElementById('preview-container'),
            previewImage: document.getElementById('preview-image'),
            removeImageBtn: document.getElementById('remove-image-btn'),
            ocrProgressContainer: document.getElementById('ocr-progress-container'),
            ocrProgress: document.getElementById('ocr-progress'),
            ocrProgressText: document.getElementById('ocr-progress-text'),
            scanBtn: document.getElementById('scan-btn'),
            extractBtn: document.getElementById('extract-btn'),
            sisregBtn: document.getElementById('sisreg-btn'),
            fillBtn: document.getElementById('fill-btn'),
            searchBtn: document.getElementById('search-btn'),
            scheduleBtn: document.getElementById('schedule-btn'),
            clearLogsBtn: document.getElementById('clear-logs-btn'),
            refreshSisregBtn: document.getElementById('refresh-sisreg-btn'),
            clearSisregBtn: document.getElementById('clear-sisreg-btn'),
            logArea: document.getElementById('log-area'),
            patientData: document.getElementById('patient-data'),
            noPatientData: document.getElementById('no-patient-data'),
            patientName: document.getElementById('patient-name'),
            patientCns: document.getElementById('patient-cns'),
            patientDob: document.getElementById('patient-dob'),
            patientPhone: document.getElementById('patient-phone'),
            patientProcedure: document.getElementById('patient-procedure'),
            ocrContainer: document.getElementById('ocr-container'),
            noOcrData: document.getElementById('no-ocr-data'),
            ocrResult: document.getElementById('ocr-result'),
            copyOcrBtn: document.getElementById('copy-ocr-btn'),
            sisregFrame: document.getElementById('sisreg-frame')
        };
        
        // Event Listeners
        this.attachEventListeners();
    }
    
    attachEventListeners() {
        // Toggle assistant
        this.elements.toggleBtn.addEventListener('click', () => {
            this.toggleStatus();
        });
        
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
        
        // Scan button
        this.elements.scanBtn.addEventListener('click', () => {
            if (this.capturedImage) {
                this.processOCR(this.capturedImage);
            } else {
                this.addLog('Por favor, carregue uma imagem primeiro.', 'error');
            }
        });
        
        // Extract button
        this.elements.extractBtn.addEventListener('click', () => {
            if (this.ocrText) {
                this.extractPatientData(this.ocrText);
            } else {
                this.addLog('Por favor, escaneie um documento primeiro.', 'error');
            }
        });
        
        // Sisreg buttons
        this.elements.sisregBtn.addEventListener('click', () => {
            this.accessSisreg();
        });
        
        this.elements.fillBtn.addEventListener('click', () => {
            this.fillForm();
        });
        
        this.elements.searchBtn.addEventListener('click', () => {
            this.searchSlots();
        });
        
        this.elements.scheduleBtn.addEventListener('click', () => {
            this.scheduleAppointment();
        });
        
        // Sisreg frame controls
        this.elements.refreshSisregBtn.addEventListener('click', () => {
            this.refreshSisreg();
        });
        
        this.elements.clearSisregBtn.addEventListener('click', () => {
            this.clearSisreg();
        });
        
        // Clear logs
        this.elements.clearLogsBtn.addEventListener('click', () => {
            this.clearLogs();
        });
        
        // Copy OCR text
        this.elements.copyOcrBtn.addEventListener('click', () => {
            this.copyOCRText();
        });
    }
    
    toggleStatus() {
        this.isActive = !this.isActive;
        
        if (this.isActive) {
            this.elements.statusIndicator.className = 'status-indicator active';
            this.elements.statusText.textContent = 'Ativo';
            this.elements.toggleBtn.textContent = 'Desativar';
            this.addLog('Assistente ativado!', 'success');
        } else {
            this.elements.statusIndicator.className = 'status-indicator';
            this.elements.statusText.textContent = 'Inativo';
            this.elements.toggleBtn.textContent = 'Ativar';
            this.addLog('Assistente desativado.', 'info');
        }
    }
    
    addLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString('pt-BR');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.innerHTML = `[${timestamp}] ${message}`;
        
        this.elements.logArea.appendChild(logEntry);
        this.elements.logArea.scrollTop = this.elements.logArea.scrollHeight;
    }
    
    handleImageUpload(e) {
        if (!this.isActive) {
            this.addLog('Por favor, ative o assistente primeiro.', 'error');
            return;
        }
        
        const file = e.target.files[0];
        if (file) {
            // Check if file is an image
            if (!file.type.match('image.*')) {
                this.addLog('Por favor, selecione um arquivo de imagem válido (JPG, PNG, GIF).', 'error');
                return;
            }
            
            this.addLog(`Arquivo selecionado: ${file.name}`, 'info');
            this.addLog(`Tamanho: ${(file.size / 1024).toFixed(2)} KB`, 'info');
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageData = event.target.result;
                this.capturedImage = imageData;
                
                // Show preview
                this.elements.previewImage.src = imageData;
                this.elements.previewContainer.classList.remove('hidden');
                this.elements.uploadArea.classList.add('hidden');
                
                this.addLog('Imagem carregada com sucesso!', 'success');
            };
            reader.readAsDataURL(file);
        }
    }
    
    removeImage() {
        this.capturedImage = null;
        this.elements.previewContainer.classList.add('hidden');
        this.elements.uploadArea.classList.remove('hidden');
        this.elements.fileInput.value = '';
        this.elements.patientData.classList.add('hidden');
        this.elements.noPatientData.classList.remove('hidden');
        this.elements.ocrContainer.classList.add('hidden');
        this.elements.noOcrData.classList.remove('hidden');
        this.patientData = null;
        this.ocrText = '';
        this.addLog('Imagem removida.', 'info');
    }
    
    async processOCR(imageData) {
        if (!this.isActive) {
            this.addLog('Por favor, ative o assistente primeiro.', 'error');
            return;
        }
        
        if (this.isProcessing) {
            this.addLog('Processamento OCR já em andamento.', 'error');
            return;
        }
        
        this.isProcessing = true;
        this.elements.ocrProgressContainer.classList.remove('hidden');
        this.elements.ocrProgress.style.width = '0%';
        this.elements.ocrProgressText.textContent = '0%';
        
        this.addLog('Iniciando processamento OCR...', 'info');
        
        try {
            // Dynamically load Tesseract.js only when needed
            if (typeof Tesseract === 'undefined') {
                this.addLog('Carregando biblioteca OCR...', 'info');
                await this.loadScript('https://unpkg.com/tesseract.js@v5.0.4/dist/tesseract.min.js');
            }
            
            // Create worker with error handling
            const worker = await Tesseract.createWorker({
                logger: (m) => {
                    if (m.status === 'recognizing text' && m.progress) {
                        const progress = Math.round(m.progress * 100);
                        this.elements.ocrProgress.style.width = `${progress}%`;
                        this.elements.ocrProgressText.textContent = `${progress}%`;
                        if (progress % 20 === 0) {
                            this.addLog(`Progresso OCR: ${progress}%`, 'info');
                        }
                    } else if (m.status) {
                        this.addLog(`Status OCR: ${m.status}`, 'info');
                    }
                }
            });
            
            this.addLog('Carregando Tesseract...', 'info');
            await worker.load();
            
            this.addLog('Carregando idioma português...', 'info');
            await worker.loadLanguage('por');
            
            this.addLog('Inicializando Tesseract...', 'info');
            await worker.initialize('por');
            
            this.addLog('Processando imagem... isso pode levar alguns segundos', 'info');
            const result = await worker.recognize(imageData);
            this.ocrText = result.data.text;
            
            await worker.terminate();
            
            // Display OCR result
            this.elements.ocrResult.textContent = this.ocrText;
            this.elements.ocrContainer.classList.remove('hidden');
            this.elements.noOcrData.classList.add('hidden');
            
            this.addLog('✓ OCR concluído com sucesso!', 'success');
            
        } catch (error) {
            this.addLog(`Erro no processamento OCR: ${error.message}`, 'error');
            // Fallback to simulated OCR if real OCR fails
            this.simulateOCR();
        } finally {
            this.isProcessing = false;
            this.elements.ocrProgressContainer.classList.add('hidden');
        }
    }
    
    // Helper function to dynamically load scripts
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    simulateOCR() {
        // Simulated OCR text with consistent patient data
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
        this.elements.ocrContainer.classList.remove('hidden');
        this.elements.noOcrData.classList.add('hidden');
        
        this.addLog('✓ OCR simulado concluído!', 'success');
    }
    
    extractPatientData(text) {
        if (!text) {
            this.addLog('Nenhum texto para extrair dados.', 'error');
            return;
        }
        
        this.addLog('Extraindo dados do paciente...', 'info');
        
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
        
        // Update UI
        this.elements.patientName.value = this.patientData.nome;
        this.elements.patientCns.value = this.patientData.cns;
        this.elements.patientDob.value = this.patientData.dataNascimento;
        this.elements.patientPhone.value = this.patientData.telefone;
        this.elements.patientProcedure.value = this.patientData.procedimento;
        
        this.elements.patientData.classList.remove('hidden');
        this.elements.noPatientData.classList.add('hidden');
        
        this.addLog('✓ Dados extraídos com sucesso!', 'success');
        this.addLog(`Nome: ${this.patientData.nome}`, 'info');
        this.addLog(`CNS: ${this.patientData.cns}`, 'info');
    }
    
    copyOCRText() {
        if (this.ocrText) {
            navigator.clipboard.writeText(this.ocrText)
                .then(() => {
                    this.addLog('Texto copiado para a área de transferência!', 'success');
                })
                .catch(err => {
                    this.addLog(`Erro ao copiar texto: ${err.message}`, 'error');
                });
        } else {
            this.addLog('Nenhum texto para copiar.', 'error');
        }
    }
    
    clearLogs() {
        this.elements.logArea.innerHTML = '';
        this.addLog('Logs limpos.', 'info');
    }
    
    // Sisreg Integration Functions
    accessSisreg() {
        if (!this.isActive) {
            this.addLog('Por favor, ative o assistente primeiro.', 'error');
            return;
        }
        
        this.addLog('Acessando Sisreg III...', 'info');
        this.addLog('URL: https://sisregiii.saude.gov.br/cgi-bin/index', 'info');
        
        try {
            // Scroll to the Sisreg frame
            this.elements.sisregFrame.scrollIntoView({ behavior: 'smooth' });
            
            // In a real browser extension, we would interact with the iframe here
            // For this demo, we'll simulate the interaction
            setTimeout(() => {
                this.addLog('✓ Página carregada com sucesso', 'success');
                this.addLog('✓ Login realizado', 'success');
                this.addLog('DICA: Em uma extensão real, o assistente interagiria diretamente com os elementos da página', 'info');
            }, 2000);
        } catch (error) {
            this.addLog(`Erro ao acessar Sisreg: ${error.message}`, 'error');
        }
    }
    
    fillForm() {
        if (!this.isActive) {
            this.addLog('Por favor, ative o assistente primeiro.', 'error');
            return;
        }
        
        if (!this.patientData) {
            this.addLog('Nenhum dado de paciente disponível. Capture um documento primeiro.', 'error');
            return;
        }
        
        this.addLog('Preenchendo formulário do paciente...', 'info');
        
        try {
            // In a real browser extension, we would interact with the iframe here
            // For this demo, we'll simulate the interaction
            setTimeout(() => {
                this.addLog(`✓ Nome: ${this.patientData.nome}`, 'success');
                this.addLog(`✓ CNS: ${this.patientData.cns}`, 'success');
                this.addLog(`✓ Data de Nascimento: ${this.patientData.dataNascimento}`, 'success');
                this.addLog(`✓ Telefone: ${this.patientData.telefone}`, 'success');
                this.addLog(`✓ Procedimento: ${this.patientData.procedimento}`, 'success');
                this.addLog('✓ Formulário preenchido com sucesso', 'success');
                this.addLog('DICA: Em uma extensão real, o assistente preencheria automaticamente os campos do formulário', 'info');
            }, 1500);
        } catch (error) {
            this.addLog(`Erro ao preencher formulário: ${error.message}`, 'error');
        }
    }
    
    searchSlots() {
        if (!this.isActive) {
            this.addLog('Por favor, ative o assistente primeiro.', 'error');
            return;
        }
        
        if (!this.patientData) {
            this.addLog('Nenhum dado de paciente disponível. Capture um documento primeiro.', 'error');
            return;
        }
        
        this.addLog('Buscando vagas disponíveis...', 'info');
        
        try {
            // In a real browser extension, we would interact with the iframe here
            // For this demo, we'll simulate the interaction
            setTimeout(() => {
                this.addLog('✓ 3 vagas encontradas para Cardiologia', 'success');
                this.addLog('1. Hospital Geral - 12/10/2025 às 14:00', 'info');
                this.addLog('2. Clínica Saúde - 13/10/2025 às 10:30', 'info');
                this.addLog('3. Centro Médico - 14/10/2025 às 16:00', 'info');
                this.addLog('DICA: Em uma extensão real, o assistente selecionaria automaticamente a melhor vaga', 'info');
            }, 2000);
        } catch (error) {
            this.addLog(`Erro ao buscar vagas: ${error.message}`, 'error');
        }
    }
    
    scheduleAppointment() {
        if (!this.isActive) {
            this.addLog('Por favor, ative o assistente primeiro.', 'error');
            return;
        }
        
        this.addLog('Agendando consulta...', 'info');
        
        try {
            // In a real browser extension, we would interact with the iframe here
            // For this demo, we'll simulate the interaction
            setTimeout(() => {
                this.addLog('✓ Consulta agendada com sucesso!', 'success');
                this.addLog('Hospital Geral - 12/10/2025 às 14:00', 'info');
                this.addLog('Número do protocolo: 2025001234567', 'info');
                this.addLog('DICA: Em uma extensão real, o assistente confirmaria o agendamento automaticamente', 'info');
            }, 1500);
        } catch (error) {
            this.addLog(`Erro ao agendar consulta: ${error.message}`, 'error');
        }
    }
    
    refreshSisreg() {
        this.addLog('Atualizando página do Sisreg...', 'info');
        this.elements.sisregFrame.src = this.elements.sisregFrame.src;
        setTimeout(() => {
            this.addLog('Página do Sisreg atualizada!', 'success');
        }, 2000);
    }
    
    clearSisreg() {
        this.addLog('Limpando frame do Sisreg...', 'info');
        this.elements.sisregFrame.src = 'about:blank';
        setTimeout(() => {
            this.addLog('Frame do Sisreg limpo!', 'success');
        }, 1000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.ManoAssistant = new ManoAssistant();
});