export type NoticeButton = {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export type Notice = {
  id: number;
  title: string;
  message: string;
  buttons: NoticeButton[];
};

let listener: ((notice: Notice | null) => void) | null = null;

export function subscribeNotice(next: (notice: Notice | null) => void) {
  listener = next;
  return () => {
    if (listener === next) listener = null;
  };
}

export function presentNotice(title: string, message?: string, buttons?: NoticeButton[]) {
  listener?.({
    id: Date.now(),
    title,
    message: message ?? '',
    buttons: buttons?.length ? buttons : [{ text: 'הבנתי' }],
  });
}

export function dismissNotice() {
  listener?.(null);
}
