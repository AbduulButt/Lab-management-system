type ReportHeaderProps = {
    logoPath?: string | null;
};

export default function ReportHeader({
    logoPath,
}: ReportHeaderProps) {
    return (
        <header className="report-header border-b-2 border-slate-300 pb-2">
            <div className="grid grid-cols-[120px_1fr_120px] items-center">
                <div className="flex justify-center">
                    {logoPath ? (
                        <img
                            src={logoPath}
                            alt="Life Care Lab logo"
                            className="h-[92px] w-[92px] object-contain"
                        />
                    ) : (
                        <div className="flex h-[92px] w-[92px] items-center justify-center rounded-full border-4 border-red-600 text-4xl font-black text-red-600">
                            +
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <h1
                        className="font-sans text-[40px] font-bold leading-none tracking-tight text-red-600"
                        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                    >
                        Life Care Lab
                    </h1>

                    <p
                        className="mt-2 text-[17px] font-semibold uppercase tracking-[0.06em] text-indigo-800"
                        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                    >
                        OPP. NADRA OFFICE, STADIUM ROAD, DASKA
                    </p>

                    <p
                        className="mt-1 text-[14px] font-medium text-indigo-800"
                        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                    >
                        Mobile: 03123710892 Email: lifecarelab560@gmail.com
                    </p>
                </div>

                <div aria-hidden="true" />
            </div>
        </header>
    );
}