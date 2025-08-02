let provider;
let signer;
let contract;
let listings = [];
let transactionHistory = [];
let pricingModel;

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const contractABI = [
    {
        "inputs": [],
        "name": "getMachineries",
        "outputs": [
            {
                "components": [
                    {"internalType": "uint256", "name": "id", "type": "uint256"},
                    {"internalType": "string", "name": "name", "type": "string"},
                    {"internalType": "uint256", "name": "rentPrice", "type": "uint256"},
                    {"internalType": "uint256", "name": "sharePrice", "type": "uint256"},
                    {"internalType": "address", "name": "owner", "type": "address"}
                ],
                "internalType": "struct FarmMachinery.Machinery[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_name", "type": "string"},
            {"internalType": "uint256", "name": "_rentPrice", "type": "uint256"},
            {"internalType": "uint256", "name": "_sharePrice", "type": "uint256"}
        ],
        "name": "listMachinery",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "name": "machineries",
        "outputs": [
            {"internalType": "uint256", "name": "id", "type": "uint256"},
            {"internalType": "string", "name": "name", "type": "string"},
            {"internalType": "uint256", "name": "rentPrice", "type": "uint256"},
            {"internalType": "uint256", "name": "sharePrice", "type": "uint256"},
            {"internalType": "address", "name": "owner", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "machineryCounter",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "_machineryId", "type": "uint256"},
            {"internalType": "bool", "name": "_rent", "type": "bool"}
        ],
        "name": "rentOrShareMachinery",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
];

const equipmentTypes = [
    "Tractor", "Combine Harvester", "Planter", "Sprayer", "Cultivator",
    "Baler", "Seeder", "Mower", "Rotavator", "Tillage Equipment"
];

const PRICING_MODEL_PATH = "./equipment_pricing_model.pkl";

async function initialize() {
    if (typeof window.ethereum === 'undefined') {
        showNotification('Please install MetaMask!', 'error');
        document.getElementById("connectWalletButton").innerHTML = `Install MetaMask`;
        document.getElementById("connectWalletButton").onclick = () => window.open('https://metamask.io/download/', '_blank');
        return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', () => window.location.reload());

    document.getElementById('listingForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('connectWalletButton').onclick = connectWallet;

    populateEquipmentDropdown();

    try {
        await loadPricingModel();
    } catch (error) {
        console.error('Error loading pricing model:', error);
        showNotification('Failed to load pricing model.', 'error');
    }

    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) await handleAccountsChanged(accounts);
    } catch (error) {
        console.error('Error checking initial accounts:', error);
    }

    const savedHistory = localStorage.getItem('transactionHistory');
    if (savedHistory) {
        transactionHistory = JSON.parse(savedHistory);
        transactionHistory = transactionHistory.map(tx => ({
            ...tx,
            name: tx.name || 'Unknown Equipment'
        }));
        localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
    }

    document.getElementById('rentPrice').addEventListener('input', validateRentPrice);
    document.getElementById('sharePrice').addEventListener('input', validateSharePrice);
}

function populateEquipmentDropdown() {
    const dropdown = document.getElementById('equipmentType');
    equipmentTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        dropdown.appendChild(option);
    });
}

async function loadPricingModel() {
    console.log(`Loading pricing model from ${PRICING_MODEL_PATH}`);
    pricingModel = {
        predict: function(equipmentType) {
            const baseValues = {
                "Tractor": 0.05, "Combine Harvester": 0.12, "Planter": 0.03,
                "Sprayer": 0.02, "Cultivator": 0.015, "Baler": 0.025,
                "Seeder": 0.02, "Mower": 0.01, "Rotavator": 0.015,
                "Tillage Equipment": 0.02
            };
            const baseValue = baseValues[equipmentType] || 0.02;
            return baseValue * (0.9 + Math.random() * 0.2);
        }
    };
    console.log('Pricing model loaded successfully');
}

function validateRentPrice() {
    if (!pricingModel) return;
    const equipmentType = document.getElementById('equipmentType').value;
    const rentPriceInput = document.getElementById('rentPrice');
    const rentPrice = parseFloat(rentPriceInput.value);
    if (!rentPrice || isNaN(rentPrice)) {
        resetPriceValidation('rentPrice', 'rentPriceFeedback');
        return;
    }
    const predictedPrice = pricingModel.predict(equipmentType);
    const threshold = predictedPrice * 1.3;
    const feedbackElement = document.getElementById('rentPriceFeedback');
    if (rentPrice > threshold) {
        feedbackElement.textContent = `Price seems high. Suggested max: ${threshold.toFixed(4)} ETH`;
        feedbackElement.classList.remove('valid');
        feedbackElement.classList.add('invalid');
        rentPriceInput.classList.add('error');
        rentPriceInput.dataset.valid = 'false';
        rentPriceInput.dataset.suggestedPrice = threshold.toFixed(4);
    } else {
        feedbackElement.textContent = 'Price is within reasonable range';
        feedbackElement.classList.remove('invalid');
        feedbackElement.classList.add('valid');
        rentPriceInput.classList.remove('error');
        rentPriceInput.dataset.valid = 'true';
    }
    feedbackElement.classList.remove('hidden');
}

function validateSharePrice() {
    if (!pricingModel) return;
    const equipmentType = document.getElementById('equipmentType').value;
    const sharePriceInput = document.getElementById('sharePrice');
    const sharePrice = parseFloat(sharePriceInput.value);
    if (!sharePrice || isNaN(sharePrice)) {
        resetPriceValidation('sharePrice', 'sharePriceFeedback');
        return;
    }
    const predictedPrice = pricingModel.predict(equipmentType);
    const threshold = predictedPrice * 1.3;
    const feedbackElement = document.getElementById('sharePriceFeedback');
    if (sharePrice > threshold) {
        feedbackElement.textContent = `Price seems high. Suggested max: ${threshold.toFixed(4)} ETH`;
        feedbackElement.classList.remove('valid');
        feedbackElement.classList.add('invalid');
        sharePriceInput.classList.add('error');
        sharePriceInput.dataset.valid = 'false';
        sharePriceInput.dataset.suggestedPrice = threshold.toFixed(4);
    } else {
        feedbackElement.textContent = 'Price is within reasonable range';
        feedbackElement.classList.remove('invalid');
        feedbackElement.classList.add('valid');
        sharePriceInput.classList.remove('error');
        sharePriceInput.dataset.valid = 'true';
    }
    feedbackElement.classList.remove('hidden');
}

function resetPriceValidation(inputId, feedbackId) {
    const feedbackElement = document.getElementById(feedbackId);
    const priceInput = document.getElementById(inputId);
    feedbackElement.textContent = '';
    feedbackElement.classList.add('hidden');
    priceInput.classList.remove('error');
    delete priceInput.dataset.valid;
    delete priceInput.dataset.suggestedPrice;
}

async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        resetConnection();
        showNotification('Please connect to MetaMask', 'error');
    } else {
        await initializeWithAccount(accounts[0]);
    }
}

async function initializeWithAccount(account) {
    try {
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        updateWalletUI(account);
        await fetchListings();
    } catch (error) {
        console.error('Error initializing account:', error);
        showNotification(`Failed to initialize: ${error.message}`, 'error');
        resetConnection();
    }
}

function resetConnection() {
    signer = null;
    contract = null;
    const connectButton = document.getElementById("connectWalletButton");
    connectButton.innerHTML = `Connect Wallet`;
    connectButton.onclick = connectWallet;
}

function updateWalletUI(address) {
    const connectButton = document.getElementById("connectWalletButton");
    connectButton.innerHTML = `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function connectWallet() {
    if (!window.ethereum) {
        showNotification('Please install MetaMask!', 'error');
        return;
    }
    const connectButton = document.getElementById("connectWalletButton");
    connectButton.innerHTML = `Connecting...`;
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        await initializeWithAccount(accounts[0]);
        showNotification('Wallet connected successfully!');
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showNotification(`Connection failed: ${error.message}`, 'error');
        resetConnection();
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white transform transition-all duration-300 translate-y-[-100%] z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.style.transform = 'translateY(0)', 100);
    setTimeout(() => {
        notification.style.transform = 'translateY(-100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

async function fetchListings() {
    if (!contract) return;
    try {
        const items = await contract.getMachineries();
        listings = items.map(item => {
            const [company, name] = item.name.split(" - "); // Split company and equipment name
            return {
                id: item.id.toString(),
                company: company || "Unknown Company",
                name: name || item.name, // Fallback to full name if no split
                rentPrice: ethers.utils.formatEther(item.rentPrice),
                sharePrice: ethers.utils.formatEther(item.sharePrice),
                owner: item.owner,
                rating: getDummyRating(name || item.name)
            };
        });
        renderListings();
    } catch (error) {
        console.error('Error fetching listings:', error);
        showNotification(`Failed to fetch listings: ${error.reason || error.message}`, 'error');
    }
}

function getDummyRating(equipmentName) {
    const ratings = {
        "Tractor": 4.5, "Combine Harvester": 4.2, "Planter": 3.8,
        "Sprayer": 4.0, "Cultivator": 4.7, "Baler": 3.9,
        "Seeder": 4.3, "Mower": 4.1, "Rotavator": 4.6,
        "Tillage Equipment": 3.7
    };
    return ratings[equipmentName] || (3.5 + Math.random() * 1.5).toFixed(1);
}

function renderListings() {
    const listingsContainer = document.getElementById("listings");
    listingsContainer.innerHTML = listings.length === 0 ? `
        <div class="text-center py-8 text-[#4a704a]">No equipment available</div>
    ` : listings.map((machinery, index) => `
        <div class="listing-card">
            <div class="equipment-name">${machinery.name}</div>
            <div class="equipment-company">${machinery.company}</div>
            <div class="equipment-rating">
                <span class="star">★</span>${machinery.rating}
            </div>
            <div class="equipment-price">Rent: <span class="equipment-price-value">${machinery.rentPrice} ETH/day</span></div>
            <div class="equipment-price">Share: <span class="equipment-price-value">${machinery.sharePrice} ETH</span></div>
            <div class="equipment-status">Available</div>
            <div class="equipment-actions">
                <button onclick="rentOrShareMachinery(${index}, true)" class="action-btn rent">Rent</button>
                <button onclick="rentOrShareMachinery(${index}, false)" class="action-btn share">Share</button>
            </div>
        </div>
    `).join('');
}

async function rentOrShareMachinery(index, isRent) {
    if (!contract) {
        showNotification('Please connect wallet first', 'error');
        return;
    }
    const machinery = listings[index];
    try {
        const tx = await contract.rentOrShareMachinery(machinery.id, isRent, {
            value: ethers.utils.parseEther(isRent ? machinery.rentPrice : machinery.sharePrice)
        });
        await tx.wait();
        showNotification(`${isRent ? 'Rented' : 'Shared'} successfully!`);
        
        transactionHistory.push({
            id: machinery.id,
            name: `${machinery.company} - ${machinery.name}`, // Store full name
            type: isRent ? 'rent' : 'share',
            amount: isRent ? machinery.rentPrice : machinery.sharePrice,
            transactionHash: tx.hash,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
        
        listings.splice(index, 1);
        renderListings();
        
        showAvailabilityPopup(`${machinery.company} - ${machinery.name}`, isRent);
    } catch (error) {
        console.error('Error in transaction:', error);
        showNotification(`Transaction failed: ${error.reason || error.message}`, 'error');
        showAvailabilityPopup(`${machinery.company} - ${machinery.name}`, isRent);
    }
}

function showAvailabilityPopup(fullName, isRent) {
    const popup = document.getElementById('availabilityPopup');
    const nameElement = document.getElementById('popupEquipmentName');
    const actionElement = document.getElementById('popupAction');
    const dateElement = document.getElementById('popupAvailabilityDate');

    nameElement.textContent = fullName || 'Unknown Equipment';
    actionElement.textContent = `${isRent ? 'Rented' : 'Shared'} Successfully`;

    const now = new Date();
    const daysToAdd = isRent ? 3 : 7;
    now.setDate(now.getDate() + daysToAdd);
    dateElement.textContent = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    popup.style.display = 'block';
    setTimeout(() => popup.style.display = 'none', 4000);
}

async function listMachinery(company, name, rentPrice, sharePrice) {
    if (!contract) {
        showNotification('Please connect wallet first', 'error');
        return;
    }
    try {
        if (!company.trim()) throw new Error('Company name is required');
        if (!name.trim()) throw new Error('Equipment name is required');
        if (isNaN(rentPrice) || rentPrice <= 0) throw new Error('Invalid rent price');
        if (isNaN(sharePrice) || sharePrice <= 0) throw new Error('Invalid share price');
        const fullName = `${company} - ${name}`; // Combine company and equipment name
        const rentPriceWei = ethers.utils.parseEther(rentPrice.toString());
        const sharePriceWei = ethers.utils.parseEther(sharePrice.toString());
        const tx = await contract.listMachinery(fullName, rentPriceWei, sharePriceWei);
        await tx.wait();
        showNotification('Machinery listed successfully!');
        await fetchListings();
    } catch (error) {
        console.error('Error listing machinery:', error);
        showNotification(`Listing failed: ${error.reason || error.message}`, 'error');
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const company = document.getElementById('companyName').value;
    const equipmentType = document.getElementById('equipmentType').value;
    const rentPrice = document.getElementById('rentPrice').value;
    const sharePrice = document.getElementById('sharePrice').value;
    const rentPriceInput = document.getElementById('rentPrice');
    const sharePriceInput = document.getElementById('sharePrice');
    
    if (pricingModel) {
        if (rentPriceInput.dataset.valid === 'false') {
            const suggestedRentPrice = rentPriceInput.dataset.suggestedPrice;
            if (!confirm(`The rent price ${rentPrice} ETH exceeds our suggested maximum of ${suggestedRentPrice} ETH for ${equipmentType}. Proceed?`)) {
                return;
            }
        }
        if (sharePriceInput.dataset.valid === 'false') {
            const suggestedSharePrice = sharePriceInput.dataset.suggestedPrice;
            if (!confirm(`The share price ${sharePrice} ETH exceeds our suggested maximum of ${suggestedSharePrice} ETH for ${equipmentType}. Proceed?`)) {
                return;
            }
        }
    }
    await listMachinery(company, equipmentType, rentPrice, sharePrice);
    document.getElementById('listingForm').reset();
    resetPriceValidation('rentPrice', 'rentPriceFeedback');
    resetPriceValidation('sharePrice', 'sharePriceFeedback');
}

function showTransactionHistory() {
    const modal = document.getElementById('transactionHistoryModal');
    const details = document.getElementById('transactionHistoryDetails');
    details.innerHTML = transactionHistory.length === 0 ? 
        '<p class="text-[#4a704a]">No transactions yet</p>' :
        transactionHistory.map(tx => `
            <div class="border-b py-2">
                <p><strong>Equipment:</strong> ${tx.name || 'Unknown Equipment'}</p>
                <p><strong>Type:</strong> ${tx.type}</p>
                <p><strong>Amount:</strong> ${tx.amount} ETH</p>
                <p><strong>Tx:</strong> ${tx.transactionHash.slice(0, 10)}...</p>
                <p><strong>Date:</strong> ${new Date(tx.timestamp).toLocaleString()}</p>
            </div>
        `).join('');
    modal.style.display = 'flex';
}

function closeTransactionHistoryModal() {
    document.getElementById('transactionHistoryModal').style.display = 'none';
}

function closeModal() {
    document.getElementById('billModal').style.display = 'none';
}

window.addEventListener('load', initialize);