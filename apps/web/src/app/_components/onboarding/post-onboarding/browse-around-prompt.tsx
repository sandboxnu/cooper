import { WelcomeDialog } from "~/app/_components/onboarding/post-onboarding/welcome-dialog";

interface BrowseAroundPromptProps {
  firstName: string;
  onClick: () => void;
}

export function BrowseAroundPrompt({
  firstName,
  onClick,
}: BrowseAroundPromptProps) {
  return (
    <WelcomeDialog
      heading={`Welcome to Cooper, ${firstName}!`}
      subheading="Feel free to browse job reviews and search for companies you may be interested in."
      buttonText="Got it"
      onClick={onClick}
    />
  );
}
