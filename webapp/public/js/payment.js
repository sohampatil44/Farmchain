// ✅ Make sure ethers is loaded from CDN before this script
const { ethers } = window;

// Replace these with your deployed contract details
const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const abi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "listingId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "farmer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "numDays",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Rented",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "listingId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "numDays",
        "type": "uint256"
      }
    ],
    "name": "rent",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

async function payWithMethod(method, bookingId, amountINR, days, listingId) {
  const statusElement = document.getElementById("status");
  statusElement.innerText = `Initiating ${method} payment...`;
  console.log("payWithMethod called:", { method, bookingId, amountINR, days, listingId });

  if (!window.ethereum) {
    statusElement.innerText = "Metamask not detected. Please install Metamask.";
    alert("Please install Metamask!");
    return;
  }

  try {
    // 🔹 Connect wallet
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts.length) {
      statusElement.innerText = "No accounts connected in Metamask";
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // 🔹 Get ETH price in INR
    let ethPriceINR;
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr"
      );
      if (!response.ok) throw new Error("CoinGecko API failed");
      const data = await response.json();
      ethPriceINR = data.ethereum.inr;
    } catch (apiError) {
      console.error("CoinGecko error:", apiError);
      ethPriceINR = 200000; // fallback if API fails
      statusElement.innerText = "Using fallback ETH price due to API failure";
    }

    // 🔹 INR → ETH conversion
    const amountETH = (amountINR / ethPriceINR).toString();
    const amountWei = ethers.utils.parseEther(amountETH);

    // 🔹 Init contract
    const contract = new ethers.Contract(contractAddress, abi, signer);

    // 🔹 Ensure numeric IDs
    const numericListingId = Number(listingId);
    const numericDays = Number(days);

    if (isNaN(numericListingId) || numericListingId <= 0) {
      throw new Error("Invalid listingId passed from frontend");
    }
    if (isNaN(numericDays) || numericDays <= 0) {
      throw new Error("Invalid number of days passed from frontend");
    }

    // 🔹 Send transaction
    const tx = await contract.rent(numericListingId, numericDays, { value: amountWei });
    statusElement.innerText = "Transaction pending...";

    await tx.wait();
    statusElement.innerText = "Transaction confirmed!";

    // 🔹 Show ₹ icon and success message
    statusElement.innerHTML = '₹ Transaction Successful! <br> Tx Hash: ' + tx.hash;

    // 🔹 Notify backend
    const confirmRes = await fetch(`/farmer/confirm-booking/${bookingId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txHash: tx.hash }),
    });

    if (!confirmRes.ok) throw new Error("Backend confirmation failed");

    // 🔹 Redirect on success
    window.location.href = `/farmer/success/${bookingId}`;
  } catch (error) {
    console.error("Payment error:", error);
    if (error.code === 4001) {
      statusElement.innerText = "Transaction rejected by user";
    } else {
      statusElement.innerText = `Payment failed: ${error.message}`;
    }
  }
}

// 👈 Function to show UPI form
function showUpiForm(bookingId, amountINR, days, listingId) {
  const upiForm = document.getElementById('upi-form');
  upiForm.style.display = 'block';

  document.getElementById('submit-upi').onclick = function() {
    const upiId = document.getElementById('upi-id').value;
    if (upiId) {
      // Simulate UPI validation (just like razorpay)
      document.getElementById('status').innerText = 'UPI ID accepted. Processing blockchain transaction...';
      payWithMethod('upi', bookingId, amountINR, days, listingId);
    } else {
      alert('Please enter a UPI ID');
    }
  };
}