import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';

type Pending = {
  url: string;
  resolve: (url: string) => void;
  reject: (error: Error) => void;
};

let pending: Pending | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

/** Opens Google inside the app. The website address is never shown. */
export function requestInAppGoogleAuth(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    pending = { url, resolve, reject };
    emit();
  });
}

function isVercel(url: string) {
  return /vercel\.app/i.test(url);
}

function isAppReturn(url: string) {
  return url.startsWith('fc27israel://');
}

function hasAuthPayload(url: string) {
  return /(?:\?|&|#)(?:code|access_token|error_description|error)=/.test(url);
}

const BLOCK_SITE = `
  (function () {
    function scan() {
      try {
        var href = String(location.href || '');
        if (href.indexOf('vercel.app') !== -1 || href.indexOf('fc27israel://') === 0) {
          window.ReactNativeWebView.postMessage(href);
        }
      } catch (e) {}
    }
    scan();
    setInterval(scan, 250);
  })();
  true;
`;

const CHROME_MOBILE =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36';

export function GoogleAuthSheet() {
  const webRef = useRef<WebView>(null);
  const [session, setSession] = useState<Pending | null>(null);
  const [page, setPage] = useState('');

  useEffect(() => {
    const listener = () => {
      setSession(pending);
      setPage(pending?.url ?? '');
    };
    listeners.add(listener);
    listener();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  function close(error: Error) {
    const current = pending;
    pending = null;
    setSession(null);
    current?.reject(error);
  }

  function finish(url: string) {
    const current = pending;
    pending = null;
    setSession(null);
    current?.resolve(url);
  }

  function take(url: string): boolean {
    if (isAppReturn(url) || (hasAuthPayload(url) && (isVercel(url) || isAppReturn(url)))) {
      finish(url);
      return false;
    }
    if (isVercel(url)) {
      close(new Error('ההתחברות לא הושלמה. נסו שוב.'));
      return false;
    }
    return true;
  }

  function onRequest(event: { url: string }) {
    if (isVercel(event.url) || isAppReturn(event.url) || event.url.startsWith('intent:')) {
      webRef.current?.stopLoading();
      take(event.url);
      return false;
    }
    return true;
  }

  function onNav(nav: WebViewNavigation) {
    if (isVercel(nav.url) || isAppReturn(nav.url)) {
      webRef.current?.stopLoading();
      take(nav.url);
    }
  }

  if (!session) return null;

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={() => close(new Error('התחברות עם גוגל בוטלה'))}>
      <View style={{ flex: 1, backgroundColor: '#0B1218' }}>
        <View
          style={{
            paddingTop: 48,
            paddingBottom: 12,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0B1218',
          }}
        >
          <Pressable onPress={() => close(new Error('התחברות עם גוגל בוטלה'))} hitSlop={12}>
            <Text style={{ color: '#F7F4EA', fontSize: 22, fontWeight: '700' }}>×</Text>
          </Pressable>
          <Text style={{ color: '#F7F4EA', fontSize: 16, fontWeight: '800' }}>התחברות עם Google</Text>
          <View style={{ width: 22 }} />
        </View>
        <WebView
          ref={webRef}
          source={{ uri: page || session.url }}
          userAgent={CHROME_MOBILE}
          injectedJavaScriptBeforeContentLoaded={BLOCK_SITE}
          originWhitelist={['*']}
          setSupportMultipleWindows={false}
          thirdPartyCookiesEnabled
          sharedCookiesEnabled
          domStorageEnabled
          javaScriptEnabled
          onShouldStartLoadWithRequest={onRequest}
          onNavigationStateChange={onNav}
          onMessage={(event) => {
            take(event.nativeEvent.data);
          }}
          onOpenWindow={(event) => {
            const next = event.nativeEvent.targetUrl;
            if (take(next)) setPage(next);
          }}
          style={{ flex: 1, backgroundColor: '#0B1218' }}
        />
      </View>
    </Modal>
  );
}
