import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 16, md: 24, lg: 40 };
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3">
      <Loader2 size={sizes[size]} className="animate-spin text-primary-400" />
      {text && <p className="text-dark-400 text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
