import { resolveAvatar, type AvatarData } from '@/lib/utils/avatar';
import { cn } from '@/lib/utils/cn';

/**
 * Avatar reusable · círculo blanco con emoji sobre fondo de color.
 *
 * Diseño:
 *  - Anillo blanco (ring) que separa visualmente
 *  - Fondo del color seleccionado
 *  - Emoji centrado, tamaño escalado al sizing prop
 */
interface AvatarProps {
  data?: Partial<AvatarData> | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  title?: string;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[14px]',
  sm: 'w-8 h-8 text-[18px]',
  md: 'w-10 h-10 text-[22px]',
  lg: 'w-16 h-16 text-[34px]',
  xl: 'w-24 h-24 text-[52px]',
};

export function Avatar({ data, size = 'md', className, title }: AvatarProps) {
  const { emoji, color } = resolveAvatar(data);
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full ring-2 ring-bg shadow-sm leading-none select-none',
        SIZE_CLASSES[size],
        className
      )}
      style={{ backgroundColor: color }}
      title={title}
      aria-label={title}
    >
      <span aria-hidden>{emoji}</span>
    </div>
  );
}

/**
 * Avatar inline con nombre · útil en filas, headers, comentarios.
 */
export function AvatarWithName({
  data,
  name,
  size = 'sm',
  className,
}: AvatarProps & { name: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Avatar data={data} size={size} title={name} />
      <span>{name}</span>
    </span>
  );
}
