// Draft translations for the structured errors produced by errorLocalization.ts.
// Unknown errors remain subject to the rollout coverage review.
type DraftLocale = 'ar' | 'pt-BR' | 'es';
const fields: Record<DraftLocale, Record<string, string>> = {
  ar: {
    Title: 'العنوان', Rules: 'القواعد', 'Proof requirements': 'متطلبات الإثبات',
    'Player or club name': 'اسم اللاعب أو النادي', Description: 'الوصف', Text: 'النص',
    Comment: 'التعليق', Name: 'الاسم', Message: 'الرسالة', Gamertag: 'اسم المستخدم',
    'Listing purpose': 'غرض الإعلان', Position: 'المركز', Platform: 'المنصة', Region: 'المنطقة',
  },
  'pt-BR': {
    Title: 'título', Rules: 'regras', 'Proof requirements': 'requisitos de comprovação',
    'Player or club name': 'nome do jogador ou clube', Description: 'descrição', Text: 'texto',
    Comment: 'comentário', Name: 'nome', Message: 'mensagem', Gamertag: 'nome de jogador',
    'Listing purpose': 'objetivo do anúncio', Position: 'posição', Platform: 'plataforma', Region: 'região',
  },
  es: {
    Title: 'título', Rules: 'reglas', 'Proof requirements': 'requisitos de prueba',
    'Player or club name': 'nombre del jugador o club', Description: 'descripción', Text: 'texto',
    Comment: 'comentario', Name: 'nombre', Message: 'mensaje', Gamertag: 'nombre de jugador',
    'Listing purpose': 'objetivo del anuncio', Position: 'posición', Platform: 'plataforma', Region: 'región',
  },
};

export function plannedStructuredError(locale: DraftLocale, english: string): string | undefined {
  const required = /^(.*) is required$/.exec(english);
  const tooLong = /^(.*) is too long$/.exec(english);
  const field = fields[locale][(required ?? tooLong)?.[1] ?? ''];
  if (field && required) return locale === 'ar' ? `الحقل المطلوب: ${field}` : locale === 'pt-BR' ? `Campo obrigatório: ${field}` : `Campo obligatorio: ${field}`;
  if (field && tooLong) return locale === 'ar' ? `الحقل طويل جدًا: ${field}` : locale === 'pt-BR' ? `Campo longo demais: ${field}` : `Campo demasiado largo: ${field}`;
  const screenshots = /^Upload (\d+) screenshots$/.exec(english);
  if (screenshots) {
    const count = screenshots[1];
    return locale === 'ar' ? `عدد لقطات الشاشة المطلوب رفعها: ${count}` : locale === 'pt-BR' ? `Capturas de tela a enviar: ${count}` : `Capturas de pantalla que debes subir: ${count}`;
  }
  return undefined;
}
