// --- Inicialização do Firebase (modo clássico) ---
const firebaseConfig = {
  apiKey: "AIzaSyDDEVrDD5hZJknbvL0YHx2ndizaMQqQwbA",
  authDomain: "my-cep-4dbc9.firebaseapp.com",
  projectId: "my-cep-4dbc9",
  storageBucket: "my-cep-4dbc9.firebasestorage.app",
  messagingSenderId: "890264134825",
  appId: "1:890264134825:web:8b00039046ff2758faf5b8",
  measurementId: "G-24GRD3HM31"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Referência ao Firestore
const db = firebase.firestore();

// --- Elementos ---
const form = document.getElementById("registrationForm");
const userList = document.getElementById("userList");
const cepInput = document.getElementById("cep");
const addressField = document.getElementById("address");

// Segurança — evitar erro de null
if (!form || !userList) {
  console.error("Erro: elementos HTML não encontrados. Verifique os IDs no seu HTML.");
}

// --- Buscar endereço pelo CEP ---
cepInput.addEventListener("blur", async () => {
  const cep = cepInput.value.trim();
  if (cep.length === 8) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.logradouro) {
        addressField.value = `${data.logradouro}, ${data.bairro}, ${data.localidade}`;
      } else {
        alert("CEP não encontrado!");
        addressField.value = "";
      }
    } catch (error) {
      alert("Erro ao buscar CEP!");
      addressField.value = "";
    }
  } else {
    addressField.value = "";
  }
});

// --- Enviar dados para o Firestore ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const address = addressField.value.trim();

  if (!name || !email || !address) {
    alert("Por favor, preencha todos os campos!");
    return;
  }

  try {
    await db.collection("users").add({
      name,
      email,
      address,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("Usuário cadastrado com sucesso!");
    form.reset();
    addressField.value = "";

    showUsers();
  } catch (error) {
    console.error("Erro ao salvar no Firestore:", error);
  }
});

// --- Mostrar usuários cadastrados ---
async function showUsers() {
  if (!userList) return;

  userList.innerHTML = "<h3>Usuários cadastrados:</h3>";
  try {
    const snapshot = await db.collection("users").orderBy("timestamp", "desc").get();
    snapshot.forEach((doc) => {
      const user = doc.data();
      userList.innerHTML += `
        <p>
          <strong>${user.name}</strong> - ${user.email}<br>
          ${user.address}
        </p>`;
    });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
  }
}

// --- Carregar lista inicial ---
showUsers();
