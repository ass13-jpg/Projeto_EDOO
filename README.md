# 🏠 SmartHome.sim - Sistema de Automação IoT

Este projeto é um simulador de casa inteligente que integra um **Backend robusto em C++** focado em Programação Orientada a Objetos (POO) com um **Frontend moderno em React**. O sistema permite monitorar sensores ambientais e controlar o status de dispositivos em tempo real através de uma API REST.

---

## 🚀 Tecnologias Utilizadas

### **Backend (O Cérebro)**
* **Linguagem:** C++14/17
* **Servidor HTTP:** [cpp-httplib](https://github.com/yhirose/cpp-httplib) (Lightweight library)
* **JSON:** [nlohmann/json](https://github.com/nlohmann/json) para serialização de dados.
* **Conceitos de POO Aplicados:** * **Herança e Polimorfismo:** Classes base abstratas para dispositivos.
    * **Smart Pointers (`unique_ptr`):** Gerenciamento eficiente de memória.
    * **Encapsulamento:** Proteção de estados internos dos sensores.

### **Frontend (A Interface)**
* **Framework:** React + Vite
* **Estilização:** Tailwind CSS (Design responsivo e Dark Mode)
* **Comunicação:** Fetch API para consumo de dados assíncronos.

---

## 🏗️ Arquitetura do Sistema

O projeto segue o modelo **Cliente-Servidor**:
1.  O **Servidor C++** escuta na porta `8080`, gerencia a lógica de negócios e mantém os dispositivos na memória.
2.  O **Frontend React** consome o endpoint `/api/status` para renderizar o dashboard.
3.  As ações de ligar/desligar dispositivos são enviadas via comandos `POST`, processadas logicamente no C++ e refletidas instantaneamente na interface.



---

## 🔧 Como Rodar o Projeto

### 1. Requisitos
* Compilador G++ (MinGW-w64/MSYS2 recomendado).
* Node.js instalado (para o Frontend).

![Dashboard](./assets/print1.png)
![Dashboard](./assets/print2.png)

### 2. Configurando o Backend
```bash
cd Backend
# Compilar o servidor
g++ main.cpp -o smarthub.exe -std=c++14 -lws2_32
# Executar
./smarthub.exe