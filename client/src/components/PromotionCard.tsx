import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Percent, Gift, Hand } from "lucide-react";

interface PromotionCardProps {
  title: string;
  description: string;
  icon: "clock" | "percent" | "gift" | "hand";
  color: "red" | "gold" | "purple" | "green";
  buttonText: string;
  onClick?: () => void;
}

export default function PromotionCard({ 
  title, 
  description, 
  icon, 
  color, 
  buttonText,
  onClick 
}: PromotionCardProps) {
  const getIcon = () => {
    const iconProps = { className: "h-8 w-8" };
    
    switch (icon) {
      case "clock":
        return <Clock {...iconProps} />;
      case "percent":
        return <Percent {...iconProps} />;
      case "gift":
        return <Gift {...iconProps} />;
      case "hand":
        return <Hand {...iconProps} />;
      default:
        return <Gift {...iconProps} />;
    }
  };

  const getGradientClasses = () => {
    switch (color) {
      case "red":
        return "bg-gradient-to-br from-cinepolis-red to-red-700 text-white";
      case "gold":
        return "bg-gradient-to-br from-cinepolis-gold to-yellow-600 text-cinema-dark";
      case "purple":
        return "bg-gradient-to-br from-purple-600 to-purple-800 text-white";
      case "green":
        return "bg-gradient-to-br from-green-600 to-green-800 text-white";
      default:
        return "bg-gradient-to-br from-cinepolis-red to-red-700 text-white";
    }
  };

  const getButtonClasses = () => {
    switch (color) {
      case "red":
        return "bg-white text-cinepolis-red hover:bg-gray-100";
      case "gold":
        return "bg-cinema-dark text-white hover:bg-gray-800";
      case "purple":
        return "bg-white text-purple-600 hover:bg-gray-100";
      case "green":
        return "bg-white text-green-600 hover:bg-gray-100";
      default:
        return "bg-white text-cinepolis-red hover:bg-gray-100";
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior - could navigate to promotions page
      console.log(`Clicked on ${title} promotion`);
    }
  };

  return (
    <Card className={`${getGradientClasses()} border-0 overflow-hidden hover:shadow-xl transition-shadow duration-300`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Icon */}
          <div className="mb-4">
            {color === "gold" ? (
              <div className="text-cinema-dark">
                {getIcon()}
              </div>
            ) : (
              <div className="text-cinepolis-gold">
                {getIcon()}
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              {title}
            </h3>
            <p className="text-sm opacity-90">
              {description}
            </p>
          </div>
          
          {/* Action Button */}
          <Button 
            className={`${getButtonClasses()} font-semibold transition-colors w-full`}
            onClick={handleClick}
          >
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
