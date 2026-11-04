export const CLERK_PUBLISHABLE_KEY = (
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined
)?.trim();

export const isClerkConfigured = Boolean(
  CLERK_PUBLISHABLE_KEY && CLERK_PUBLISHABLE_KEY.startsWith('pk_')
);

/**
 * Clerk appearance is intentionally restrained: hairline card, 18px controls,
 * black primary action. It must disappear into the SciNexa shell.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: '#0a0a0a',
    colorText: '#0a0a0a',
    colorTextSecondary: '#737373',
    colorBackground: '#ffffff',
    colorInputBackground: '#f5f5f5',
    colorInputText: '#0a0a0a',
    colorNeutral: '#0a0a0a',
    colorDanger: '#e7000b',
    borderRadius: '18px',
    fontFamily: 'Geist, IBM Plex Sans Arabic, system-ui, sans-serif',
    fontSize: '14px',
  },
  elements: {
    rootBox: { width: '100%' },
    card: {
      boxShadow: 'none',
      border: '1px solid #e5e5e5',
      borderRadius: '24px',
      padding: '28px',
    },
    headerTitle: { letterSpacing: '-0.03em', fontWeight: 600 },
    headerSubtitle: { color: '#737373' },
    socialButtonsBlockButton: {
      border: '1px solid #e5e5e5',
      borderRadius: '18px',
      color: '#0a0a0a',
      fontWeight: 500,
    },
    formButtonPrimary: {
      background: '#0a0a0a',
      borderRadius: '18px',
      fontWeight: 500,
      fontSize: '14px',
      boxShadow: 'none',
    },
    formButtonPrimary__loading: { background: '#171717' },
    formFieldInput: {
      background: '#f5f5f5',
      border: '1px solid transparent',
      borderRadius: '18px',
      color: '#0a0a0a',
    },
    footerActionLink: { color: '#1d4ed8' },
    dividerLine: { background: '#e5e5e5' },
    dividerText: { color: '#737373' },
    identityPreviewEditButton: { color: '#1d4ed8' },
    formResendCodeLink: { color: '#1d4ed8' },
    otpCodeFieldInput: { borderRadius: '10px' },
  },
};
