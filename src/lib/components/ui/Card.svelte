<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
    class?: string;
  }

  let { children, class: className = '', ...rest }: Props = $props();
</script>

<div class="rounded-xl border border-border/40 bg-card/60 backdrop-blur card-hover-lift {className}" {...rest}>
  {@render children()}
</div>
