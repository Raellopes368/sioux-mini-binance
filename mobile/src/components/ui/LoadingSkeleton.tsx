import { View } from 'react-native';

type LoadingSkeletonProps = {
  className?: string;
};

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <View
      className={[
        'animate-pulse rounded-2xl bg-white/10',
        className ?? 'h-20 w-full',
      ].join(' ')}
    />
  );
}
