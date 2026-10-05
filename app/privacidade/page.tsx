import type { Metadata } from "next"
import { LegalPage } from "@/components/layout/legal-page"

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como o Arca Flix trata os dados da sua família, em conformidade com a LGPD.",
  alternates: { canonical: "/privacidade" },
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Política de Privacidade" updatedAt="[data de publicação]">
      <p>
        Esta Política explica como <strong>[Razão social]</strong> (&ldquo;Arca Flix&rdquo;) trata dados pessoais, em
        conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018 — LGPD). Encarregado de dados (DPO):{" "}
        <strong>[nome]</strong>, <strong>[e-mail]</strong>.
      </p>

      <h2>1. Dados que coletamos</h2>
      <ul>
        <li><strong>Conta:</strong> nome, e-mail e senha (armazenada de forma criptografada pelo provedor de autenticação).</li>
        <li><strong>Perfis:</strong> nome ou apelido, avatar, tipo de perfil e regras de controle parental. Não pedimos data de nascimento, foto ou documento de crianças.</li>
        <li><strong>Uso:</strong> histórico e progresso de visualização, Minha Lista, progresso de leitura e aparelhos conectados.</li>
        <li><strong>Pagamento:</strong> processado pelo Stripe. Não armazenamos números de cartão.</li>
      </ul>

      <h2>2. Dados de crianças</h2>
      <p>
        Perfis infantis são criados e geridos pelo responsável titular da conta, que consente com o tratamento dos
        dados mínimos necessários para o funcionamento do perfil (art. 14 da LGPD). Dados de crianças nunca são usados
        para publicidade nem compartilhados para fins de marketing.
      </p>

      <h2>3. Para que usamos os dados</h2>
      <ul>
        <li>Prestar o serviço: login, perfis, retomar vídeos, recomendações dentro do catálogo.</li>
        <li>Cobrança e gestão da assinatura.</li>
        <li>Segurança, prevenção a fraudes e limite de telas simultâneas do plano.</li>
        <li>Comunicações sobre a conta e, se você permitir, novidades do catálogo.</li>
      </ul>

      <h2>4. Compartilhamento</h2>
      <p>
        Usamos fornecedores que tratam dados em nosso nome: Supabase (banco de dados e autenticação), Stripe
        (pagamentos), Bunny.net (entrega de vídeo), Resend (e-mails) e Vercel (hospedagem). Alguns operam fora do
        Brasil, com as salvaguardas previstas na LGPD.
      </p>

      <h2>5. Seus direitos</h2>
      <p>
        Você pode acessar, corrigir e apagar dados em Configurações, apagar o histórico de visualização a qualquer
        momento e excluir a conta em Configurações › Privacidade. Para outros pedidos previstos no art. 18 da LGPD,
        escreva para <strong>[e-mail]</strong>.
      </p>

      <h2>6. Retenção e segurança</h2>
      <p>
        Mantemos os dados enquanto a conta estiver ativa. Após a exclusão, os dados são apagados, exceto os que a lei
        obriga a guardar (por exemplo, registros fiscais de pagamento). O acesso é protegido por criptografia em
        trânsito e regras de acesso por usuário no banco de dados.
      </p>

      <h2>7. Cookies</h2>
      <p>
        Usamos apenas cookies essenciais: sessão de login e perfil selecionado. Não usamos cookies de publicidade.
      </p>
    </LegalPage>
  )
}
