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
				"name": "_person1",
				"type": "address"
			}
		],
		"name": "aprovePerson",
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
		"name": "grandAccessForDoctor",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_patient",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_doctor",
				"type": "address"
			}
		],
		"name": "grantAccessToAnotherPerson",
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
		"name": "recoveAccessForDoctor",
		"outputs": [],
		"stateMutability": "nonpayable",
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
		"name": "revokeEmergencyCall",
		"outputs": [],
		"stateMutability": "nonpayable",
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
		"name": "triggerEmergency",
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
		"name": "approvedPersons",
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
		"name": "doctorAccess",
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
			}
		],
		"name": "emergencyCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "emergencyThreshold",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
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
		"name": "hasDoctorTriggeredEmergency",
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
		"name": "hasTriggeredEmergency",
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
		"name": "haveAccessToPatient",
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
		"name": "isAccessForDoctorGranted",
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
				"name": "_person2",
				"type": "address"
			}
		],
		"name": "isApprovedForPerson",
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
		"name": "isEmergencyActivated",
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
    
    const MoodContractAddress = "0xEa562c14edd459fBC3867266e68381B411bc3097";
    const MoodContractInstance = getContract({
        address: MoodContractAddress,
        abi: MoodContractABI,
        client: walletClient,
    });

    // Aктивности пацијената из ПУ
    async function grandAccessForDoctor( doctorAddress, account) {
        try {
            await MoodContractInstance.write.grandAccessForDoctor([ doctorAddress], { account: address });
            console.log(`Access granted to doctor: ${doctorAddress} for patient: `);
        } catch (error) {
            console.error("Error granting access:", error);
        }
    }

    async function recoveAccessForDoctor( doctorAddress, account) {
        try {
            await MoodContractInstance.write.recoveAccessForDoctor([ doctorAddress], { account: address });
            console.log(`Access revoked from doctor: ${doctorAddress} for patient: `);
        } catch (error) {
            console.error("Error revoking access:", error);
        }
    }

    async function isAccessForDoctorGranted(doctorAddress) {
        try {
            const result = await MoodContractInstance.read.isAccessForDoctorGranted([doctorAddress], { account: address });
            return result;
        } catch (error) {
            console.error("Error checking access:", error);
            return false;
        }
    }

    async function haveAccessToPatient(patientAddress) {
        try {
            const result = await MoodContractInstance.read.haveAccessToPatient([patientAddress], { account: address });
            return result;
        } catch (error) {
            console.error("Error checking access:", error);
            return false;
        }
    }
    
    async function aprovePerson(personalAddress, account) {
        try {
            await MoodContractInstance.write.aprovePerson([personalAddress], { account: address });
        } catch (error) {
            console.error("Грешка:", error);
        }
    }

    async function isApprovedForPerson(personalAddress, account) {
        try {
            const result = await MoodContractInstance.read.isApprovedForPerson([personalAddress], { account: address });
            return result;
        } catch (error) {
            console.error("Error checking access:", error);
            return false;
        }
    }

    async function grantAccessToAnotherPerson(patientAddress, doctorAddress) {
        try {
            await MoodContractInstance.write.grantAccessToAnotherPerson([patientAddress, doctorAddress], { account: address });
            console.log(`Access granted to doctor: ${doctorAddress} for patient: `);
        } catch (error) {
            console.error("Error granting access:", error);
        }
    }

    // Aктивности лекара из ПУ
    async function triggerEmergency( patientAddress, account) {
        try {
            await MoodContractInstance.write.triggerEmergency([patientAddress], { account: address });
        } catch (error) {
            console.error("Грешка:", error);
        }
    }

    async function revokeEmergencyCall( patientAddress, account) {
        try {
            await MoodContractInstance.write.revokeEmergencyCall([patientAddress], { account: address });
        } catch (error) {
            console.error("Error revoking access:", error);
        }
    }

    async function isEmergencyActivated(patientAddress, account) {
        try {
            const result = await MoodContractInstance.read.isEmergencyActivated([patientAddress], { account: address });
            return result;
        } catch (error) {
            console.error("Error checking access:", error);
            return false;
        }
    }

    async function hasDoctorTriggeredEmergency(patientAddress, account) {
        try {
            const result = await MoodContractInstance.read.hasDoctorTriggeredEmergency([patientAddress], { account: address });
            return result;
        } catch (error) {
            console.error("Error checking access:", error);
            return false;
        }
    }

    
    // Приказ лекара
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
            const hasAccess = await isAccessForDoctorGranted(doctor.address);
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
                    if (await isAccessForDoctorGranted(doctor.address)) {
                        await recoveAccessForDoctor(doctor.address, address);
                        console.log("Access revoked.");
                    } else {
                        await grandAccessForDoctor(doctor.address, address);
                        console.log("Access granted.");
                    }
                    await updateView();
                } catch (error) {
                    console.error("Error handling button click:", error);
                }
            };
            actionCell.appendChild(button);
            row.appendChild(actionCell);

            // друго дугме
            const button2 = document.createElement('button');
            button2.classList.add('button-procedure');
            button2.textContent = 'Дозвола за другу особу';
            button2.onclick = () => {
                try {
                    openAccessModal(doctor.address);
                } catch (error) {
                    console.error('Грешка са покретањем процедуре:', error);
                }
            };
            actionCell.appendChild(button2);
            row.appendChild(actionCell);
    

            tableBody.appendChild(row);
        }
    }

    // Функција за дијалог
    function openAccessModal(doctorAddress) {
        const modal = document.getElementById('accessModal');
        const closeButton = document.querySelector('.close-button');
        const grantAccessButton  = document.getElementById('modalButton');
        const messageElement = document.getElementById('message'); // Element za poruku
        const metaMaskAddressInput = document.getElementById('metaMaskAddress');

        modal.style.display = 'block';
        metaMaskAddressInput.value = '';
        messageElement.style.display = 'none';

        closeButton.onclick = () => {
            modal.style.display = 'none';
            messageElement.style.display = 'none';
        };

        grantAccessButton .onclick = async () => {
            const address = metaMaskAddressInput.value;
            if (address) {
                try {
                    const permission = await isApprovedForPerson(address);
                    messageElement.textContent = ''; 
                    if(permission){
                        messageElement.textContent = 'Приступ успешно одобрен!';
                        messageElement.classList.remove('error');
                        messageElement.classList.add('success');
                        messageElement.style.display = 'block'; 
                        console.log(address);
                        console.log(doctorAddress);
                        await grantAccessToAnotherPerson(address, doctorAddress);
                    } else {
                        messageElement.textContent = 'Није унесена исправна адреса или немате овлашћење за ову особу.';
                        messageElement.classList.remove('success');
                        messageElement.classList.add('error');
                        messageElement.style.display = 'block';
                    }
                } catch (error) {
                    console.error('Грешка:', error);
                    messageElement.textContent = 'Дошло је до грешке. Пожалите се администратору.';
                    messageElement.classList.remove('success');
                    messageElement.classList.add('error');
                    messageElement.style.display = 'block';
                }
            } else {
                messageElement.textContent = 'Молимо вас да унесете адресу.';
                messageElement.classList.remove('success');
                messageElement.classList.add('error');
                messageElement.style.display = 'block';
            }
        };
    }

    // Функција за давање овлашћења
     document.getElementById('addAccessButton').addEventListener('click', async () => {
         const personalAddress = document.getElementById('addressAccessCard').value.trim();
         const account = await getAccounts();
         console.log(personalAddress);

         if (personalAddress && account.length > 0) {
            await aprovePerson(personalAddress);
               console.log(`Дато је овлашћење особи са адресом: ${personalAddress}`);
        } else {
            console.error("Нисте унели адресу или не сте повезани са MetaMask.");
        }
    });
    
    // Приказ
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
                const hasAccessDoctor = await haveAccessToPatient(patient.address);
                console.log(hasAccessDoctor);
                console.log(patient.address)
                
                // Proširite div na 100% prilikom klika
                patientDiv.classList.toggle('expanded');

                async function delay(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }
                await delay(300);
                
                // novo
                //triggerEmergency(patient.address);

                // Pronađite ili kreirajte element za status pristupa
                let accessStatus = patientDiv.querySelector('.access-status');
                if (!accessStatus) {
                    accessStatus = document.createElement('p');
                    accessStatus.className = 'access-status';
                    patientDiv.appendChild(accessStatus);
                }

                // Prikaz ili skrivanje teksta na osnovu trenutnog stanja
                if (patientDiv.classList.contains('expanded')) {
                    const isEmergency = await isEmergencyActivated(patient.address);
                    if(hasAccessDoctor || isEmergency) {
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

                        
                    if(isEmergency) {
                        const emergencyButton = document.createElement('button');
                        emergencyButton.className = 'emergency-button'; 
                        if (await hasDoctorTriggeredEmergency(patient.address)) {
                            emergencyButton.textContent = 'Откажите хитан случај';
                        } else {
                            emergencyButton.textContent = 'Хитан случај';
                        }
                    
                        // Dodajte dugme u accessStatus div
                        accessStatus.appendChild(emergencyButton);
                    
                        // Opcionalno: Dodajte event listener za klik na dugme
                        emergencyButton.addEventListener('click', () => {
                            if (hasDoctorTriggeredEmergency(patient.address)) {
                                revokeEmergencyCall(patient.address);
                            } else {
                                triggerEmergency(patient.address);
                            }
                        });
                        }
                    } else {
                        accessStatus.textContent = 'Немате дозволу приступа овим подацима.';
                        accessStatus.classList.add('no-access');

                        const emergencyButton = document.createElement('button');
                        emergencyButton.className = 'emergency-button'; 
                        if (await hasDoctorTriggeredEmergency(patient.address)) {
                            emergencyButton.textContent = 'Откажите хитан случај';
                        } else {
                            emergencyButton.textContent = 'Хитан случај';
                        }
                    
                        // Dodajte dugme u accessStatus div
                        accessStatus.appendChild(emergencyButton);
                    
                        // Opcionalno: Dodajte event listener za klik na dugme
                        emergencyButton.addEventListener('click', () => {
                            if (hasDoctorTriggeredEmergency(patient.address)) {
                                triggerEmergency(patient.address);
                            } else {
                                revokeEmergencyCall(patient.address);
                            }
                        });
                    }
                } else {
                    accessStatus.innerHTML = '';
                }
            });

            patientList.appendChild(patientDiv);
        });
    }

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