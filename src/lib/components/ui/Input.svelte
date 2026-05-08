<script lang="ts">
  interface Props {
    value?: string;
    placeholder?: string;
    class?: string;
    oninput?: (e: Event) => void;
    onkeydown?: (e: KeyboardEvent) => void;
    type?: string;
  }

  let { value = '', placeholder = '', class: className = '', oninput, onkeydown, type = 'text' }: Props = $props();
</script>

<input
  {type}
  {value}
  {placeholder}
  {oninput}
  {onkeydown}
  class="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 {className}"
/>
