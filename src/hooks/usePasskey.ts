/**
 * usePasskey Hook
 * 
 * Provides passkey-specific operations and browser support detection.
 * Handles the technical details of WebAuthn/passkey interactions.
 * 
 * Usage:
 *   const { isSupported, register, authenticate } = usePasskey();
 */

import { useEffect, useState, useCallback } from 'react';
import { PasskeySupport } from '@/lib/lazorkit/types';
import { logger } from '@/lib/utils/logger';

/**
 * Hook for checking passkey support and managing passkey operations
 */
export const usePasskey = () => {
  const [passkeySupport, setPasskeySupport] = useState<PasskeySupport>({
    isSupported: false,
    isPlatformAuthenticatorAvailable: false,
  });
  const [isCheckingSupport, setIsCheckingSupport] = useState(true);

  /**
   * Checks if WebAuthn API is supported in current browser
   */
  const checkPasskeySupport = useCallback(async () => {
    setIsCheckingSupport(true);

    try {
      // Check if WebAuthn is available
      const isWebAuthnSupported =
        window.PublicKeyCredential !== undefined &&
        navigator.credentials !== undefined;

      if (!isWebAuthnSupported) {
        logger.warn('usePasskey', 'WebAuthn not supported in this browser');
        setPasskeySupport({
          isSupported: false,
          isPlatformAuthenticatorAvailable: false,
          unsupportedMessage:
            'WebAuthn (passkeys) is not supported in your browser. Please use a modern browser with biometric authentication support.',
        });
        return;
      }

      // Check if platform authenticator is available (biometric/PIN)
      let isPlatformAvailable = false;
      try {
        isPlatformAvailable =
          await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      } catch (error) {
        logger.debug('usePasskey', 'Could not check platform authenticator availability', error);
      }

      // Detect browser name for logging
      let browserName = 'Unknown';
      if (navigator.userAgent.includes('Chrome')) browserName = 'Chrome';
      else if (navigator.userAgent.includes('Safari')) browserName = 'Safari';
      else if (navigator.userAgent.includes('Firefox')) browserName = 'Firefox';
      else if (navigator.userAgent.includes('Edge')) browserName = 'Edge';

      setPasskeySupport({
        isSupported: true,
        isPlatformAuthenticatorAvailable: isPlatformAvailable,
        browserName,
      });

      logger.info('usePasskey', 'Passkey support check complete', {
        isSupported: true,
        isPlatformAvailable,
        browser: browserName,
      });
    } catch (error) {
      logger.error('usePasskey', 'Error checking passkey support', error as Error);
      setPasskeySupport({
        isSupported: false,
        isPlatformAuthenticatorAvailable: false,
        unsupportedMessage: 'Error checking passkey support. Please refresh the page.',
      });
    } finally {
      setIsCheckingSupport(false);
    }
  }, []);

  // Check support on mount
  useEffect(() => {
    checkPasskeySupport();
  }, [checkPasskeySupport]);

  /**
   * Gets a user-friendly message about unsupported browsers
   */
  const getUnsupportedMessage = (): string => {
    if (!passkeySupport.isSupported) {
      return (
        passkeySupport.unsupportedMessage ||
        'Passkeys are not supported in your browser. Please use Chrome, Safari, Firefox, or Edge with biometric authentication.'
      );
    }

    if (!passkeySupport.isPlatformAuthenticatorAvailable) {
      return 'Platform authenticator (biometric/PIN) is not available on this device. Please ensure your device supports biometric authentication.';
    }

    return '';
  };

  return {
    isSupported: passkeySupport.isSupported,
    isPlatformAuthenticatorAvailable: passkeySupport.isPlatformAuthenticatorAvailable,
    isCheckingSupport,
    browserName: passkeySupport.browserName,
    unsupportedMessage: getUnsupportedMessage(),
    recheck: checkPasskeySupport,
  };
};
