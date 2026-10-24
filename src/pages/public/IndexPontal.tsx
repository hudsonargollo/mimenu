import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, Search, Lock } from "lucide-react";
import logo from "/logo-pontal.webp";

const Index = () => {
  const navigate = useNavigate();

  // Initialize carousel with autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );

  // Carousel state
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // Update selected index when carousel scrolls
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Initialize scroll snaps
  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
  }, [emblaApi]);

  // Scroll to specific slide
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  // Auto-play pause and resume logic
  useEffect(() => {
    if (!emblaApi) return;

    const autoplay = emblaApi.plugins()?.autoplay;
    if (!autoplay) return;

    let resumeTimer: NodeJS.Timeout;

    const handleInteraction = () => {
      // Pause auto-play on user interaction
      autoplay.stop();

      // Clear any existing resume timer
      clearTimeout(resumeTimer);

      // Resume auto-play after 10 seconds of inactivity
      resumeTimer = setTimeout(() => {
        autoplay.play();
      }, 10000);
    };

    // Listen for user interactions
    emblaApi.on('pointerDown', handleInteraction);

    return () => {
      clearTimeout(resumeTimer);
      emblaApi.off('pointerDown', handleInteraction);
    };
  }, [emblaApi]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!emblaApi) return;

    if (event.key === 'ArrowLeft') {
      emblaApi.scrollPrev();
    } else if (event.key === 'ArrowRight') {
      emblaApi.scrollNext();
    }
  }, [emblaApi]);

  // Initial animation hint - trigger first slide after 2 seconds
  useEffect(() => {
    if (!emblaApi) return;

    const timer = setTimeout(() => {
      emblaApi.scrollNext();
    }, 2000);

    return () => clearTimeout(timer);
  }, [emblaApi]);

  return (
    <div className="min-h-screen bg-gradient-ocean md:bg-gradient-acai">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-16 text-center text-white">
          <img 
            src={logo} 
            alt="PONTAL Carapitangui" 
            className="h-24 sm:h-32 mx-auto mb-8 sm:mb-12 rounded-lg"
          />
          <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
            <Button
              size="lg"
              onClick={() => navigate("/menu")}
              className="h-auto py-6 sm:py-8 flex flex-col bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all rounded-2xl min-h-[120px] sm:min-h-[140px]"
            >
              <QrCode className="h-8 w-8 sm:h-10 sm:w-10 mb-2 sm:mb-3" />
              <span className="font-bold text-sm sm:text-base text-center">Fazer Pedido</span>
            </Button>
            <Button
              size="lg"
              onClick={() => navigate("/order-lookup")}
              className="h-auto py-6 sm:py-8 flex flex-col bg-accent text-white hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all rounded-2xl min-h-[120px] sm:min-h-[140px]"
            >
              <Search className="h-8 w-8 sm:h-10 sm:w-10 mb-2 sm:mb-3" />
              <span className="font-bold text-sm sm:text-base text-center">Consultar Pedido</span>
            </Button>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="h-auto py-6 sm:py-8 flex flex-col bg-secondary text-foreground hover:bg-secondary/90 shadow-lg hover:shadow-xl transition-all rounded-2xl min-h-[120px] sm:min-h-[140px] col-span-2"
            >
              <Lock className="h-8 w-8 sm:h-10 sm:w-10 mb-2 sm:mb-3" />
              <span className="font-bold text-sm sm:text-base text-center">Área Restrita</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-primary/20 py-8 sm:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-foreground">Como Funciona</h2>
          
          {/* Carousel Container */}
          <div 
            className="overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg" 
            ref={emblaRef}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="region"
            aria-label="Como Funciona carousel"
          >
            <div className="flex touch-pan-y -mx-2 sm:-mx-3">
              {/* Slide 1 - Fazer Pedido */}
              <div className="flex-[0_0_90%] sm:flex-[0_0_85%] min-w-0 px-2 sm:px-3">
                <Card className="p-6 sm:p-8 text-center shadow-lg hover:shadow-xl transition-all border-2 border-primary/20 rounded-2xl">
                  <div className="bg-primary w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <QrCode className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl mb-3 text-primary">Fazer Pedido</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Escaneia QR Code, informa nome e WhatsApp, faz o pedido, paga com PIX e recebe notificações
                  </p>
                </Card>
              </div>

              {/* Slide 2 - Consultar Pedido */}
              <div className="flex-[0_0_90%] sm:flex-[0_0_85%] min-w-0 px-2 sm:px-3">
                <Card className="p-6 sm:p-8 text-center shadow-lg hover:shadow-xl transition-all border-2 border-accent/20 rounded-2xl">
                  <div className="bg-accent w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl mb-3 text-primary">Consultar Pedido</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Acompanhe o status do seu pedido em tempo real
                  </p>
                </Card>
              </div>

              {/* Slide 3 - Área Restrita */}
              <div className="flex-[0_0_90%] sm:flex-[0_0_85%] min-w-0 px-2 sm:px-3">
                <Card className="p-6 sm:p-8 text-center shadow-lg hover:shadow-xl transition-all border-2 border-secondary/20 rounded-2xl">
                  <div className="bg-secondary w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-8 w-8 sm:h-10 sm:w-10 text-foreground" />
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl mb-3 text-primary">Área Restrita</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Acesso para garçons e gerentes gerenciarem pedidos e operações
                  </p>
                </Card>
              </div>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center items-center gap-2 mt-6">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollTo(index)}
                className={`transition-all rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  index === selectedIndex
                    ? 'bg-primary w-8 h-3'
                    : 'bg-primary/30 w-3 h-3'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === selectedIndex ? 'true' : 'false'}
              />
            ))}
          </div>
        </div>
      </div>


    </div>
  );
};

export default Index;
