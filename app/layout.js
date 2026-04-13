export const metadata = {
  title: "Agente de Briefing + MKTCloud | EQI Investimentos",
  description: "Cria briefing completo e fluxo de Journey Builder para campanhas EQI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
