// Malaysia TIN Validator
// Contributed by Min Myat Oo

const generalTINs = {
    "EI00000000010": "General Public's TIN",
    "EI00000000020": "Foreign Buyer's TIN",
    "EI00000000030": "Foreign Supplier's TIN",
    "EI00000000040": "Buyer's TIN for special cases"
};

let validationHistory = [];
let statistics = { valid: 0, invalid: 0 };

function validateTIN() {
    const tinInput = document.getElementById('tinInput').value.trim().toUpperCase();
    const resultElement = document.getElementById('result');
    const detailsElement = document.getElementById('details');

    if (tinInput.length === 0) {
        displayResult('Please enter a TIN or NIRC number.', 'warning');
        detailsElement.innerHTML = '';
        return;
    }

    const validationResult = isValidTIN(tinInput);

    if (validationResult.isValid) {
        displayResult('Valid TIN/NIRC number!', 'success');
        displayDetails(validationResult.type, validationResult.category);
        statistics.valid++;
    } else {
        displayResult('Invalid TIN/NIRC number.', 'danger');
        detailsElement.innerHTML = '';
        statistics.invalid++;
    }

    addToHistory(tinInput, validationResult.isValid);
    updateStatistics();
    animateResult();
}

function isValidTIN(tin) {
    // Check for general TINs
    if (generalTINs.hasOwnProperty(tin)) {
        return {
            isValid: true,
            type: 'General TIN',
            category: generalTINs[tin]
        };
    }

    // Individual TIN validation
    if (tin.startsWith('IG') && tin.length === 12) {
        return {
            isValid: true,
            type: 'Individual TIN',
            category: 'New Version'
        };
    }

    // Non-Individual TIN validation
    if (['C', 'D', 'E', 'F'].includes(tin[0]) && tin.length === 11) {
        return {
            isValid: true,
            type: 'Non-Individual TIN',
            category: 'New Version'
        };
    }

    // Old version Individual TIN validation
    if (['SG', 'OG'].includes(tin.substring(0, 2)) && tin.length === 11) {
        return {
            isValid: true,
            type: 'Individual TIN',
            category: 'Old Version'
        };
    }

    // Old version Non-Individual TIN validation
    if (['C', 'D', 'E', 'F'].includes(tin[0]) && tin.length === 10) {
        return {
            isValid: true,
            type: 'Non-Individual TIN',
            category: 'Old Version'
        };
    }

    return { isValid: false };
}

function displayResult(message, className) {
    const resultElement = document.getElementById('result');
    resultElement.textContent = message;
    resultElement.className = `alert alert-${className} d-block fade-in`;
}

function displayDetails(type, category) {
    const detailsElement = document.getElementById('details');
    detailsElement.innerHTML = `
        <p class="mb-1"><strong>Type:</strong> ${type}</p>
        <p class="mb-0"><strong>Category:</strong> ${category}</p>
    `;
    detailsElement.className = 'mt-3 fade-in';
}

function generateRandomTIN() {
    const types = [
        { prefix: 'IG', length: 12 },
        { prefix: 'C', length: 11 },
        { prefix: 'D', length: 11 },
        { prefix: 'E', length: 11 },
        { prefix: 'F', length: 11 },
        { prefix: 'SG', length: 11 },
        { prefix: 'OG', length: 11 }
    ];

    const randomType = types[Math.floor(Math.random() * types.length)];
    let tin = randomType.prefix;

    for (let i = tin.length; i < randomType.length; i++) {
        tin += Math.floor(Math.random() * 10);
    }

    document.getElementById('tinInput').value = tin;
    validateTIN();
}

function copyToClipboard() {
    const tinInput = document.getElementById('tinInput');
    tinInput.select();
    document.execCommand('copy');
    
    displayResult('TIN copied to clipboard!', 'info');
    
    setTimeout(() => {
        validateTIN();
    }, 1500);
}

function animateResult() {
    const resultElement = document.getElementById('result');
    const detailsElement = document.getElementById('details');
    
    resultElement.classList.remove('fade-in');
    detailsElement.classList.remove('fade-in');
    
    void resultElement.offsetWidth; // Trigger reflow
    void detailsElement.offsetWidth; // Trigger reflow
    
    resultElement.classList.add('fade-in');
    detailsElement.classList.add('fade-in');
}

function addToHistory(tin, isValid) {
    const timestamp = new Date().toLocaleString();
    validationHistory.unshift({ tin, isValid, timestamp });
    if (validationHistory.length > 10) {
        validationHistory.pop();
    }
    updateHistoryList();
}

function updateHistoryList() {
    const historyList = document.getElementById('historyList');
    if (historyList) {
        historyList.innerHTML = '';
        validationHistory.forEach(item => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                ${item.tin}
                <span>
                    <span class="badge bg-${item.isValid ? 'success' : 'danger'}">${item.isValid ? 'Valid' : 'Invalid'}</span>
                    <small class="text-muted ms-2">${item.timestamp}</small>
                </span>
            `;
            historyList.appendChild(li);
        });
    }
}

function exportHistory() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "TIN,Valid,Timestamp\n";
    validationHistory.forEach(item => {
        csvContent += `${item.tin},${item.isValid},${item.timestamp}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tin_validation_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function updateStatistics() {
    const statsElement = document.getElementById('statistics');
    if (statsElement) {
        statsElement.innerHTML = `
            <p>Total Validations: ${statistics.valid + statistics.invalid}</p>
            <p>Valid: ${statistics.valid} (${calculatePercentage(statistics.valid)}%)</p>
            <p>Invalid: ${statistics.invalid} (${calculatePercentage(statistics.invalid)}%)</p>
        `;
    }
}

function calculatePercentage(value) {
    const total = statistics.valid + statistics.invalid;
    return total === 0 ? 0 : ((value / total) * 100).toFixed(2);
}

function clearHistory() {
    validationHistory = [];
    statistics = { valid: 0, invalid: 0 };
    updateHistoryList();
    updateStatistics();
}

function bulkValidate() {
    const bulkInput = document.getElementById('bulkInput');
    if (bulkInput) {
        const tins = bulkInput.value.split('\n').map(tin => tin.trim()).filter(tin => tin !== '');
        const results = tins.map(tin => {
            const result = isValidTIN(tin);
            addToHistory(tin, result.isValid);
            if (result.isValid) {
                statistics.valid++;
            } else {
                statistics.invalid++;
            }
            return { tin, isValid: result.isValid };
        });
        
        displayBulkResults(results);
        updateStatistics();
        updateHistoryList();
    }
}

function displayBulkResults(results) {
    const bulkResultsElement = document.getElementById('bulkResults');
    if (bulkResultsElement) {
        bulkResultsElement.innerHTML = '';
        results.forEach(result => {
            const div = document.createElement('div');
            div.className = `alert alert-${result.isValid ? 'success' : 'danger'} mb-2`;
            div.textContent = `${result.tin}: ${result.isValid ? 'Valid' : 'Invalid'}`;
            bulkResultsElement.appendChild(div);
        });
    }
}

// Add event listener for Enter key
document.addEventListener('DOMContentLoaded', function() {
    const tinInput = document.getElementById('tinInput');
    if (tinInput) {
        tinInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                validateTIN();
            }
        });
    }

    // Initialize history list and statistics
    updateHistoryList();
    updateStatistics();
});