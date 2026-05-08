export function truncateAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function weiToNative(weiValue: string, decimals: number = 18): string {
  const val = BigInt(weiValue || '0');
  if (val === BigInt(0)) return '0';
  const divisor = BigInt(10 ** decimals);
  const whole = val / divisor;
  const remainder = val % divisor;
  const decimalStr = remainder.toString().padStart(decimals, '0').slice(0, 6);
  let result = `${whole}.${decimalStr}`;
  const parts = result.split('.');
  if (parts.length === 2) {
    let dec = parts[1].replace(/0+$/, '');
    if (dec.length < 2) dec = dec.padEnd(2, '0');
    result = `${parts[0]}.${dec}`;
  }
  return result || '0';
}

export function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(decimals)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(decimals)}K`;
  return num.toFixed(decimals);
}

export function formatUSD(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num) || num === 0) return '$0.00';
  if (num < 0.01 && num > 0) return '<$0.01';
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

export function timeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 0) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
