import {
    Stepper,
    StepperContent,
    StepperIndicator,
    StepperItem,
    StepperNav,
    StepperPanel,
    StepperSeparator,
    StepperTitle,
    StepperTrigger,
} from '@/components/reui/stepper';
import { SetupSystem } from '@/components/setup/SetupSystem';
import { TermsOfService } from '@/components/setup/TermsOfService';
import { useInitialize } from '@/hooks/useInitialize';
import {
    CheckIcon,
    DatabaseZap,
    FileText,
    LoaderCircleIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';

const steps = [
    {
        title: '初期設定',
        icon: <DatabaseZap className="size-4" />,
    },
    {
        title: '利用規約同意',
        icon: <FileText className="size-4" />,
    },
];

export function InitializePage() {
    const { isSetupCompleted, isTermsAccepted } = useInitialize();
    const [currentStep, setCurrentStep] = useState(isSetupCompleted ? 2 : 1);

    if (isSetupCompleted && isTermsAccepted) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Stepper
            value={currentStep}
            onValueChange={setCurrentStep}
            indicators={{
                completed: <CheckIcon className="size-3.5" />,
                loading: <LoaderCircleIcon className="size-3.5 animate-spin" />,
            }}
            className="w-full max-w-xl space-y-8"
        >
            <StepperNav className="gap-3">
                {steps.map((step, index) => (
                    <StepperItem
                        key={index}
                        step={index + 1}
                        className="relative items-center"
                    >
                        <StepperTrigger
                            className="flex grow flex-col items-start justify-center gap-2.5"
                            asChild
                        >
                            <StepperIndicator className="data-[state=inactive]:border-border data-[state=inactive]:text-muted-foreground data-[state=completed]:bg-success size-8 border-2 data-[state=completed]:text-white data-[state=inactive]:bg-transparent">
                                {step.icon}
                            </StepperIndicator>
                            <div className="flex flex-col items-start gap-1">
                                <div className="text-muted-foreground text-[10px] font-semibold uppercase">
                                    Step {index + 1}
                                </div>
                                <StepperTitle className="group-data-[state=inactive]/step:text-muted-foreground text-start text-base font-semibold">
                                    {step.title}
                                </StepperTitle>
                            </div>
                        </StepperTrigger>

                        {steps.length > index + 1 && (
                            <StepperSeparator className="group-data-[state=completed]/step:bg-success absolute inset-x-0 start-9 top-4 m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-2rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none" />
                        )}
                    </StepperItem>
                ))}
            </StepperNav>

            <StepperPanel className="text-sm">
                <StepperContent
                    key={1}
                    value={1}
                    className="flex items-center justify-center"
                >
                    <SetupSystem />
                </StepperContent>
                <StepperContent
                    key={2}
                    value={2}
                    className="flex items-center justify-center"
                >
                    <TermsOfService />
                </StepperContent>
            </StepperPanel>
        </Stepper>
    );
}
