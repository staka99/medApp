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

    const MoodContractABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_doctor",
				"type": "address"
			}
		],
		"name": "grantAccess",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_doctor",
				"type": "address"
			}
		],
		"name": "revokeAccess",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "accessList",
		"outputs": [
			{
				"internalType": "address",
				"name": "patient",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "doctor",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAccessList",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "patient",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "doctor",
						"type": "address"
					}
				],
				"internalType": "struct AccessControl.Access[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_doctor",
				"type": "address"
			}
		],
		"name": "isAccessGranted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
    
    const MoodContractAddress = "0x6259B8C23C4fbD3244852B52F62E97c3ac3fD587";
    const MoodContractInstance = getContract({
        address: MoodContractAddress,
        abi: MoodContractABI,
        client: walletClient,
    });

    async function grantAccess( doctorAddress, account) {
        try {
            await MoodContractInstance.write.grantAccess([ doctorAddress], { account: address });
            console.log(`Access granted to doctor: ${doctorAddress} for patient: `);
        } catch (error) {
            console.error("Error granting access:", error);
        }
    }

    async function revokeAccess( doctorAddress, account) {
        try {
            await MoodContractInstance.write.revokeAccess([ doctorAddress], { account: address });
            console.log(`Access revoked from doctor: ${doctorAddress} for patient: `);
        } catch (error) {
            console.error("Error revoking access:", error);
        }
    }

    async function getAccessList() {
        try {
            const accessList = await MoodContractInstance.read.getAccessList();
            console.log("Access List:", accessList);
            return accessList;
        } catch (error) {
            console.error("Error fetching access list:", error);
            return [];
        }
    }

    async function isAccessGranted(doctorAddress) {
        try {
            console.log('Doctor Address:', doctorAddress);
            const result = await MoodContractInstance.read.isAccessGranted([doctorAddress], { account: address });
            console.log("Access Granted:", result);
            return result;
        } catch (error) {
            console.error("Error checking access:", error);
            return false;
        }
    }
    
    
     // Funkcija za prikazivanje tabele sa doktorima
     async function displayDoctors(patientAddress, doctors) {
        const tableBody = document.querySelector('#doctorTable tbody');
        tableBody.innerHTML = ''; // Clear previous content

        for (const doctor of doctors) {
            const row = document.createElement('tr');

            const addressCell = document.createElement('td');
            addressCell.textContent = doctor.address;
            row.appendChild(addressCell);

            const nameCell = document.createElement('td');
            nameCell.textContent = doctor.userName;
            row.appendChild(nameCell);

            const actionCell = document.createElement('td');
            const button = document.createElement('button');

            // Postavljeno kako bi se ispravno ucitali podaci iz SC (prvi nije povlacio tacne podatke)
            async function delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            await delay(300);
           
            // Proveravamo odmah stanje dozvole i ažuriramo dugme
            const hasAccess = await isAccessGranted(doctor.address);
            if (hasAccess) {
                button.classList.add('button-revoke');
                button.textContent = 'Уклони дозволу';
            } else {
                button.classList.add('button-grant');
                button.textContent = 'Дозволи приступ';
            }

            button.onclick = async () => {
                try {
                    console.log(patientAddress + " " + doctor.address);
                    if (await isAccessGranted(doctor.address)) {
                        await revokeAccess(doctor.address, address);
                        console.log("Access revoked.");
                    } else {
                        await grantAccess(doctor.address, address);
                        console.log("Access granted.");
                        console.log(getAccessList());
                    }
                    await updateView();
                } catch (error) {
                    console.error("Error handling button click:", error);
                }
            };
            actionCell.appendChild(button);
            row.appendChild(actionCell);

            tableBody.appendChild(row);
        }
    }


// Funkcija za prikazivanje liste pacijenata
function displayPatients(pacijenti) {
    const patientList = document.querySelector('#patientList');
    patientList.innerHTML = ''; // Clear previous content

    pacijenti.forEach(patient => {
        const patientDiv = document.createElement('div');
        patientDiv.className = 'patient-card'; // Apply CSS class

        const img = document.createElement('img');
        img.src = 'images/pac.png'; // Add patient image
        img.alt = 'Patient Image';
        img.height = 60; // Set image height
        patientDiv.appendChild(img);

        const infoDiv = document.createElement('div');

        const address = document.createElement('p');
        address.textContent = `Адреса: ${patient.address}`;
        infoDiv.appendChild(address);

        const name = document.createElement('p');
        name.textContent = `Име: ${patient.userName}`;
        infoDiv.appendChild(name);

        patientDiv.appendChild(infoDiv);
        patientList.appendChild(patientDiv);
    });
}


// Modifikovana funkcija updateView da uključuje prikaz pacijenata
function updateView(address) {
    console.log("Current address:", address);

    // Adrese i imena doktora
    const doktori = [
        { address: "0x30Ec46AF58b4613E135D3B38348cA543d8032aCC", userName: "др Андреа Милошевић" },
        { address: "0x0cd08bcf4c3c6a261f8f993938d2dd897f71267e", userName: "др Марко Марковић" },
        { address: "0x33e8aa8b54897352D3bA98D317CfAB82F6468a73", userName: "др Јелена Ивић" },
        { address: "0xa35cC38dB94c606bF3B17302fE0EbC12C3988888", userName: "др Урош Јовановић" }
    ];
    const pacijenti = [
        { address: "0xad7ebe16749d2be378e519adf14166d9c41c908b", userName: "Петар Ракић" },
        { address: "0xfd034b8bfd5da2864ab2e04fba88009971d97c82", userName: "Соња Марић" },
        { address: "0x82c45fCc136C5E7Be3e8a2aF02005a90E59E0D05", userName: "Јелена Петровић" },
        { address: "0xbf0acd829d5f6bca4d5565da16a031cf17a96568", userName: "Иван Стаменковић" }
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
        displayPatients(pacijenti); // Display the list of patients for doctors
    } else if (pacijenti.some(pac => pac.address.toLowerCase() === address.toLowerCase())) {
        console.log("Address is recognized as Patient.");
        document.querySelectorAll(".doctor-only").forEach(el => el.style.display = "none");
        document.querySelectorAll(".patient-only").forEach(el => el.style.display = "block");
        displayDoctors(address, doktori); // Display the list of doctors for patients
    } else {
        console.log("Address is not recognized.");
    }
}

});