import type { Metadata } from "next"
import { LegalPage } from "@/components/layout/legal-page"

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como o Arca Flix trata os dados da sua família, em conformidade com a LGPD.",
  alternates: { canonical: "/privacidade" },
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Política de Privacidade" updatedAt="13 de outubro de 2026">
      <p>
        Esta Política explica como <strong>66.554.010 Jonathan Fernandes</strong>, CNPJ 66.554.010/0001-87 (&ldquo;Arca Flix&rdquo;) trata dados pessoais, em
        conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018 — LGPD). Encarregado de dados (DPO):{" "}
        <strong>Jonathan Fernandes</strong>, <strong>contato@arcaflix.com.br</strong>.
      </p>

      <h2>1. Dados que coletamos</h2>
      <ul>
        <li><strong>Conta:</strong> nome, e-mail e senha (armazenada de forma criptografada pelo provedor de autenticação) ou, se você entrar com o Google, os dados descritos na seção 2.</li>
        <li><strong>Perfis:</strong> nome ou apelido, avatar, tipo de perfil e regras de controle parental. Não pedimos data de nascimento, foto ou documento de crianças.</li>
        <li><strong>Uso:</strong> histórico e progresso de visualização, Minha Lista, progresso de leitura e aparelhos conectados.</li>
        <li><strong>Pagamento:</strong> processado pelo Stripe. Não armazenamos números de cartão.</li>
      </ul>

      <h2>2. Login com Google</h2>
      <p>
        Se você escolher entrar com sua conta Google, recebemos do Google apenas o seu <strong>nome</strong>, o seu{" "}
        <strong>endereço de e-mail</strong> e a sua <strong>foto de perfil</strong>. Usamos esses dados somente para
        criar e identificar a sua conta no Arca Flix e para enviar comunicações sobre a conta. Não acessamos contatos,
        arquivos, e-mails ou qualquer outro dado da sua conta Google.
      </p>
      <p>
        Os dados recebidos do Google não são vendidos, não são usados para publicidade e não são compartilhados com
        terceiros, exceto com os fornecedores que operam o serviço (listados na seção 5). O uso de informações recebidas
        das APIs do Google segue a{" "}
        <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">
          Política de Dados do Usuário dos Serviços de API do Google
        </a>
        , incluindo os requisitos de Uso Limitado. Você pode remover o acesso do Arca Flix a qualquer momento em{" "}
        <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
          myaccount.google.com/permissions
        </a>{" "}
        e excluir a sua conta em Configurações › Privacidade.
      </p>

      <h2>3. Dados de crianças</h2>
      <p>
        Perfis infantis são criados e geridos pelo responsável titular da conta, que consente com o tratamento dos
        dados mínimos necessários para o funcionamento do perfil (art. 14 da LGPD). Dados de crianças nunca são usados
        para publicidade nem compartilhados para fins de marketing.
      </p>

      <h2>4. Para que usamos os dados</h2>
      <ul>
        <li>Prestar o serviço: login, perfis, retomar vídeos, recomendações dentro do catálogo.</li>
        <li>Cobrança e gestão da assinatura.</li>
        <li>Segurança, prevenção a fraudes e limite de telas simultâneas do plano.</li>
        <li>Comunicações sobre a conta e, se você permitir, novidades do catálogo.</li>
      </ul>

      <h2>5. Compartilhamento</h2>
      <p>
        Usamos fornecedores que tratam dados em nosso nome: Supabase (banco de dados e autenticação), Stripe
        (pagamentos), Bunny.net (entrega de vídeo), Resend (e-mails) e Vercel (hospedagem). Alguns operam fora do
        Brasil, com as salvaguardas previstas na LGPD.
      </p>

      <h2>6. Seus direitos</h2>
      <p>
        Você pode acessar, corrigir e apagar dados em Configurações, apagar o histórico de visualização a qualquer
        momento e excluir a conta em Configurações › Privacidade. Para outros pedidos previstos no art. 18 da LGPD,
        escreva para <strong>contato@arcaflix.com.br</strong>.
      </p>

      <h2>7. Retenção e segurança</h2>
      <p>
        Mantemos os dados enquanto a conta estiver ativa. Após a exclusão, os dados são apagados, exceto os que a lei
        obriga a guardar (por exemplo, registros fiscais de pagamento). O acesso é protegido por criptografia em
        trânsito e regras de acesso por usuário no banco de dados.
      </p>

      <h2>8. Cookies</h2>
      <p>
        Usamos apenas cookies essenciais: sessão de login e perfil selecionado. Não usamos cookies de publicidade.
      </p>
    </LegalPage>
  )
}
