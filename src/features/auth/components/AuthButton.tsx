import { Button } from "@/components/ui/button";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { Loader2 } from "lucide-react";

type Provider = "google" | "github";

interface AuthButtonProps {
  provider: Provider;
  onClick: () => void;
  isLoading: boolean;
  className?: string;
}

export default function AuthButton({
  provider,
  onClick,
  isLoading,
  className = "",
}: AuthButtonProps) {
  const providerDetails = {
    google: {
      icon: <FaGoogle className="mr-2 h-4 w-4" />,
      label: "Google",
      color: "bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 dark:bg-zinc-800 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-700",
    },
    github: {
      icon: <FaGithub className="mr-2 h-4 w-4" />,
      label: "GitHub",
      color: "bg-[#24292e] hover:bg-[#2c3238] text-white border border-[#24292e]",
    },
  };

  const { icon, label, color } = providerDetails[provider];

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={`w-full ${color} flex items-center justify-center py-2 px-4 rounded-md transition-colors ${className}`}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        icon
      )}
      <span>{isLoading ? "Connecting..." : `Continue with ${label}`}</span>
    </Button>
  );
}