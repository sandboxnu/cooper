import { WelcomeDialog } from "~/app/_components/onboarding/post-onboarding/welcome-dialog";

interface CoopPromptProps {
  firstName: string;
  onClick: () => void;
}

export function CoopPrompt({ firstName, onClick }: CoopPromptProps) {
  return (
    <WelcomeDialog
      heading={`Welcome to Cooper, ${firstName}!`}
      subheading="To get started, please leave a co-op review."
      buttonText="Take me there!"
      onClick={onClick}
    />
  );
}
