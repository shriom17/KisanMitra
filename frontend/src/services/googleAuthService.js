// Google OAuth Service using Google Identity Services (GIS)
// This fixes the "dpiframe_initialization_failed" error
class GoogleAuthService {
  constructor() {
    this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    this.isInitialized = false;
  }

  // Initialize Google Identity Services
  async init() {
    if (this.isInitialized) return Promise.resolve();

    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (window.google?.accounts?.id) {
        this.isInitialized = true;
        resolve();
        return;
      }

      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isInitialized = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  // Sign in with Google using popup
  async signIn() {
    try {
      if (!this.clientId) {
        return {
          success: false,
          error: 'Google login is not configured for this deployment.'
        };
      }
      await this.init();

      return new Promise((resolve) => {
        // Use the authorization code model with callback
        const client = window.google.accounts.oauth2.initCodeClient({
          client_id: this.clientId,
          scope: 'openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          ux_mode: 'popup',
          callback: async (response) => {
            if (response.error) {
              console.error('Google sign-in error:', response);
              resolve({
                success: false,
                error: response.error || 'Google sign-in failed'
              });
              return;
            }

            // Send the authorization code to backend
            // Backend will exchange it for tokens
            resolve({
              success: true,
              authCode: response.code
            });
          },
        });

        // Request authorization code
        client.requestCode();
      });
    } catch (error) {
      console.error('Google sign-in initialization error:', error);
      return {
        success: false,
        error: error.message || 'Google sign-in failed'
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
      return { success: true };
    } catch (error) {
      console.error('Google sign-out error:', error);
      return { success: false, error: 'Sign-out failed' };
    }
  }
}

export default new GoogleAuthService();