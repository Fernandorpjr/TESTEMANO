// Mano - Browser Extension Popup
class ManoExtension {
    constructor() {
        this.isActive = false;
        this.patientData = {
            nome: '',
            cns: '',
            dataNascimento: '',
            telefone: '',
            procedimento: ''
        };
        this.init();
    }
    
    init() {
        // DOM Elements
        this.elements = {
            statusIndicator: document.getElementById('status-indicator'),
            statusText: document.getElementById('status-text'),
            patientName: document.getElementById('patient-name'),
            patientCns: document.getElementById('patient-cns'),
            patientDob: document.getElementById('patient-dob'),
            patientPhone: document.getElementById('patient-phone'),
            patientProcedure: document.getElementById('patient-procedure'),
            fillFormBtn: document.getElementById('fill-form-btn'),
            loginBtn: document.getElementById('login-btn'),
            navigateBtn: document.getElementById('navigate-btn'),
            searchPatientBtn: document.getElementById('search-patient-btn'),
            scheduleAppointmentBtn: document.getElementById('schedule-appointment-btn'),
            logArea: document.getElementById('log-area')
        };
        
        // Load saved data
        this.loadPatientData();
        
        // Event Listeners
        this.attachEventListeners();
        
        // Listen for messages from OCR scanner
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'patientData') {
                this.patientData = request.data;
                this.updatePatientDataUI();
                this.savePatientData();
                sendResponse({ success: true });
            }
            return true;
        });
    }
    
    attachEventListeners() {
        // Patient data inputs
        this.elements.patientName.addEventListener('input', (e) => {
            this.patientData.nome = e.target.value;
            this.savePatientData();
        });
        
        this.elements.patientCns.addEventListener('input', (e) => {
            this.patientData.cns = e.target.value;
            this.savePatientData();
        });
        
        this.elements.patientDob.addEventListener('input', (e) => {
            this.patientData.dataNascimento = e.target.value;
            this.savePatientData();
        });
        
        this.elements.patientPhone.addEventListener('input', (e) => {
            this.patientData.telefone = e.target.value;
            this.savePatientData();
        });
        
        this.elements.patientProcedure.addEventListener('input', (e) => {
            this.patientData.procedimento = e.target.value;
            this.savePatientData();
        });
        
        // Action buttons
        this.elements.fillFormBtn.addEventListener('click', () => {
            this.fillSisregForm();
        });
        
        this.elements.loginBtn.addEventListener('click', () => {
            this.loginSisreg();
        });
        
        this.elements.navigateBtn.addEventListener('click', () => {
            this.navigateSisreg();
        });
        
        this.elements.searchPatientBtn.addEventListener('click', () => {
            this.searchPatient();
        });
        
        this.elements.scheduleAppointmentBtn.addEventListener('click', () => {
            this.scheduleAppointment();
        });
    }
    
    updatePatientDataUI() {
        this.elements.patientName.value = this.patientData.nome || '';
        this.elements.patientCns.value = this.patientData.cns || '';
        this.elements.patientDob.value = this.patientData.dataNascimento || '';
        this.elements.patientPhone.value = this.patientData.telefone || '';
        this.elements.patientProcedure.value = this.patientData.procedimento || '';
    }
    
    loadPatientData() {
        chrome.storage.local.get(['patientData'], (result) => {
            if (result.patientData) {
                this.patientData = result.patientData;
                this.updatePatientDataUI();
            }
        });
    }
    
    savePatientData() {
        chrome.storage.local.set({ patientData: this.patientData });
    }
    
    addLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString('pt-BR');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.innerHTML = `[${timestamp}] ${message}`;
        
        this.elements.logArea.appendChild(logEntry);
        this.elements.logArea.scrollTop = this.elements.logArea.scrollHeight;
    }
    
    executeScript(func, args = []) {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: func,
                        args: args
                    }, (result) => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve(result);
                        }
                    });
                } else {
                    reject(new Error('No active tab found'));
                }
            });
        });
    }
    
    fillSisregForm() {
        const fillFormScript = (patientData) => {
            // This function runs in the context of the Sisreg page
            try {
                // Example selectors - would need to be updated with actual Sisreg selectors
                const nameField = document.querySelector('input[name="nome"]') || 
                                 document.querySelector('input[id*="nome"]') ||
                                 document.querySelector('input[placeholder*="Nome"]');
                
                const cnsField = document.querySelector('input[name="cns"]') || 
                                document.querySelector('input[id*="cns"]') ||
                                document.querySelector('input[placeholder*="CNS"]');
                
                const dobField = document.querySelector('input[name="dataNascimento"]') || 
                                document.querySelector('input[id*="nascimento"]') ||
                                document.querySelector('input[placeholder*="Nascimento"]');
                
                const phoneField = document.querySelector('input[name="telefone"]') || 
                                  document.querySelector('input[id*="telefone"]') ||
                                  document.querySelector('input[placeholder*="Telefone"]');
                
                if (nameField && patientData.nome) {
                    nameField.value = patientData.nome;
                    nameField.dispatchEvent(new Event('input', { bubbles: true }));
                }
                
                if (cnsField && patientData.cns) {
                    cnsField.value = patientData.cns;
                    cnsField.dispatchEvent(new Event('input', { bubbles: true }));
                }
                
                if (dobField && patientData.dataNascimento) {
                    dobField.value = patientData.dataNascimento;
                    dobField.dispatchEvent(new Event('input', { bubbles: true }));
                }
                
                if (phoneField && patientData.telefone) {
                    phoneField.value = patientData.telefone;
                    phoneField.dispatchEvent(new Event('input', { bubbles: true }));
                }
                
                return { success: true, message: 'Formulário preenchido com sucesso!' };
            } catch (error) {
                return { success: false, message: `Erro ao preencher formulário: ${error.message}` };
            }
        };
        
        this.executeScript(fillFormScript, [this.patientData])
            .then(result => {
                if (result && result[0] && result[0].result) {
                    const { success, message } = result[0].result;
                    if (success) {
                        this.addLog(message, 'success');
                    } else {
                        this.addLog(message, 'error');
                    }
                }
            })
            .catch(error => {
                this.addLog(`Erro ao executar script: ${error.message}`, 'error');
            });
    }
    
    loginSisreg() {
        const loginScript = () => {
            try {
                // Example selectors - would need to be updated with actual Sisreg selectors
                const loginButton = document.querySelector('button[type="submit"]') ||
                                   document.querySelector('input[type="submit"]') ||
                                   document.querySelector('button[id*="login"]');
                
                if (loginButton) {
                    loginButton.click();
                    return { success: true, message: 'Login iniciado!' };
                } else {
                    return { success: false, message: 'Botão de login não encontrado.' };
                }
            } catch (error) {
                return { success: false, message: `Erro ao fazer login: ${error.message}` };
            }
        };
        
        this.executeScript(loginScript)
            .then(result => {
                if (result && result[0] && result[0].result) {
                    const { success, message } = result[0].result;
                    if (success) {
                        this.addLog(message, 'success');
                    } else {
                        this.addLog(message, 'error');
                    }
                }
            })
            .catch(error => {
                this.addLog(`Erro ao executar script: ${error.message}`, 'error');
            });
    }
    
    navigateSisreg() {
        const navigateScript = () => {
            try {
                // Example selectors - would need to be updated with actual Sisreg selectors
                const menuItems = document.querySelectorAll('a, button');
                let found = false;
                
                for (let item of menuItems) {
                    if (item.textContent && 
                        (item.textContent.includes('Agendamento') || 
                         item.textContent.includes('agendamento') ||
                         item.textContent.includes('Consulta'))) {
                        item.click();
                        found = true;
                        break;
                    }
                }
                
                if (found) {
                    return { success: true, message: 'Navegação para agendamento realizada!' };
                } else {
                    return { success: false, message: 'Item de menu não encontrado.' };
                }
            } catch (error) {
                return { success: false, message: `Erro ao navegar: ${error.message}` };
            }
        };
        
        this.executeScript(navigateScript)
            .then(result => {
                if (result && result[0] && result[0].result) {
                    const { success, message } = result[0].result;
                    if (success) {
                        this.addLog(message, 'success');
                    } else {
                        this.addLog(message, 'error');
                    }
                }
            })
            .catch(error => {
                this.addLog(`Erro ao executar script: ${error.message}`, 'error');
            });
    }
    
    searchPatient() {
        const searchScript = (patientData) => {
            try {
                // Example selectors - would need to be updated with actual Sisreg selectors
                const searchField = document.querySelector('input[name="pesquisa"]') ||
                                   document.querySelector('input[placeholder*="pesquisa"]') ||
                                   document.querySelector('input[type="search"]');
                
                const searchButton = document.querySelector('button[type="submit"]') ||
                                    document.querySelector('button[id*="pesquisar"]') ||
                                    document.querySelector('input[type="submit"]');
                
                if (searchField && patientData.nome) {
                    searchField.value = patientData.nome;
                    searchField.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    if (searchButton) {
                        searchButton.click();
                    }
                    
                    return { success: true, message: `Buscando paciente: ${patientData.nome}` };
                } else {
                    return { success: false, message: 'Campo de pesquisa não encontrado.' };
                }
            } catch (error) {
                return { success: false, message: `Erro ao buscar paciente: ${error.message}` };
            }
        };
        
        this.executeScript(searchScript, [this.patientData])
            .then(result => {
                if (result && result[0] && result[0].result) {
                    const { success, message } = result[0].result;
                    if (success) {
                        this.addLog(message, 'success');
                    } else {
                        this.addLog(message, 'error');
                    }
                }
            })
            .catch(error => {
                this.addLog(`Erro ao executar script: ${error.message}`, 'error');
            });
    }
    
    scheduleAppointment() {
        const scheduleScript = () => {
            try {
                // Example selectors - would need to be updated with actual Sisreg selectors
                const scheduleButton = document.querySelector('button[id*="agendar"]') ||
                                      document.querySelector('button[id*="consulta"]') ||
                                      document.querySelector('a[href*="agendar"]');
                
                if (scheduleButton) {
                    scheduleButton.click();
                    return { success: true, message: 'Processo de agendamento iniciado!' };
                } else {
                    return { success: false, message: 'Botão de agendamento não encontrado.' };
                }
            } catch (error) {
                return { success: false, message: `Erro ao agendar consulta: ${error.message}` };
            }
        };
        
        this.executeScript(scheduleScript)
            .then(result => {
                if (result && result[0] && result[0].result) {
                    const { success, message } = result[0].result;
                    if (success) {
                        this.addLog(message, 'success');
                    } else {
                        this.addLog(message, 'error');
                    }
                }
            })
            .catch(error => {
                this.addLog(`Erro ao executar script: ${error.message}`, 'error');
            });
    }
    
    // Method to open OCR scanner
    openOCRScanner() {
        chrome.tabs.create({
            url: chrome.runtime.getURL('ocr.html')
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ManoExtension = new ManoExtension();
    
    // Add OCR scanner button
    const ocrBtn = document.createElement('button');
    ocrBtn.className = 'btn btn-secondary';
    ocrBtn.innerHTML = '<i class="fas fa-camera"></i> Escanear Documento';
    ocrBtn.style.marginTop = '10px';
    ocrBtn.addEventListener('click', () => {
        window.ManoExtension.openOCRScanner();
    });
    
    // Insert OCR button after the last button in the automation section
    const scheduleBtn = document.getElementById('schedule-appointment-btn');
    scheduleBtn.parentNode.insertBefore(ocrBtn, scheduleBtn.nextSibling);
});