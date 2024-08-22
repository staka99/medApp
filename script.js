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
                    "name": "_person",
                    "type": "address"
                }
            ],
            "name": "allowPermission",
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
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "allowedPermission",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "grantedAccesses",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_patient",
                    "type": "address"
                }
            ],
            "name": "hasAccess",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_person",
                    "type": "address"
                }
            ],
            "name": "hasPermission",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
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
    
    const MoodContractAddress = "0x74bB1E4378ec015613375F0FDEcFee21Bd6eAB3B";
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

    async function isAccessGranted(doctorAddress) {
        try {
            const result = await MoodContractInstance.read.isAccessGranted([doctorAddress], { account: address });
            return result;
        } catch (error) {
            console.error("Error checking access:", error);
            return false;
        }
    }

    async function hasAccess(patientAddress) {
        try {
            const result = await MoodContractInstance.read.hasAccess([patientAddress], { account: address });
            return result;
        } catch (error) {
            console.error("Error checking access:", error);
            return false;
        }
    }
    
    async function allowPermission( personalAddress, account) {
        try {
            await MoodContractInstance.write.allowPermission([personalAddress], { account: address });
        } catch (error) {
            console.error("Грешка:", error);
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

    function displayPatients(pacijenti) {
        const patientList = document.querySelector('#patientList');
        patientList.innerHTML = ''; 

        pacijenti.forEach(patient => {
            const patientDiv = document.createElement('div');
            patientDiv.className = 'patient-card'; 

            const img = document.createElement('img');
            img.src = 'images/pac.png'; 
            img.alt = 'Patient Image';
            img.height = 60; 
            patientDiv.appendChild(img);

            const infoDiv = document.createElement('div');

            const address = document.createElement('p');
            address.textContent = `Адреса: ${patient.address}`;
            infoDiv.appendChild(address);

            const name = document.createElement('p');
            name.textContent = `Име: ${patient.userName}`;
            infoDiv.appendChild(name);

            patientDiv.appendChild(infoDiv);

            // Dodajte listener za klik na karticu pacijenta
            patientDiv.addEventListener('click', async () => {
                console.log(hasAccess(patient.address));
                const hasAccessDoctor = await hasAccess(patient.address);
                console.log(hasAccessDoctor);
                console.log(patient.address)
                
                // Proširite div na 100% prilikom klika
                patientDiv.classList.toggle('expanded');

                async function delay(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }
                await delay(300);
                
                // Pronađite ili kreirajte element za status pristupa
                let accessStatus = patientDiv.querySelector('.access-status');
                if (!accessStatus) {
                    accessStatus = document.createElement('p');
                    accessStatus.className = 'access-status';
                    patientDiv.appendChild(accessStatus);
                }

                // Prikaz ili skrivanje teksta na osnovu trenutnog stanja
                if (patientDiv.classList.contains('expanded')) {
                    if(hasAccessDoctor) {
                        const table = document.createElement('table');
                        table.className = 'operation-table';
                        const headerRow = document.createElement('tr');
                        
                        const dateHeader = document.createElement('th');
                        dateHeader.textContent = 'Датум';
                        headerRow.appendChild(dateHeader);
                        
                        const descriptionHeader = document.createElement('th');
                        descriptionHeader.textContent = 'Опис операције';
                        headerRow.appendChild(descriptionHeader);
                
                        table.appendChild(headerRow);
                
                        patient.operations.forEach(operation => {
                            const row = document.createElement('tr');
                
                            const dateCell = document.createElement('td');
                            dateCell.textContent = operation.date;
                            row.appendChild(dateCell);
                
                            const descriptionCell = document.createElement('td');
                            descriptionCell.textContent = operation.description;
                            row.appendChild(descriptionCell);
                
                            table.appendChild(row);
                        });
                
                        accessStatus.appendChild(table);
                    } else {
                        accessStatus.textContent = 'Немате дозволу приступа овим подацима.';
                        accessStatus.classList.add('no-access');
              
                    }
                } else {
                    accessStatus.innerHTML = '';
                }
            });

            patientList.appendChild(patientDiv);
        });
    }

    // Funkcija za dodavanje pristupa
    document.getElementById('addAccessButton').addEventListener('click', async () => {
        const personalAddress = document.getElementById('metaMaskAddress').value.trim();
        const account = await getAccounts();

        if (personalAddress && account.length > 0) {
            await allowPermission(personalAddress, account[0]);
            console.log(`Дато је овлашћење особи са адресом: ${personalAddress}`);
        } else {
            console.error("Нисте унели адресу или не сте повезани са MetaMask.");
        }
    });

    function updateView(address) {
        console.log("Current address:", address);

        const doktori = [
            { address: "0x30Ec46AF58b4613E135D3B38348cA543d8032aCC", userName: "др Андреа Милошевић" },
            { address: "0x0cd08bcf4c3c6a261f8f993938d2dd897f71267e", userName: "др Марко Марковић" },
            { address: "0x33e8aa8b54897352D3bA98D317CfAB82F6468a73", userName: "др Јелена Ивић" },
            { address: "0xa35cC38dB94c606bF3B17302fE0EbC12C3988888", userName: "др Урош Јовановић" }
        ];

        const pacijenti = [
            {
                address: "0xad7ebe16749d2be378e519adf14166d9c41c908b",
                userName: "Петар Ракић",
                operations: [
                    { date: "15.07.2023.", description: "Апендиксектомија" },
                    { date: "20.02.2024.", description: "Операција колена" },
                    { date: "25.07.2024.", description: "Eстетска корекација носа" }
                ]
            },
            {
                address: "0xfd034b8bfd5da2864ab2e04fba88009971d97c82",
                userName: "Соња Марић",
                operations: [
                    { date: "10.11.2022.", description: "Хируршка интервенција на срцу" },
                    { date: "06.09.2023.", description: "Операција катаракте" }
                ]
            },
            {
                address: "0x82c45fCc136C5E7Be3e8a2aF02005a90E59E0D05",
                userName: "Јелена Петровић",
                operations: [
                    { date: "18.03.2021.", description: "Операција жучне кесе" },
                    { date: "25.12.2023.", description: "Пластична операција носа" }
                ]
            },
            {
                address: "0xbf0acd829d5f6bca4d5565da16a031cf17a96568",
                userName: "Иван Стаменковић",
                operations: [
                    { date: "10.01.2023.", description: "Ласерска корекција вида" },
                    { date: "04.01.2024.", description: "Операција кичме" }
                ]
            }
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