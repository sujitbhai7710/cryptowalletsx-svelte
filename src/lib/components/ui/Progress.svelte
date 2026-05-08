<script lang="ts">
  interface Props {
    value?: number;
    class?: string;
  }

  let { value = 0, class: className = '' }: Props = $props();
</script>

<div class="relative h-2 w-full overflow-hidden rounded-full bg-muted/50 {className}">
  <div
    class="h-full rounded-full bg-primary transition-all duration-300"
    style="width: {Math.min(value, 100)}%"
  ></div>
</div>
