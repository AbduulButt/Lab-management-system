export default function ReportFooter() {
    return (
        <footer className="mt-10 text-black">
            <div className="border-y border-black py-2 text-center text-[11px] font-medium">
                Electronically Verified Report, No Signature(s) Required.
            </div>

            <p className="mt-4 text-center text-[9px] leading-[1.25]">
                <span className="font-bold">NOTE:</span>{" "}
                All the tests are performed on the most advanced, highly
                sophisticated, appropriate, and state of the art instruments
                with highly sensitive chemicals under strict conditions and
                with all care and diligence. However, the above results are
                NOT the DIAGNOSIS and should be correlated with clinical
                findings, patient&apos;s history, signs and symptoms, and
                other diagnostic tests. Lab to lab variation may occur. This
                document is NEVER challengeable at any PLACE/COURT and in any
                CONDITION.
            </p>
        </footer>
    );
}