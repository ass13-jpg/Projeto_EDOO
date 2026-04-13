#include <iostream>
#include <string>
#include <vector>
#include <memory>
// Bibliotecas locais
#include "httplib.h"
#include "json.hpp"

using namespace std;
using json = nlohmann::json;

// ==========================================
// 1. CLASSE BASE ABSTRATA
// ==========================================
class DispositivoIoT {
protected:
    int id;
    string nome;
    string tipo;
    bool ligado;
    string comodo;
    int consumo_w;

public:
    DispositivoIoT(int id, string nome, string tipo, string comodo, int consumo) 
        : id(id), nome(nome), tipo(tipo), ligado(false), comodo(comodo), consumo_w(consumo) {}
    
    virtual ~DispositivoIoT() = default;

    virtual void alternarStatus() = 0;
    
    virtual json paraJSON() const {
        return {
            {"id", id},
            {"nome", nome},
            {"tipo", tipo},
            {"ligado", ligado},
            {"comodo", comodo},
            {"consumo_w", consumo_w}
        };
    }

    int getId() const { return id; }
};

// ==========================================
// 2. CLASSES DERIVADAS
// ==========================================
class LampadaSmart : public DispositivoIoT {
public:
    LampadaSmart(int id, string nome, string comodo) 
        : DispositivoIoT(id, nome, "luz", comodo, 12) {}

    void alternarStatus() override {
        ligado = !ligado;
        cout << "[Lâmpada] " << nome << " agora: " << (ligado ? "ON" : "OFF") << endl;
    }
};

class TermostatoSmart : public DispositivoIoT {
private:
    int temperatura;
public:
    TermostatoSmart(int id, string nome, string comodo) 
        : DispositivoIoT(id, nome, "termostato", comodo, 150), temperatura(22) {}

    void alternarStatus() override {
        ligado = !ligado;
        cout << "[Termostato] " << nome << " agora: " << (ligado ? "ON" : "OFF") << endl;
    }

    json paraJSON() const override {
        json j = DispositivoIoT::paraJSON();
        j["temperatura"] = temperatura;
        return j;
    }
};

// ==========================================
// 3. CLASSE GERENCIADORA
// ==========================================
class SmartHub {
private:
    vector<unique_ptr<DispositivoIoT>> dispositivos;

public:
    void adicionarDispositivo(unique_ptr<DispositivoIoT> disp) {
        dispositivos.push_back(move(disp));
    }

    json obterStatusGeral() const {
        json statusArray = json::array();
        for (const auto& disp : dispositivos) {
            statusArray.push_back(disp->paraJSON());
        }
        return statusArray;
    }

    bool alternarDispositivo(int id) {
        for (const auto& disp : dispositivos) {
            if (disp->getId() == id) {
                disp->alternarStatus();
                return true;
            }
        }
        return false;
    }
};

// ==========================================
// 4. SERVIDOR API
// ==========================================
int main() {
    SmartHub hub;
    
    // Cadastrando dados iniciais
    hub.adicionarDispositivo(make_unique<LampadaSmart>(1, "Luminária Principal", "Sala de Estar"));
    hub.adicionarDispositivo(make_unique<LampadaSmart>(2, "Abajur", "Quarto"));
    hub.adicionarDispositivo(make_unique<TermostatoSmart>(3, "Ar Condicionado", "Escritório"));

    httplib::Server svr;

    auto setup_cors = [](httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
    };

    svr.Options(R"(.*)", [&](const httplib::Request&, httplib::Response& res) {
        setup_cors(res);
    });

    // Rota GET: Ajustada para o contrato do React (smarthome.js)
    svr.Get("/api/status", [&](const httplib::Request&, httplib::Response& res) {
        setup_cors(res);
        
        json resposta;
        resposta["dispositivos"] = hub.obterStatusGeral();
        resposta["sensores"] = {
            {"temperatura", 24},
            {"umidade", 58},
            {"luminosidade", 340},
            {"co2", 412}
        };

        res.set_content(resposta.dump(), "application/json");
    });

    // Rota POST: Ajustada para /api/dispositivo/{id}/toggle
    svr.Post(R"(/api/dispositivo/(\d+)/toggle)", [&](const httplib::Request& req, httplib::Response& res) {
        setup_cors(res);
        int id = stoi(req.matches[1]);
        
        if (hub.alternarDispositivo(id)) {
            // O React geralmente espera receber o estado atualizado
            res.set_content(R"({"status": "sucesso", "id": )" + to_string(id) + R"(})", "application/json");
        } else {
            res.status = 404;
            res.set_content(R"({"erro": "Nao encontrado"})", "application/json");
        }
    });

    cout << "=== Servidor Smart Hub Rodando em http://localhost:8080 ===" << endl;
    svr.listen("0.0.0.0", 8080);

    return 0;
}