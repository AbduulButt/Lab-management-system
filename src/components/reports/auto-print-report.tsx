"use client";

import { useEffect } from "react";

export default function AutoPrintReport() {
    useEffect(() => {
        const timer = window.setTimeout(() => {
            window.print();
        }, 500);

        return () => {
            window.clearTimeout(timer);
        };
    }, []);

    return null;
}