import { Logo } from "@/components/logo";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-start gap-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Your one-stop shop for car and driver rentals.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-muted-foreground hover:text-primary">Home</Link></li>
              <li><Link href="/browse" className="text-sm text-muted-foreground hover:text-primary">Browse</Link></li>
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
                <p>Kigali, Rwanda</p>
                <p>contact@wego.com</p>
                <p>+250 788 123 456</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              {/* Replace with actual social icons */}
              <Link href="#" className="text-muted-foreground hover:text-primary"><span className="sr-only">Facebook</span><svg>...</svg></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><span className="sr-only">Twitter</span><svg>...</svg></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><span className="sr-only">Instagram</span><svg>...</svg></Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between">
             <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                WeGo your value matters.
            </p>
             <p className="text-center text-sm text-muted-foreground md:text-left">
                © {new Date().getFullYear()} We Go. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
