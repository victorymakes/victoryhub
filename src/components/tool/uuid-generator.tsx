"use client";

import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const UuidGenerator: FC = () => {
    const [uuid, setUuid] = useState<string>("");

    const generate = () => {
        const newUuid = crypto.randomUUID();
        setUuid(newUuid);
    };

    const copy = async () => {
        if (uuid) await navigator.clipboard.writeText(uuid);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <Input readOnly value={uuid} className="flex-1" />
                <Button onClick={generate} variant="default">
                    Generate UUID
                </Button>
                <Button onClick={copy} variant="secondary" disabled={!uuid}>
                    Copy
                </Button>
            </div>
        </div>
    );
};
