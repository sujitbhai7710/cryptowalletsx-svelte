<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
    class?: string;
  }

  let { children, variant = 'default', class: className = '' }: Props = $props();

  const variantClasses: Record<string, string> = {
    default: 'bg-primary/15 text-primary border-primary/30',
    secondary: 'bg-secondary text-secondary-foreground border-border',
    outline: 'border-border text-foreground',
    destructive: 'bg-destructive/15 text-destructive border-destructive/30',
  };
</script>

<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border {variantClasses[variant]} {className}">
  {#if children}
    {@render children()}
  {/if}
</span>
