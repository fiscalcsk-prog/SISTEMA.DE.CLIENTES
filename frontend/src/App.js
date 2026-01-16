import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import Login from "@/paginas/Login";
import Dashboard from "@/paginas/Dashboard";
import CadastroCliente from "@/paginas/CadastroCliente";
import ListaClientes from "@/paginas/ListaClientes";
import ListaExClientes from "@/paginas/ListaExClientes";
import GerenciarUsuarios from "@/paginas/GerenciarUsuarios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;


function RotaProtegida({ children }) {
  const usuario = localStorage.getItem("usuario");
  return usuario ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <RotaProtegida>
                <Dashboard />
              </RotaProtegida>
            }
          />
          <Route
            path="/cadastro-cliente"
            element={
              <RotaProtegida>
                <CadastroCliente />
              </RotaProtegida>
            }
          />
          <Route
            path="/clientes"
            element={
              <RotaProtegida>
                <ListaClientes />
              </RotaProtegida>
            }
          />
          <Route
            path="/ex-clientes"
            element={
              <RotaProtegida>
                <ListaExClientes />
              </RotaProtegida>
            }
          />
          <Route
            path="/usuarios"
            element={
              <RotaProtegida>
                <GerenciarUsuarios />
              </RotaProtegida>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;