<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'default' | 'sm' | 'icon';
    class?: string;
    onclick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    title?: string;
  }

  let { children, variant = 'default', size = 'default', class: className = '', onclick, disabled = false, type = 'button', title }: Props = $props();

  const variantClasses: Record<string, string> = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-border bg-transparent hover:bg-secondary/50',
    ghost: 'hover:bg-secondary/50 hover:text-foreground',
    destructive: 'bg-destructive text-white hover:bg-destructive/90',
  };

  const sizeClasses: Record<string, string> = {
    default: 'h-10 px-4 py-2',
    sm: 'h-7 px-3 text-xs gap-1',
    icon: 'h-10 w-10',
  };
</script>

<button
  {type}
  {disabled}
  {onclick}
  {title}
  class="inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 {variantClasses[variant]} {sizeClasses[size]} {className}"
>
  {#if children}
    {@render children()}
  {/if}
</button>
