<script lang="ts">
  import HomeScreen from '$lib/components/arc/HomeScreen.svelte';
  import { SIMPLECHAIN_CONFIG } from '$lib/utils/constants';

  interface Props {
    onAddressSubmit: (address: string) => void;
  }

  let { onAddressSubmit }: Props = $props();
</script>

<HomeScreen config={SIMPLECHAIN_CONFIG} {onAddressSubmit} />
