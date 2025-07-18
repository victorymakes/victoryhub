import { FC } from "react";
import { UuidGenerator } from "./uuid-generator";
import { TimestampConverter } from "./timestamp-converter";

interface ToolComponentProps {
    id: string;
}

export const ToolComponent: FC<ToolComponentProps> = ({ id }) => {
    switch (id) {
        case "uuid-generator":
            return <UuidGenerator />;
        case "timestamp-converter":
            return <TimestampConverter />;
        default:
            return (
                <p className="text-muted-foreground text-sm">
                    This tool is under construction.
                </p>
            );
    }
};
