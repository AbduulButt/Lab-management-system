"use client";

type IconProps = {
    className?: string;
};

function IconBase({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-8 w-8 ${className}`}
        >
            {children}
        </svg>
    );
}

function MicroscopeIcon(_: IconProps) {
    return (
        <IconBase>
            <path d="M6 19h12" />
            <path d="M9 19v-3" />
            <path d="M15 19v-4" />
            <path d="M10 3h4v5h-4z" />
            <path d="M12 8v3a4 4 0 0 0 4 4h1" />
            <path d="M8 6H5v4a4 4 0 0 0 4 4h1" />
        </IconBase>
    );
}

function TestTubeIcon(_: IconProps) {
    return (
        <IconBase>
            <path d="M9 3h6" />
            <path d="M10 3v6l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3" />
            <path d="M8 14h8" />
        </IconBase>
    );
}

function StethoscopeIcon(_: IconProps) {
    return (
        <IconBase>
            <path d="M6 3v6a4 4 0 0 0 8 0V3" />
            <path d="M6 3H4" />
            <path d="M14 3h2" />
            <path d="M14 12v2a4 4 0 0 0 8 0v-1" />
            <circle cx="20" cy="11" r="2" />
        </IconBase>
    );
}

function SyringeIcon(_: IconProps) {
    return (
        <IconBase>
            <path d="M14 4l6 6" />
            <path d="M16 2l6 6" />
            <path d="M8 10l6 6" />
            <path d="M3 21l5-5" />
            <path d="M6 18l-2-2 8-8 4 4-8 8z" />
        </IconBase>
    );
}

function PetriDishIcon(_: IconProps) {
    return (
        <IconBase>
            <ellipse cx="12" cy="12" rx="8" ry="5" />
            <path d="M4 12v3c0 3 16 3 16 0v-3" />
            <path d="M9 11h.01" />
            <path d="M14 13h.01" />
            <path d="M16 10h.01" />
        </IconBase>
    );
}

function SampleRackIcon(_: IconProps) {
    return (
        <IconBase>
            <path d="M4 18h16" />
            <path d="M6 18v-7h12v7" />
            <path d="M8 11V5h3v6" />
            <path d="M13 11V5h3v6" />
            <path d="M7 8h4" />
            <path d="M12 8h4" />
        </IconBase>
    );
}

function MedicalTool({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="medical-tool-box">
            {children}
        </div>
    );
}

function SampleVial() {
    return (
        <div className="medical-vial">
            <div className="medical-vial-cap" />
            <div className="medical-vial-shine" />
        </div>
    );
}

export default function AnimatedMedicalBackground() {
    return (
        <div
            aria-hidden="true"
            className="medical-background pointer-events-none fixed inset-0 z-0 overflow-hidden"
        >
            <div className="medical-glow medical-glow-one" />
            <div className="medical-glow medical-glow-two" />
            <div className="medical-glow medical-glow-three" />

            <span className="medical-particle particle-one" />
            <span className="medical-particle particle-two" />
            <span className="medical-particle particle-three" />
            <span className="medical-particle particle-four" />
            <span className="medical-particle particle-five" />
            <span className="medical-particle particle-six" />

            <div className="medical-blood-drop blood-drop-one" />
            <div className="medical-blood-drop blood-drop-two" />

            <div className="medical-position tool-one">
                <MedicalTool>
                    <MicroscopeIcon />
                </MedicalTool>
            </div>

            <div className="medical-position tool-two">
                <MedicalTool>
                    <TestTubeIcon />
                </MedicalTool>
            </div>

            <div className="medical-position tool-three">
                <MedicalTool>
                    <StethoscopeIcon />
                </MedicalTool>
            </div>

            <div className="medical-position tool-four">
                <MedicalTool>
                    <SyringeIcon />
                </MedicalTool>
            </div>

            <div className="medical-position tool-five">
                <MedicalTool>
                    <PetriDishIcon />
                </MedicalTool>
            </div>

            <div className="medical-position tool-six">
                <MedicalTool>
                    <SampleRackIcon />
                </MedicalTool>
            </div>

            <div className="medical-position vial-one">
                <SampleVial />
            </div>

            <div className="medical-position vial-two">
                <SampleVial />
            </div>

            <div className="medical-position vial-three">
                <SampleVial />
            </div>

            <svg
                className="medical-dna"
                viewBox="0 0 240 520"
                fill="none"
            >
                <path
                    d="M70 10C175 75 64 120 170 185C276 250 60 310 170 380C238 424 146 486 80 510"
                    stroke="#1d4ed8"
                    strokeWidth="8"
                    strokeLinecap="round"
                />

                <path
                    d="M170 10C64 75 175 120 70 185C-35 250 180 310 70 380C2 424 94 486 160 510"
                    stroke="#0891b2"
                    strokeWidth="8"
                    strokeLinecap="round"
                />

                <g
                    stroke="#0f172a"
                    strokeWidth="4"
                    opacity="0.75"
                >
                    <path d="M85 48H155" />
                    <path d="M68 105H172" />
                    <path d="M83 166H157" />
                    <path d="M70 226H170" />
                    <path d="M76 288H164" />
                    <path d="M72 350H168" />
                    <path d="M82 414H158" />
                    <path d="M92 474H148" />
                </g>
            </svg>

            <svg
                className="medical-ecg"
                viewBox="0 0 900 130"
                fill="none"
            >
                <path
                    d="M0 72H160L195 72L220 35L250 110L285 20L325 72H900"
                    stroke="#b91c1c"
                    strokeWidth="8"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
}