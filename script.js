// Função para redirecionar para a página do pallet específico
function redirectToPallet(palletId) {
    window.location.href = `pallet.html?pallet=${palletId}`;
}

// Função para obter o parâmetro "pallet" da URL
function getPalletFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('pallet');
}

// Função para exibir o nome do pallet na página
function displayPalletName() {
    const palletName = getPalletFromURL();
    if (palletName) {
        document.getElementById('pallet-name').textContent = `Pallet: ${palletName}`;
        loadItemsFromStorage(palletName); // Carregar os itens do Local Storage ao exibir o pallet
    } else {
        document.getElementById('pallet-name').textContent = 'Pallet não especificado';
    }
}

// Função para salvar item na tabela e no Local Storage
function addItem() {
    const itemName = document.getElementById('item-name').value;
    const itemQuantity = document.getElementById('item-quantity').value;
    const palletName = getPalletFromURL();

    // Validar entrada
    if (itemName === '' || itemQuantity === '') {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Adicionar item à tabela
    addItemToTable(itemName, itemQuantity);

    // Salvar item no Local Storage
    saveItemToStorage(palletName, itemName, itemQuantity);

    // Limpar campos de entrada
    document.getElementById('item-name').value = '';
    document.getElementById('item-quantity').value = '';
}

// Função para adicionar uma linha na tabela
function addItemToTable(itemName, itemQuantity) {
    const itemsList = document.getElementById('items-list');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${itemName}</td>
        <td>${itemQuantity}</td>
    `;
    itemsList.appendChild(row);
}

// Função para salvar o item no Local Storage
function saveItemToStorage(palletName, itemName, itemQuantity) {
    // Recupera os itens existentes no Local Storage
    const storedItems = JSON.parse(localStorage.getItem(palletName)) || [];
    
    // Adiciona o novo item
    storedItems.push({ itemName, itemQuantity });
    
    // Armazena novamente os itens atualizados no Local Storage
    localStorage.setItem(palletName, JSON.stringify(storedItems));
}

// Função para carregar os itens do Local Storage e exibir na tabela
function loadItemsFromStorage(palletName) {
    // Recupera os itens armazenados para o pallet atual
    const storedItems = JSON.parse(localStorage.getItem(palletName)) || [];
    
    // Adiciona cada item à tabela
    storedItems.forEach(item => addItemToTable(item.itemName, item.itemQuantity));
}

// Exibir o nome do pallet quando a página carregar
window.onload = displayPalletName;



















// Variável global para o banco de dados
let db;

// Função para abrir/criar o banco de dados
function openDatabase() {
    const request = indexedDB.open("PalletDB", 1);

    // Se o banco não existir, cria as tabelas
    request.onupgradeneeded = (event) => {
        db = event.target.result;
        const objectStore = db.createObjectStore("items", { keyPath: "id", autoIncrement: true });
        objectStore.createIndex("pallet", "pallet", { unique: false });
    };

    // Se abrir o banco com sucesso
    request.onsuccess = (event) => {
        db = event.target.result;
        displayPalletName(); // Chama a função para carregar o nome do pallet e os itens do banco de dados
    };

    // Se ocorrer um erro ao abrir o banco
    request.onerror = (event) => {
        console.error("Erro ao abrir o banco de dados:", event.target.errorCode);
    };
}

// Função para obter o parâmetro "pallet" da URL
function getPalletFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('pallet');
}

// Função para exibir o nome do pallet na página e carregar os itens do banco
function displayPalletName() {
    const palletName = getPalletFromURL();
    if (palletName) {
        document.getElementById('pallet-name').textContent = `Pallet: ${palletName}`;
        loadItemsFromDatabase(palletName); // Carregar itens do IndexedDB para o pallet atual
    } else {
        document.getElementById('pallet-name').textContent = 'Pallet não especificado';
    }
}

// Função para adicionar item ao banco de dados
function addItem() {
    const itemName = document.getElementById('item-name').value;
    const itemQuantity = document.getElementById('item-quantity').value;
    const palletName = getPalletFromURL();

    // Validar entrada
    if (itemName === '' || itemQuantity === '') {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Salvar item no banco de dados
    const transaction = db.transaction(["items"], "readwrite");
    const objectStore = transaction.objectStore("items");
    const item = { pallet: palletName, itemName, itemQuantity };

    const request = objectStore.add(item);
    request.onsuccess = () => {
        addItemToTable(itemName, itemQuantity); // Adiciona o item à tabela
        document.getElementById('item-name').value = '';
        document.getElementById('item-quantity').value = '';
    };

    request.onerror = (event) => {
        console.error("Erro ao adicionar item:", event.target.errorCode);
    };
}

// Função para adicionar uma linha na tabela
function addItemToTable(itemName, itemQuantity) {
    const itemsList = document.getElementById('items-list');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${itemName}</td>
        <td>${itemQuantity}</td>
    `;
    itemsList.appendChild(row);
}

// Função para carregar os itens do banco de dados e exibir na tabela
function loadItemsFromDatabase(palletName) {
    const transaction = db.transaction(["items"], "readonly");
    const objectStore = transaction.objectStore("items");
    const index = objectStore.index("pallet");

    // Recupera os itens do pallet atual
    const request = index.openCursor(IDBKeyRange.only(palletName));
    request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            addItemToTable(cursor.value.itemName, cursor.value.itemQuantity);
            cursor.continue();
        }
    };

    request.onerror = (event) => {
        console.error("Erro ao carregar itens:", event.target.errorCode);
    };
}

// Abrir o banco de dados ao carregar a página
window.onload = openDatabase;















function addItemToTable(itemName, itemQuantity, itemId) {
    const itemsList = document.getElementById('items-list');
    const row = document.createElement('tr');
    row.setAttribute("data-id", itemId); // Armazenamos o ID do item na linha

    row.innerHTML = `
        <td>${itemName}</td>
        <td>${itemQuantity}</td>
        <td><button onclick="removeItem(${itemId})">Remover</button></td>
    `;
    itemsList.appendChild(row);
}

function removeItem(itemId) {
    // Remover o item da interface
    const row = document.querySelector(`tr[data-id="${itemId}"]`);
    if (row) {
        row.remove();
    }

    // Remover o item do banco de dados
    const transaction = db.transaction(["items"], "readwrite");
    const objectStore = transaction.objectStore("items");
    const request = objectStore.delete(itemId);

    request.onsuccess = () => {
        console.log(`Item ${itemId} removido com sucesso.`);
    };

    request.onerror = (event) => {
        console.error("Erro ao remover item:", event.target.errorCode);
    };
}

function loadItemsFromDatabase(palletName) {
    const transaction = db.transaction(["items"], "readonly");
    const objectStore = transaction.objectStore("items");
    const index = objectStore.index("pallet");

    const request = index.openCursor(IDBKeyRange.only(palletName));
    request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            const { itemName, itemQuantity, id: itemId } = cursor.value;
            addItemToTable(itemName, itemQuantity, itemId);
            cursor.continue();
        }
    };

    request.onerror = (event) => {
        console.error("Erro ao carregar itens:", event.target.errorCode);
    };
}
