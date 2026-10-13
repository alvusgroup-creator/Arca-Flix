import type { Metadata } from "next"
import { LegalPage } from "@/components/layout/legal-page"

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Condições de uso da plataforma Arca Flix.",
  alternates: { canonical: "/termos" },
}

export default function TermsPage() {
  return (
    <LegalPage title="Termos de Uso" updatedAt="13 de outubro de 2026">
      <p>
        Estes Termos regulam o uso do Arca Flix, serviço de streaming de conteúdo cristão para crianças e famílias,
        oferecido por <strong>66.554.010 Jonathan Fernandes</strong>, inscrita no CNPJ <strong>66.554.010/0001-87</strong>, com sede em{" "}
        <strong>Rua Nelsom Leme Sampaio, 67, Jardim Concha de Ouro, Jaú/SP, CEP 17203-490</strong> (&ldquo;Arca Flix&rdquo;). Ao criar uma conta você declara ter 18 anos ou mais e
        concordar com estes Termos.
      </p>

      <h2>1. Conta e perfis</h2>
      <ul>
        <li>A conta é pessoal do titular adulto, responsável por todos os perfis criados nela.</li>
        <li>Perfis infantis devem ser criados e supervisionados pelo responsável legal da criança.</li>
        <li>Mantenha sua senha e os PINs dos perfis em sigilo. Avise-nos em caso de uso não autorizado.</li>
      </ul>

      <h2>2. Assinatura e pagamento</h2>
      <ul>
        <li>O acesso ao catálogo exige uma assinatura ativa. Os planos, valores e limites de perfis e telas são os informados na página de Planos no momento da contratação.</li>
        <li>A cobrança é recorrente (mensal ou anual) e processada pelo Stripe. A assinatura renova automaticamente até ser cancelada.</li>
        <li>Você pode cancelar a qualquer momento em Configurações › Assinatura. O acesso continua até o fim do período já pago.</li>
        <li>Direito de arrependimento: contratações online podem ser canceladas em até 7 dias com reembolso integral, nos termos do art. 49 do Código de Defesa do Consumidor.</li>
      </ul>

      <h2>3. Uso permitido</h2>
      <ul>
        <li>O conteúdo é licenciado para uso pessoal e familiar, sem fins comerciais.</li>
        <li>Os materiais para colorir podem ser impressos para uso doméstico, em escolas dominicais e ministérios infantis sem cobrança de ingresso. Não é permitida a revenda.</li>
        <li>É proibido copiar, gravar, redistribuir ou contornar as proteções técnicas dos vídeos e áudios.</li>
      </ul>

      <h2>4. Conteúdo e disponibilidade</h2>
      <p>
        O catálogo pode mudar ao longo do tempo. Buscamos manter o serviço disponível de forma contínua, mas podem
        ocorrer interrupções para manutenção ou por fatores fora do nosso controle.
      </p>

      <h2>5. Encerramento</h2>
      <p>
        Você pode excluir a conta em Configurações › Privacidade. Podemos suspender contas que violem estes Termos,
        com aviso prévio sempre que possível.
      </p>

      <h2>6. Contato e foro</h2>
      <p>
        Dúvidas: <strong>contato@arcaflix.com.br</strong>. Estes Termos seguem a legislação brasileira; fica eleito o foro do
        domicílio do consumidor.
      </p>
    </LegalPage>
  )
}
