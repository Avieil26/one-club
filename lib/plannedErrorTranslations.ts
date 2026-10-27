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

const communityErrors: Record<DraftLocale, Record<string, string>> = {
  ar: {
    'Please sign in again.': 'يرجى تسجيل الدخول مجددًا.',
    'This session is full. Retry when a spot opens.': 'هذه الجلسة ممتلئة. حاول مجددًا عند توفر مكان.',
    'This activity has closed or already started. Refresh the list.': 'أُغلق هذا النشاط أو بدأ بالفعل. حدّث القائمة.',
    'Choose a platform allowed by the host.': 'اختر منصة يسمح بها المضيف.',
    'Only the host can do this.': 'يمكن للمضيف فقط تنفيذ هذا الإجراء.',
    'Choose a time 5 minutes to 90 days ahead, using the format shown.': 'اختر وقتًا بعد 5 دقائق وحتى 90 يومًا باستخدام التنسيق المعروض.',
    'Join the journey before posting progress.': 'انضم إلى الرحلة قبل نشر التقدم.',
    'Choose 1–6 different milestones, 3–100 characters each.': 'اختر من 1 إلى 6 مراحل مختلفة، يتراوح طول كل منها بين 3 و100 حرف.',
    'Close an existing activity before creating a new one.': 'أغلق نشاطًا موجودًا قبل إنشاء نشاط جديد.',
    'You can complete a session after its start time.': 'يمكنك إنهاء الجلسة بعد موعد بدايتها.',
    'Complete the weekly session before inviting the group to the next one.': 'أكمل الجلسة الأسبوعية قبل دعوة المجموعة إلى الجلسة التالية.',
    'Activity not found.': 'لم يُعثر على النشاط.',
  },
  'pt-BR': {
    'Please sign in again.': 'Entre novamente.',
    'This session is full. Retry when a spot opens.': 'Esta sessão está lotada. Tente novamente quando houver uma vaga.',
    'This activity has closed or already started. Refresh the list.': 'Esta atividade foi encerrada ou já começou. Atualize a lista.',
    'Choose a platform allowed by the host.': 'Escolha uma plataforma permitida pelo anfitrião.',
    'Only the host can do this.': 'Somente o anfitrião pode fazer isso.',
    'Choose a time 5 minutes to 90 days ahead, using the format shown.': 'Escolha um horário entre 5 minutos e 90 dias a partir de agora, usando o formato exibido.',
    'Join the journey before posting progress.': 'Participe da jornada antes de publicar o progresso.',
    'Choose 1–6 different milestones, 3–100 characters each.': 'Escolha de 1 a 6 marcos diferentes, com 3 a 100 caracteres cada.',
    'Close an existing activity before creating a new one.': 'Encerre uma atividade existente antes de criar outra.',
    'You can complete a session after its start time.': 'Você pode concluir uma sessão após o horário de início.',
    'Complete the weekly session before inviting the group to the next one.': 'Conclua a sessão semanal antes de convidar o grupo para a próxima.',
    'Activity not found.': 'Atividade não encontrada.',
  },
  es: {
    'Please sign in again.': 'Vuelve a iniciar sesión.',
    'This session is full. Retry when a spot opens.': 'Esta sesión está llena. Inténtalo de nuevo cuando haya una plaza.',
    'This activity has closed or already started. Refresh the list.': 'Esta actividad se ha cerrado o ya ha comenzado. Actualiza la lista.',
    'Choose a platform allowed by the host.': 'Elige una plataforma permitida por el anfitrión.',
    'Only the host can do this.': 'Solo el anfitrión puede hacer esto.',
    'Choose a time 5 minutes to 90 days ahead, using the format shown.': 'Elige una hora entre 5 minutos y 90 días a partir de ahora, con el formato indicado.',
    'Join the journey before posting progress.': 'Únete a la aventura antes de publicar tu progreso.',
    'Choose 1–6 different milestones, 3–100 characters each.': 'Elige entre 1 y 6 hitos diferentes, de 3 a 100 caracteres cada uno.',
    'Close an existing activity before creating a new one.': 'Cierra una actividad existente antes de crear otra.',
    'You can complete a session after its start time.': 'Puedes finalizar una sesión después de su hora de inicio.',
    'Complete the weekly session before inviting the group to the next one.': 'Completa la sesión semanal antes de invitar al grupo a la siguiente.',
    'Activity not found.': 'No se encontró la actividad.',
  },
};

export function plannedStructuredError(locale: DraftLocale, english: string): string | undefined {
  if (communityErrors[locale][english]) return communityErrors[locale][english];
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
