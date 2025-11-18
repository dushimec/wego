import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link 
      href="/" 
      className={cn("flex items-center gap-2", className)}
      data-test-id="logo"
    >
      <Image 
        src="https://res.cloudinary.com/drwi9cpdi/image/upload/v1760517967/weGo_mcux3i.jpg" 
        alt="WeGo Logo" 
        width={50} 
        height={10}
        priority
        className="rounded-full"
      />
    </Link>
  );
}
