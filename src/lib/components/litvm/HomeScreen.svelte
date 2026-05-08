<script lang="ts">
  import HomeScreen from '$lib/components/arc/HomeScreen.svelte';
  import { LITVM_CONFIG } from '$lib/utils/constants';

  interface Props {
    onAddressSubmit: (address: string) => void;
  }

  let { onAddressSubmit }: Props = $props();
</script>

<HomeScreen config={LITVM_CONFIG} {onAddressSubmit} />
