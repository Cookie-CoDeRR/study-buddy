/**
 * Generate initials from a name
 * @param name - Full name or any string
 * @returns Two-letter initials in uppercase
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return 'US';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return 'US';
  if (parts.length === 1) {
    return (parts[0][0] + parts[0][1] || parts[0][0]).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate a consistent color based on a string (name or user ID)
 * @param str - Input string
 * @returns Hex color code
 */
export function getColorFromString(str: string): string {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Sky Blue
    '#F8B88B', // Peach
    '#A8E6CF', // Light Green
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
