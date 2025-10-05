// Mano - Content Script for Sisreg Interaction
// This script runs in the context of the Sisreg page

console.log('Mano Extension - Content script loaded');

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fillForm') {
        fillSisregForm(request.data);
        sendResponse({ success: true, message: 'Formulário preenchido!' });
    } else if (request.action === 'clickElement') {
        const element = document.querySelector(request.selector);
        if (element) {
            element.click();
            sendResponse({ success: true, message: 'Elemento clicado!' });
        } else {
            sendResponse({ success: false, message: 'Elemento não encontrado!' });
        }
    } else if (request.action === 'getElementText') {
        const element = document.querySelector(request.selector);
        if (element) {
            sendResponse({ success: true, data: element.textContent });
        } else {
            sendResponse({ success: false, message: 'Elemento não encontrado!' });
        }
    }
});

// Function to fill Sisreg form
function fillSisregForm(patientData) {
    try {
        // This is a placeholder implementation
        // In a real implementation, you would need to identify the actual selectors for Sisreg fields
        console.log('Preenchendo formulário com dados:', patientData);
        
        // Example of how you might fill fields (selectors would need to be updated)
        /*
        const fields = {
            'nome': 'input[name="nomePaciente"]',
            'cns': 'input[name="cartaoSus"]',
            'dataNascimento': 'input[name="dataNascimento"]',
            'telefone': 'input[name="telefone"]'
        };
        
        for (const [key, selector] of Object.entries(fields)) {
            if (patientData[key]) {
                const element = document.querySelector(selector);
                if (element) {
                    element.value = patientData[key];
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        }
        */
        
        return { success: true, message: 'Formulário preenchido com sucesso!' };
    } catch (error) {
        console.error('Erro ao preencher formulário:', error);
        return { success: false, message: `Erro: ${error.message}` };
    }
}

// Observe changes in the page to provide real-time assistance
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            // Check for specific elements that appear during Sisreg workflows
            // This could be used to provide contextual assistance
        }
    });
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});