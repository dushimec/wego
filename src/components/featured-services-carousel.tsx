import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { serviceTypeDetails } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

export function FeaturedServicesCarousel() {
  return (
    <div className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Services</h2>
        <Carousel opts={{ loop: true }}>
            <CarouselContent>
                {serviceTypeDetails.map(service => (
                    <CarouselItem key={service.id} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                            <Card className="overflow-hidden">
                                <CardHeader className="p-0">
                                    <div className="relative h-48 w-full">
                                        <Image src={service.image} alt={service.name} layout="fill" objectFit="cover" />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <CardTitle className="mb-2">{service.name}</CardTitle>
                                    <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                                    <Button asChild>
                                        <Link href={`/browse?service=${service.id}`}>Explore</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    </div>
  );
}
