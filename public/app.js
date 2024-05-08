const tokenContractAddressETH = "0x808688c820AB080A6Ff1019F03E5EC227D9b522B";
const tokenContractAddressBlast = "0xb9dfCd4CF589bB8090569cb52FaC1b88Dbe4981F";
const bridgeContractAddress = "0x697402166Fbf2F22E970df8a6486Ef171dbfc524";
const blastRPC = "https://rpc.blast.io";
let accounts, tokenContractETH, tokenContractBlast, bridgeContract, web3Blast;

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Document loaded. Initializing...");
    try {
        await init();
        await updateBalanceETH();
        await updateBalanceBlast();
        await updateAllowance();
        attachEventListeners();
    } catch (error) {
        console.error("Initialization failed:", error);
    }
});

function attachEventListeners() {
   

    document.getElementById('approveButton').addEventListener('click', async () => {
        const amountToBridgeETH = document.getElementById('amountToBridge').value;
        const amountToBridgeWEI = web3.utils.toWei(amountToBridgeETH, 'ether');
        console.log("Approving...", amountToBridgeWEI);
        try {
            await tokenContractETH.methods.approve(bridgeContractAddress, amountToBridgeWEI).send({ from: accounts[0] });
            await updateAllowance();
        } catch (error) {
            console.error("Error during approval:", error);
        }
    });

    document.getElementById('bridgeButton').addEventListener('click', async () => {
        const amountToBridgeETH = document.getElementById('amountToBridge').value;
        const amountToBridgeWEI = web3.utils.toWei(amountToBridgeETH, 'ether');
        console.log("Bridging...", amountToBridgeWEI);
        try {
            await bridgeContract.methods.bridgeERC20(tokenContractAddressETH, tokenContractAddressBlast, amountToBridgeWEI, '750000', '0x').send({ from: accounts[0] });
        } catch (error) {
            console.error("Error during bridging:", error);
        }
    });
}

async function init() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        web3Blast = new Web3(new Web3.providers.HttpProvider(blastRPC));
        try {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const tokenABI = await fetch('tokenABI.json').then(response => response.json());
            tokenContractETH = new web3.eth.Contract(tokenABI, tokenContractAddressETH);
            tokenContractBlast = new web3Blast.eth.Contract(tokenABI, tokenContractAddressBlast);
            const bridgeABI = await fetch('bridgeABI.json').then(response => response.json());
            bridgeContract = new web3.eth.Contract(bridgeABI, bridgeContractAddress);
            console.log("Contracts initialized.");
        } catch (error) {
            console.error("Could not get accounts or contracts initialized", error);
        }
    } else {
        console.error('MetaMask is not installed!');
        alert('MetaMask is not installed!');
    }
}

async function updateBalanceETH() {
    const balance = await tokenContractETH.methods.balanceOf(accounts[0]).call();
    document.getElementById('tokenBalanceETH').innerText = web3.utils.fromWei(balance, 'ether');
}

async function updateBalanceBlast() {
    const balance = await tokenContractBlast.methods.balanceOf(accounts[0]).call();
    document.getElementById('tokenBalanceBlast').innerText = web3Blast.utils.fromWei(balance, 'ether');
}

async function updateAllowance() {
    const allowance = await tokenContractETH.methods.allowance(accounts[0], bridgeContractAddress).call();
    console.log(allowance);
    updateButtonStates();
}

async function updateButtonStates() {
    const amountToBridgeETH = document.getElementById('amountToBridge').value || "0";
    const amountToBridgeWEI = web3.utils.toWei(amountToBridgeETH, 'ether');
    console.log(amountToBridgeWEI);
    const allowanceWEI = await tokenContractETH.methods.allowance(accounts[0], bridgeContractAddress).call();
    console.log(allowanceWEI);

    if (BigInt(amountToBridgeWEI) > 0n && BigInt(allowanceWEI) >= BigInt(amountToBridgeWEI)) {
        document.getElementById('approveButton').disabled = true;
        document.getElementById('bridgeButton').disabled = false;
    } else if (BigInt(amountToBridgeWEI) > 0n) {
        document.getElementById('approveButton').disabled = false;
        document.getElementById('bridgeButton').disabled = true;
    } else {
        document.getElementById('approveButton').disabled = true;
        document.getElementById('bridgeButton').disabled = true;
    }
}
