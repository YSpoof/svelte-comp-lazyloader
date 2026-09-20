<script lang="ts">
  let { onBack }: { onBack?: () => void } = $props();
</script>

<button type="button" onclick={onBack}>back</button>
