import {
    createWalletClient,
    custom,
    getContract,
} from "https://esm.sh/viem";
import { sepolia } from "https://esm.sh/viem/chains";

const walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
});

// Funkcija za dobijanje MetaMask naloga
async function getAccounts() {
    try {
        const accounts = await walletClient.requestAddresses();
        return accounts;
    } catch (error) {
        console.error("Error fetching accounts:", error);
        return [];
    }
}

// Funkcija za prikazivanje tabele sa doktorima
function displayDoctors(doctors) {
    const tableBody = document.querySelector('#doctorTable tbody');
    tableBody.innerHTML = ''; // Clear previous content

    doctors.forEach(doctor => {
        const row = document.createElement('tr');
        
        const addressCell = document.createElement('td');
        addressCell.textContent = doctor.address;
        row.appendChild(addressCell);
        
        const nameCell = document.createElement('td');
        nameCell.textContent = doctor.userName;
        row.appendChild(nameCell);
        
        const actionCell = document.createElement('td');
        const button = document.createElement('button');
        button.textContent = 'Дозволи приступ';
        button.onclick = () => {
            // Implement access logic here
            alert(`Access granted to ${doctor.userName}`);
        };
        actionCell.appendChild(button);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });
}

// Modifikovana funkcija updateView da uključuje prikaz doktora
function updateView(address) {
    console.log("Current address:", address);

    // Adrese i imena doktora
    const doktori = [
        { address: "0x30ec46af58b4613e135d3b38348ca543d8032acc", userName: "др Андреа Милошевић" },
        { address: "0x0cd08bcf4c3c6a261f8f993938d2dd897f71267e", userName: "др Марко Марковић" },
        { address: "0x33e8aa8b54897352D3bA98D317CfAB82F6468a73", userName: "др Јелена Ивић" }
    ];
    const pacijenti = [
        { address: "0xad7ebe16749d2be378e519adf14166d9c41c908b", userName: "Пацијент Петар Ракић" },
        { address: "0xfd034b8bfd5da2864ab2e04fba88009971d97c82", userName: "Пацијент Соња Марић" },
        { address: "0xbF0aCd829d5F6bca4d5565da16A031cf17A96568", userName: "Пацијент Иван Стаменковић" }
    ];

    document.getElementById("account").innerHTML = address;

    // Pronalaženje korisničkog imena na osnovu adrese
    const userName = doktori.find(doc => doc.address.toLowerCase() === address.toLowerCase())
                      || pacijenti.find(pac => pac.address.toLowerCase() === address.toLowerCase())
                      || { userName: "Unknown User" };
    document.getElementById("userName").innerHTML = userName.userName;

    console.log("Doctors list:", doktori);
    console.log("Patients list:", pacijenti);

    // Sakrij sve sekcije
    document.querySelectorAll(".profile-section").forEach(section => {
        section.style.display = "none";
    });
    
    // Sakrij sve nav linkove
    document.querySelectorAll(".nav-link").forEach(link => {
        link.style.display = "none";
    });

    // Prikazivanje sekcija na osnovu naloga
    if (doktori.some(doc => doc.address.toLowerCase() === address.toLowerCase())) {
        console.log("Address is recognized as Doctor.");
        document.querySelectorAll(".doctor-only").forEach(el => el.style.display = "block");
        document.querySelectorAll(".patient-only").forEach(el => el.style.display = "none");
    } else if (pacijenti.some(pac => pac.address.toLowerCase() === address.toLowerCase())) {
        console.log("Address is recognized as Patient.");
        document.querySelectorAll(".doctor-only").forEach(el => el.style.display = "none");
        document.querySelectorAll(".patient-only").forEach(el => el.style.display = "block");
        displayDoctors(doktori); // Display the list of doctors for patients
    } else {
        console.log("Address is not recognized.");
    }
}


// Pokretanje funkcije nakon što se dokument učita
document.addEventListener("DOMContentLoaded", async () => {
    const accounts = await getAccounts();
    if (accounts.length === 0) {
        console.error("No accounts found.");
        return;
    }

    const [address] = accounts;
    console.log("Connected account:", address);

    // Pokretanje funkcije za početno učitavanje
    updateView(address);

    // Osluškivanje promene MetaMask naloga
    window.ethereum.on('accountsChanged', function (accounts) {
        if (accounts.length === 0) {
            console.error("No accounts found.");
            return;
        }

        const [newAddress] = accounts;
        console.log("Connected account:", newAddress);

        // Ažuriraj prikaz na osnovu novog naloga
        updateView(newAddress);
    });

    const MoodContractAddress = "0xc1919d32776df14340283891477510ed5aba3a02";
    const MoodContractABI = [
        {
            "inputs": [],
            "name": "getMood",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_mood",
                    "type": "string"
                }
            ],
            "name": "setMood",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    const MoodContractInstance = getContract({
        address: MoodContractAddress,
        abi: MoodContractABI,
        client: walletClient,
    });

    getMood = async function() {
        const mood = await MoodContractInstance.read.getMood();
        document.getElementById("showMood").innerText = `Your Mood: ${mood}`;
    }

    setMood = async function() {
        const mood = document.getElementById("mood").value;
        await MoodContractInstance.write.setMood([mood], {
            account: address
        });
    }
});
