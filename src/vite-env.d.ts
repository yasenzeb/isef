/// <reference types="vite/client" />

declare namespace JSX {
  interface IntrinsicElements {
    'fish-agent': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        'agent-id'?: string;
        'server-url'?: string;
        'user-id'?: string;
        'language'?: string;
        'agent-name'?: string;
        'greeting'?: string;
        'transcript'?: string | boolean;
        'text-input'?: string | boolean;
        'mic-muting'?: string | boolean;
        'class'?: string;
        'style'?: React.CSSProperties | string;
      },
      HTMLElement
    >;
  }
}
