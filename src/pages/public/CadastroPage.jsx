import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup'; 
import { cadastroSchema } from "../../utils/validationSchemas.js";
import './css/CadastroPage.css';

const ArrowLeft = () => (
  <svg width="28" height="28" fill="none" stroke="#52658F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}><polyline points="18 24 8 14 18 4"/></svg>
);

function CadastroPage() {
    const [mensagemApi, setMensagemApi] = useState("");
    const navigate = useNavigate();

    const { 
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue 
    } = useForm({
        resolver: yupResolver(cadastroSchema)
    });

    const handleTelefoneChange = (e) => {
        const input = e.target.value;
        const digits = input.replace(/\D/g, '');
        
        let masked = '';
        if (digits.length > 0) masked = `(${digits.substring(0, 2)}`;
        if (digits.length > 2) masked += `) ${digits.substring(2, 7)}`;
        if (digits.length > 7) masked += `-${digits.substring(7, 11)}`;
        
        setValue('telefone', masked, { shouldValidate: true });
    };

    // CORREÇÃO 1: Função para formatar o CPF
    const handleCpfChange = (e) => {
        const input = e.target.value;
        const digits = input.replace(/\D/g, ''); // Remove tudo que não é dígito

        let masked = '';
        if (digits.length > 0) masked = digits.substring(0, 3);
        if (digits.length > 3) masked += `.${digits.substring(3, 6)}`;
        if (digits.length > 6) masked += `.${digits.substring(6, 9)}`;
        if (digits.length > 9) masked += `-${digits.substring(9, 11)}`;

        setValue('cpf', masked, { shouldValidate: true });
    };

    // CORREÇÃO 2: Ajuste na função de submit para limpar o CPF também
    const onSubmit = async (data) => {
        setMensagemApi("");

        const dataToSend = {
            ...data,
            telefone: data.telefone.replace(/\D/g, ''),
            cpf: data.cpf.replace(/\D/g, '') // Remove a formatação do CPF
        };

        try {
            const response = await fetch("http://localhost:8080/auth/cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                setMensagemApi("Cadastro realizado com sucesso! Redirecionando...");
                setTimeout(() => navigate("/LoginPage"), 2000);
            } else {
                const erroTexto = await response.text();
                setMensagemApi(erroTexto || "Ocorreu um erro ao cadastrar.");
            }
        } catch {
            setMensagemApi("Não foi possível conectar ao servidor.");
        }
    };

    return (
      <div className="cadastro-bg">
        <button className="cadastro-back-btn" onClick={() => navigate("/login")} title="Voltar para login">
          <ArrowLeft />
        </button>
        <h1 className="cadastro-title-big">Cadastrar Novo Usuário</h1>
        <p className="cadastro-subtitle-center">
          Preencha os campos abaixo para criar sua conta
        </p>
        <div className="cadastro-card">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="cadastro-form-grid">
              <div className="cadastro-form-group">
                <label htmlFor="nomeCompleto" className="cadastro-label">Nome:</label>
                <input
                  type="text"
                  id="nomeCompleto"
                  {...register("nomeCompleto")}
                  className="cadastro-input"
                  placeholder="Nome completo"
                />
                {errors.nomeCompleto && <p className="cadastro-error">{errors.nomeCompleto.message}</p>}
              </div>

              {/* CORREÇÃO 3: Input de CPF atualizado */}
              <div className="cadastro-form-group">
                <label htmlFor="cpf" className="cadastro-label">CPF:</label>
                <input
                  type="text"
                  id="cpf"
                  {...register("cpf", {
                      onChange: handleCpfChange // Adiciona nosso manipulador
                  })}
                  className="cadastro-input"
                  placeholder="000.000.000-00"
                  maxLength="14" // Limita o tamanho do campo
                />
                {errors.cpf && <p className="cadastro-error">{errors.cpf.message}</p>}
              </div>
              
              <div className="cadastro-form-group">
                <label htmlFor="email" className="cadastro-label">Email:</label>
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  className="cadastro-input"
                  placeholder="email@exemplo.com"
                />
                {errors.email && <p className="cadastro-error">{errors.email.message}</p>}
              </div>
              
              <div className="cadastro-form-group">
                <label htmlFor="telefone" className="cadastro-label">Telefone:</label>
                <input
                  type="tel"
                  id="telefone"
                  {...register("telefone", {
                      onChange: handleTelefoneChange
                  })}
                  className="cadastro-input"
                  placeholder="(99) 99999-9999"
                  maxLength="15"
                />
                {errors.telefone && <p className="cadastro-error">{errors.telefone.message}</p>}
              </div>

              <div className="cadastro-form-group">
                <label htmlFor="senha" className="cadastro-label">Senha:</label>
                <input
                  type="password"
                  id="senha"
                  {...register("senha")}
                  className="cadastro-input"
                  placeholder="senha"
                />
                {errors.senha && <p className="cadastro-error">{errors.senha.message}</p>}
              </div>
              <div className="cadastro-form-group">
                <label htmlFor="confirmarSenha" className="cadastro-label">Confirmar senha:</label>
                <input
                  type="password"
                  id="confirmarSenha"
                  {...register("confirmarSenha")}
                  className="cadastro-input"
                  placeholder="Repita a senha"
                />
                {errors.confirmarSenha && <p className="cadastro-error">{errors.confirmarSenha.message}</p>}
              </div>
            </div>
            {mensagemApi && <p style={{ color: '#52658F', textAlign: 'center', marginTop: 12 }}>{mensagemApi}</p>}
            <button type="submit" disabled={isSubmitting} className="cadastro-btn">
              {isSubmitting ? "Cadastrando..." : "Salvar"}
            </button>
          </form>
        </div>
      </div>
    );
}

export default CadastroPage;