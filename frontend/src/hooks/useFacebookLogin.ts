import { useEffect, useState } from 'react';

export const useFacebookLogin = (appId: string) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadFacebookSDK = () => {
      if ((window as any).FB) {
        setIsLoaded(true);
        return;
      }

      (window as any).fbAsyncInit = function () {
        (window as any).FB.init({
          appId: appId,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        setIsLoaded(true);
      };

      if (!document.getElementById('facebook-jssdk')) {
        const js = document.createElement('script');
        js.id = 'facebook-jssdk';
        js.src = 'https://connect.facebook.net/en_US/sdk.js';
        document.body.appendChild(js);
      }
    };

    loadFacebookSDK();
  }, [appId]);

  const login = (callback: (response: any) => void) => {
    if (!isLoaded || !(window as any).FB) {
      console.error('Facebook SDK not loaded');
      callback({ error: 'Facebook SDK chưa sẵn sàng. Vui lòng tắt trình chặn quảng cáo (Adblocker) và thử lại.' });
      return;
    }

    (window as any).FB.login((response: any) => {
      if (response.authResponse) {
        callback({ accessToken: response.authResponse.accessToken });
      } else {
        callback({ error: 'User cancelled login or did not fully authorize.' });
      }
    }, { scope: 'public_profile,email' });
  };

  return { login, isLoaded };
};
