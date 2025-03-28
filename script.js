        let db;
        const request = indexedDB.open("VeiculosDB", 1);

        request.onupgradeneeded = function (event) {
            db = event.target.result;
            const store = db.createObjectStore("veiculos", { keyPath: "id", autoIncrement: true });
            store.createIndex("montadora", "montadora", { unique: false });
            store.createIndex("nome", "nome", { unique: false });
            store.createIndex("ano_inicio", "ano_inicio", { unique: false });
            store.createIndex("ano_fim", "ano_fim", { unique: false });
            store.createIndex("cor", "cor", { unique: false });
        };

        request.onsuccess = function (event) {
            db = event.target.result;
            carregarFiltros();
        };

        // Função para carregar os filtros com dados salvos
        function carregarFiltros() {
            const tx = db.transaction(["veiculos"], "readonly");
            const store = tx.objectStore("veiculos");
            const allVehicles = store.getAll();

            allVehicles.onsuccess = function () {
                const veiculos = allVehicles.result;
                let montadoras = new Set();
                let nomes = new Set();
                let cores = new Set();

                veiculos.forEach(veiculo => {
                    montadoras.add(veiculo.montadora);
                    nomes.add(veiculo.nome);
                    cores.add(veiculo.cor);
                });

                preencherCampoSelect("busca_montadora", montadoras);
                preencherCampoSelect("busca_nome", nomes);
                preencherCampoSelect("busca_cor", cores);

                preencherCampoSelect("montadora", montadoras);
                preencherCampoSelect("nome", nomes);
                preencherCampoSelect("cor", cores);
            };
        }

        // Função para preencher os campos de seleção
        function preencherCampoSelect(campoId, opcoes) {
            const select = document.getElementById(campoId);
            select.innerHTML = "<option value=''>Selecione</option>";
            opcoes.forEach(opcao => {
                const option = document.createElement("option");
                option.value = opcao;
                option.text = opcao;
                select.appendChild(option);
            });
        }

        // Função para adicionar nova montadora
        function adicionarMontadora() {
            const novaMontadora = document.getElementById("nova_montadora").value;
            if (novaMontadora) {
                const tx = db.transaction(["veiculos"], "readwrite");
                const store = tx.objectStore("veiculos");
                store.add({ montadora: novaMontadora });

                tx.oncomplete = function () {
                    carregarFiltros();
                    alert("Montadora adicionada com sucesso!");
                    document.getElementById("nova_montadora").value = "";
                };

                tx.onerror = function () {
                    alert("Erro ao adicionar montadora.");
                };
            } else {
                alert("Digite o nome da montadora.");
            }
        }

        // Função para adicionar novo nome de veículo com verificação de duplicidade
        function adicionarNome() {
            const novoNome = document.getElementById("novo_nome").value;
            if (novoNome) {
                const tx = db.transaction(["veiculos"], "readonly");
                const store = tx.objectStore("veiculos");
                
                // Procurar se já existe um nome igual
                const index = store.index("nome");
                const request = index.get(novoNome);

                request.onsuccess = function () {
                    if (request.result) {
                        // Se o nome já existe, exibe um alerta
                        alert("Esse nome já foi cadastrado.");
                    } else {
                        // Se não existe, adiciona o novo nome
                        const txWrite = db.transaction(["veiculos"], "readwrite");
                        const storeWrite = txWrite.objectStore("veiculos");
                        storeWrite.add({ nome: novoNome });

                        txWrite.oncomplete = function () {
                            carregarFiltros();
                            alert("Nome de veículo adicionado com sucesso!");
                            document.getElementById("novo_nome").value = "";
                        };

                        txWrite.onerror = function () {
                            alert("Erro ao adicionar nome.");
                        };
                    }
                };

                request.onerror = function () {
                    alert("Erro ao verificar nome.");
                };
            } else {
                alert("Digite o nome do veículo.");
            }
        }

        // Função para adicionar nova cor
        function adicionarCor() {
            const novaCor = document.getElementById("nova_cor").value;
            if (novaCor) {
                const tx = db.transaction(["veiculos"], "readwrite");
                const store = tx.objectStore("veiculos");
                store.add({ cor: novaCor });

                tx.oncomplete = function () {
                    carregarFiltros();
                    alert("Cor adicionada com sucesso!");
                    document.getElementById("nova_cor").value = "";
                };

                tx.onerror = function () {
                    alert("Erro ao adicionar cor.");
                };
            } else {
                alert("Digite o nome da cor.");
            }
        }

        // Função para adicionar novo veículo
        function salvarVeiculo() {
            const montadora = document.getElementById("montadora").value;
            const nome = document.getElementById("nome").value;
            const ano_inicio = parseInt(document.getElementById("ano_inicio").value);
            const ano_fim = parseInt(document.getElementById("ano_fim").value);
            const cor = document.getElementById("cor").value;
            const codigo_cor = document.getElementById("codigo_cor").value;
            const codigo = document.getElementById("codigo").value;

            if (montadora && nome && ano_inicio && ano_fim && cor && codigo_cor && codigo) {
                const tx = db.transaction(["veiculos"], "readwrite");
                const store = tx.objectStore("veiculos");

                const veiculo = {
                    montadora,
                    nome,
                    ano_inicio,
                    ano_fim,
                    cor,
                    codigo_cor,
                    codigo
                };

                store.add(veiculo);

                tx.oncomplete = function () {
                    // Recarregar filtros
                    carregarFiltros();
                    // Recarregar apenas os veículos cadastrados agora
                    carregarVeiculosCadastrados();
                    // Limpar os campos após salvar
                    limparCamposCadastro();
                    alert("Veículo cadastrado com sucesso!");
                };

                tx.onerror = function () {
                    alert("Erro ao cadastrar veículo.");
                };
            } else {
                alert("Todos os campos são obrigatórios.");
            }
        }

        // Função para limpar os campos após o cadastro de veículo
        function limparCamposCadastro() {
            document.getElementById("montadora").value = "";
            document.getElementById("nome").value = "";
            document.getElementById("ano_inicio").value = "";
            document.getElementById("ano_fim").value = "";
            document.getElementById("cor").value = "";
            document.getElementById("codigo_cor").value = "";
            document.getElementById("codigo").value = "";
        }

        // Função para buscar os veículos
        function buscarVeiculos() {
            const montadora = document.getElementById("busca_montadora").value;
            const nome = document.getElementById("busca_nome").value;
            const ano = parseInt(document.getElementById("busca_ano").value);
            const cor = document.getElementById("busca_cor").value;

            const tx = db.transaction(["veiculos"], "readonly");
            const store = tx.objectStore("veiculos");
            const index = store.index("montadora");

            let query = store.openCursor();
            const resultado = [];
            
            query.onsuccess = function(event) {
                const cursor = event.target.result;
                if(cursor) {
                    const veiculo = cursor.value;
                    if (
                        (!montadora || veiculo.montadora === montadora) &&
                        (!nome || veiculo.nome === nome) &&
                        (!ano || veiculo.ano_inicio === ano || veiculo.ano_fim === ano) &&
                        (!cor || veiculo.cor === cor)
                    ) {
                        resultado.push(veiculo);
                    }
                    cursor.continue();
                } else {
                    exibirResultadoBusca(resultado);
                }
            };
        }

        // Função para exibir os resultados da busca
        function exibirResultadoBusca(veiculos) {
            const tbody = document.getElementById("resultado");
            tbody.innerHTML = "";
            veiculos.forEach(veiculo => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${veiculo.montadora}</td>
                    <td>${veiculo.nome}</td>
                    <td>${veiculo.ano_inicio}</td>
                    <td>${veiculo.ano_fim}</td>
                    <td>${veiculo.cor}</td>
                    <td>${veiculo.codigo_cor}</td>
                    <td>${veiculo.codigo}</td>
                `;
                tbody.appendChild(row);
            });
        }
          // Função para exportar os dados do banco de dados para um arquivo JSON
function exportarDados() {
    const tx = db.transaction(["veiculos"], "readonly");
    const store = tx.objectStore("veiculos");
    const allVehicles = store.getAll();

    allVehicles.onsuccess = function () {
        const veiculos = allVehicles.result;

        // Criando o arquivo JSON
        const dataStr = JSON.stringify(veiculos);
        const blob = new Blob([dataStr], { type: "application/json" });

        // Criando um link de download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "veiculos_backup.json";  // Nome do arquivo de backup
        link.click();
    };

    allVehicles.onerror = function () {
        alert("Erro ao exportar dados.");
    };
}

// Função para importar dados de um arquivo JSON
function importarDados() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json";
    
    // Quando o arquivo for selecionado
    fileInput.onchange = function (event) {
        const file = event.target.files[0];
        if (file && file.type === "application/json") {
            const reader = new FileReader();
            reader.onload = function (e) {
                const importedData = JSON.parse(e.target.result);

                // Adicionando os dados ao banco de dados
                const tx = db.transaction(["veiculos"], "readwrite");
                const store = tx.objectStore("veiculos");

                importedData.forEach(veiculo => {
                    store.add(veiculo);
                });

                tx.oncomplete = function () {
                    alert("Dados importados com sucesso!");
                    carregarFiltros();  // Recarregar filtros e dados
                };

                tx.onerror = function () {
                    alert("Erro ao importar dados.");
                };
            };
            reader.readAsText(file);
        } else {
            alert("Por favor, selecione um arquivo JSON válido.");
        }
    };

    fileInput.click();
}